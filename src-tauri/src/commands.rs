#[tauri::command]
pub fn update_tray(app_handle: tauri::AppHandle, title: Option<String>, new_icon: Option<bool>) {
    let tray_handle = app_handle.tray_handle();
    #[cfg(target_os = "macos")]
    if let Some(title) = title {
        tray_handle.set_title(&title).unwrap();
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
