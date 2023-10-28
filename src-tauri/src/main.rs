#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use tauri::{Manager, SystemTray, SystemTrayEvent};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_positioner::{Position, WindowExt};

mod commands;
mod title_bar;

fn main() {
    tauri_plugin_deep_link::prepare("app.gitlight");

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
        .system_tray(SystemTray::new().with_id("tray"))
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
                event.window().hide().unwrap();
                api.prevent_close();
            }
            tauri::WindowEvent::Focused(is_focused) => {
                let window = event.window();
                let app_handle = window.app_handle();
                let main_window = app_handle.get_window("main").unwrap();
                let tray_window = app_handle.get_window("tray").unwrap();
                if window.label() == "tray" && !is_focused {
                    main_window.show().unwrap();
                    tauri::AppHandle::hide(&event.window().app_handle()).unwrap();
                    tray_window.hide().unwrap();
                }
                if main_window.is_visible().unwrap() && tray_window.is_visible().unwrap() {
                    main_window.hide().unwrap();
                }
                commands::update_tray(window.app_handle(), None, Some(false))
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::update_tray,
            commands::toggle_tray
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}
