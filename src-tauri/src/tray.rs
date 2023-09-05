use crate::title_bar::show_window_buttons;
use tauri::{LogicalSize, Manager, PhysicalPosition, Position, Size};
use tauri_plugin_window_state::{AppHandleExt, StateFlags, WindowExt};

pub fn activate_tray_mode(app: &tauri::AppHandle) {
    app.save_window_state(StateFlags::all()).unwrap();
    let window = app.get_window("main").unwrap();
    window
        .set_size(Size::Logical(LogicalSize {
            width: 400.0,
            height: 600.0,
        }))
        .unwrap();
    window
        .set_position(Position::Physical(PhysicalPosition { x: 100, y: 100 }))
        .unwrap();
    window.set_resizable(false).unwrap();
    show_window_buttons(window, true);
}

pub fn deactivate_tray_mode(app: &tauri::AppHandle) {
    let window = app.get_window("main").unwrap();
    window.set_resizable(true).unwrap();
    window.restore_state(StateFlags::all()).unwrap();
    show_window_buttons(window, false);
}
