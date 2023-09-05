use crate::tray::{activate_tray_mode, deactivate_tray_mode};
use serde_json::json;
use tauri_plugin_store::StoreBuilder;

#[tauri::command]
pub fn update_tray(
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

#[tauri::command]
pub fn set_tray_mode(app_handle: tauri::AppHandle, is_tray_app: bool) {
    if is_tray_app {
        activate_tray_mode(&app_handle);
    } else {
        deactivate_tray_mode(&app_handle);
    }
    let store = Some(StoreBuilder::new(app_handle, "store.bin".to_string().into()).build());
    store
        .unwrap()
        .insert("is_tray_app".to_string(), json!(is_tray_app))
        .unwrap();
}
