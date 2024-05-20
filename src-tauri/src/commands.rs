use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};

#[tauri::command]
pub fn update_tray(app_handle: tauri::AppHandle, title: Option<String>, new_icon: Option<bool>) {
    let tray_handle = app_handle.tray_handle_by_id("tray").unwrap();
    #[cfg(target_os = "macos")]
    if let Some(title) = title {
        tray_handle.set_title(&title).unwrap();
    }
    if let Some(new_icon) = new_icon {
        if new_icon {
            tray_handle.set_icon(get_raw_tray_icon("new")).unwrap();
        } else {
            tray_handle.set_icon(get_raw_tray_icon("base")).unwrap();
        }
    }
}

#[tauri::command]
pub fn toggle_tray(app_handle: tauri::AppHandle, show: bool) {
    let tray_handle = app_handle.tray_handle_by_id("tray");
    if let Some(tray_handle) = tray_handle {
        tray_handle.destroy().unwrap();
    }
    if show {
        let mut system_tray = SystemTray::new()
            .with_id("tray")
            .with_icon(get_raw_tray_icon("base"))
            .with_menu(
                SystemTrayMenu::new()
                    .add_item(CustomMenuItem::new("dashboard".to_string(), "Dashboard..."))
                    .add_native_item(SystemTrayMenuItem::Separator)
                    .add_item(CustomMenuItem::new("quit".to_string(), "Quit")),
            );
        if cfg!(target_os = "macos") {
            system_tray = system_tray
                .with_icon_as_template(true)
                .with_menu_on_left_click(false)
        }
        system_tray.build(&app_handle).unwrap();
    }
}

fn get_raw_tray_icon(image: &str) -> tauri::Icon {
    let is_macos = cfg!(target_os = "macos");
    let bytes = match image {
        "base" => {
            if is_macos {
                include_bytes!("../icons/tray-base-macos.png").to_vec()
            } else {
                include_bytes!("../icons/tray-base.png").to_vec()
            }
        }
        "new" => {
            if is_macos {
                include_bytes!("../icons/tray-new-macos.png").to_vec()
            } else {
                include_bytes!("../icons/tray-new.png").to_vec()
            }
        }
        _ => panic!("Unknown tray icon"),
    };
    tauri::Icon::Raw(bytes)
}
