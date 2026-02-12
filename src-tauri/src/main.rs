#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
async fn check_for_updates(window: tauri::Window) {
    window.emit("update-check", "checking").unwrap();
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![check_for_updates])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            
            // Check for updates on startup
            if let Some(update_check) = app.package_info().version.to_string().strip_prefix('v') {
                println!("SERVE v{} initialized", update_check);
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running SERVE");
}
