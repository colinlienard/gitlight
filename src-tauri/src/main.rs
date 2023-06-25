#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};
use tauri_plugin_autostart::MacosLauncher;

#[tauri::command]
fn update_tray(
    app_handle: tauri::AppHandle,
    title: Option<String>,
    description: Option<String>,
    new_icon: Option<bool>,
) {
    let tray_handle = app_handle.tray_handle();
    #[cfg(target_os = "macos")]
    if let Some(title) = title {
        tray_handle.set_title(&title).unwrap();
    }
    if let Some(description) = description {
        tray_handle.get_item("text").set_title(description).unwrap();
    }
    if let Some(new_icon) = new_icon {
        if new_icon {
            tray_handle
                .set_icon(tauri::Icon::Raw(
                    include_bytes!("../icons/tray-new.png").to_vec(),
                ))
                .unwrap();
        } else {
            tray_handle
                .set_icon(tauri::Icon::Raw(
                    include_bytes!("../icons/tray-base.png").to_vec(),
                ))
                .unwrap();
        }
    }
}

fn main() {
    tauri_plugin_deep_link::prepare("de.fabianlars.deep-link-test");

    let title = CustomMenuItem::new("title".to_string(), "GitHub notifications").disabled();
    let text = CustomMenuItem::new("text".to_string(), "1 pinned • 2 unread");
    let focus = CustomMenuItem::new("focus".to_string(), "Dashboard");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(title)
        .add_item(text)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(focus)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            tauri_plugin_deep_link::register("gitlight", move |request| {
                handle.emit_all("scheme-request", request).unwrap();
            })
            .unwrap();

            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                app.emit_all("scheme-request", url).unwrap();
            }

            Ok(())
        })
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![""]),
        ))
        .system_tray(tray)
        .on_system_tray_event(|app, event| {
            if let SystemTrayEvent::MenuItemClick { id, .. } = event {
                match id.as_str() {
                    "text" | "focus" => {
                        let window = app.get_window("main").unwrap();
                        window.set_focus().unwrap();
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                }
            }
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                #[cfg(not(target_os = "macos"))]
                event.window().hide().unwrap();

                #[cfg(target_os = "macos")]
                tauri::AppHandle::hide(&event.window().app_handle()).unwrap();

                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![update_tray])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}
