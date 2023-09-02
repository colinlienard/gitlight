use tauri::{LogicalSize, Manager, Size};
use tauri_plugin_window_state::{AppHandleExt, StateFlags, WindowExt};

pub fn activate_tray_mode(app: &tauri::AppHandle) {
    app.save_window_state(StateFlags::all()).unwrap();
    let window = app.get_window("main").unwrap();
    window.set_decorations(false).unwrap();
    window
        .set_size(Size::Logical(LogicalSize {
            width: 400.0,
            height: 600.0,
        }))
        .unwrap();
}

pub fn deactivate_tray_mode(app: &tauri::AppHandle) {
    let window = app.get_window("main").unwrap();
    window.restore_state(StateFlags::all()).unwrap();
    window.set_decorations(true).unwrap();
}
