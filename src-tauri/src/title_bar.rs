#[cfg(target_os = "macos")]
use cocoa::appkit::{NSWindow, NSWindowButton};
use tauri::Window;

#[cfg(target_os = "macos")]
pub fn hide_window_buttons(window: Window) {
    unsafe {
        let id = window.ns_window().unwrap() as cocoa::base::id;
        let close_button = id.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
        let min_button = id.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
        let zoom_button = id.standardWindowButton_(NSWindowButton::NSWindowZoomButton);
        let _: () = msg_send![close_button, setHidden: true];
        let _: () = msg_send![min_button, setHidden: true];
        let _: () = msg_send![zoom_button, setHidden: true];
    }
}
