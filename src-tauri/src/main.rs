#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
  tauri_plugin_deep_link::prepare("de.fabianlars.deep-link-test");

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

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
