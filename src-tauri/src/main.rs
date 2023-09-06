#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_positioner::{Position, WindowExt};

mod commands;
mod title_bar;

fn main() {
    tauri_plugin_deep_link::prepare("app.gitlight");

    let focus = CustomMenuItem::new("dashboard".to_string(), "Dashboard...");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
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

            let tray_window = app.get_window("tray").unwrap();
            tray_window.hide().unwrap();

            #[cfg(target_os = "macos")]
            title_bar::hide_window_buttons(tray_window);

            #[cfg(not(target_os = "macos"))]
            tray_window.set_decorations(false).unwrap();

            Ok(())
        })
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![""]),
        ))
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .system_tray(tray)
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    let tray_window = app.get_window("tray").unwrap();
                    if tray_window.is_visible().unwrap() {
                        tray_window.hide().unwrap();
                    } else {
                        tray_window.move_window(Position::TrayCenter).unwrap();
                        tray_window.show().unwrap();
                        tray_window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "dashboard" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                },
                _ => {}
            }
        })
        .on_window_event(move |event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                #[cfg(not(target_os = "macos"))]
                event.window().hide().unwrap();

                #[cfg(target_os = "macos")]
                tauri::AppHandle::hide(&event.window().app_handle()).unwrap();

                api.prevent_close();
            }
            tauri::WindowEvent::Focused(is_focused) => {
                let window = event.window();
                if !is_focused && window.label() == "tray" {
                    window.hide().unwrap();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![commands::update_tray])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}
