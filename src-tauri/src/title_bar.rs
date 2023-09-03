#[cfg(target_os = "macos")]
use cocoa::appkit::{NSWindow, NSWindowButton, NSWindowStyleMask};

use objc::runtime::NO;
#[cfg(target_os = "macos")]
use objc::runtime::YES;

use tauri::Window;

pub fn show_window_buttons(window: Window, show_controls: bool) {
    unsafe {
        let id = window.ns_window().unwrap() as cocoa::base::id;
        let hidden = if show_controls { YES } else { NO };
        let close_button = id.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
        let _: () = msg_send![close_button, setHidden: hidden];
        let min_button = id.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
        let _: () = msg_send![min_button, setHidden: hidden];
        let zoom_button = id.standardWindowButton_(NSWindowButton::NSWindowZoomButton);
        let _: () = msg_send![zoom_button, setHidden: hidden];
    }
}

pub fn set_title_bar_transparent(window: Window) {
    unsafe {
        let id = window.ns_window().unwrap() as cocoa::base::id;
        let mut style_mask = id.styleMask();
        style_mask.set(NSWindowStyleMask::NSFullSizeContentViewWindowMask, true);
        id.setTitlebarAppearsTransparent_(cocoa::base::YES);
    }
}
