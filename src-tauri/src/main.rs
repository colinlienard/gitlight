#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use serde_json::json;
use std::sync::{Arc, RwLock};
use tauri::{
    CustomMenuItem, Manager, PhysicalPosition, Position, SystemTray, SystemTrayEvent,
    SystemTrayMenu, SystemTrayMenuItem,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_positioner::{Position::TrayCenter, WindowExt};
use tauri_plugin_store::StoreBuilder;

mod commands;
mod title_bar;
mod tray;

fn main() {
    tauri_plugin_deep_link::prepare("app.gitlight");

    let title = CustomMenuItem::new("title".to_string(), "GitHub notifications").disabled();
    let text = CustomMenuItem::new("text".to_string(), "1 pinned • 2 unread");
    let focus = CustomMenuItem::new("focus".to_string(), "Dashboard");
    let toggle = CustomMenuItem::new("toggle".to_string(), "Toggle");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(title)
        .add_item(text)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(focus)
        .add_item(toggle)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let tray = SystemTray::new().with_menu(tray_menu);

    let is_tray_app = Arc::new(RwLock::new(false));
    let is_tray_app_clone = is_tray_app.clone();
    let is_tray_app_clone_2 = is_tray_app.clone();

    let store_option = Arc::new(RwLock::new(None));
    let store_option_clone = store_option.clone();

    tauri::Builder::default()
        .setup(move |app| {
            let handle = app.handle();
            tauri_plugin_deep_link::register("gitlight", move |request| {
                handle.emit_all("scheme-request", request).unwrap();
            })
            .unwrap();

            app.handle().tray_handle().set_tooltip("tooltip").unwrap();

            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                app.emit_all("scheme-request", url).unwrap();
            }

            let mut store_option_lock = store_option.write().unwrap();
            *store_option_lock =
                Some(StoreBuilder::new(app.handle(), "store.bin".parse()?).build());

            if *is_tray_app.read().unwrap() {
                tray::activate_tray_mode(&app.handle());
                let window = app.get_window("main").unwrap();
                window.move_window(TrayCenter).unwrap();
            } else {
                tray::deactivate_tray_mode(&app.handle());
            }

            title_bar::set_title_bar_transparent(app.get_window("main").unwrap());

            Ok(())
        })
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![""]),
        ))
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .system_tray(tray)
        .on_system_tray_event(move |app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();
                    if *is_tray_app_clone.read().unwrap() {
                        window.move_window(TrayCenter).unwrap();
                        if window.is_visible().unwrap() {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "text" | "focus" => {
                        let window = app.get_window("main").unwrap();
                        window.set_focus().unwrap();
                    }
                    "toggle" => {
                        let is_tray_app_value = *is_tray_app_clone.read().unwrap();
                        let mut is_tray_app_lock = is_tray_app_clone.write().unwrap();
                        *is_tray_app_lock = !is_tray_app_value;
                        let window = app.get_window("main").unwrap();
                        let store_option_lock = &mut *store_option_clone.write().unwrap();
                        if is_tray_app_value {
                            tray::deactivate_tray_mode(app);
                            store_option_lock
                                .as_mut()
                                .unwrap()
                                .insert("is_tray_app".to_string(), json!(false))
                                .unwrap();
                        } else {
                            tray::activate_tray_mode(app);
                            store_option_lock
                                .as_mut()
                                .unwrap()
                                .insert("is_tray_app".to_string(), json!(true))
                                .unwrap();
                            window
                                .set_position(Position::Physical(PhysicalPosition {
                                    x: 100,
                                    y: 100,
                                }))
                                .unwrap();
                        }
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
                if !is_focused && *is_tray_app_clone_2.read().unwrap() {
                    event.window().hide().unwrap();
                }
            }
            tauri::WindowEvent::Moved(position) => {
                if position.x == 100 && position.y == 100 {
                    event.window().move_window(TrayCenter).unwrap();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::update_tray,
            commands::set_tray_mode
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}
