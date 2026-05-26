#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            enable_webview_media_devices(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(target_os = "macos")]
fn enable_webview_media_devices(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    use tauri::Manager;

    let window = app
        .get_webview_window("main")
        .ok_or("main webview window not found")?;

    window.with_webview(|webview| unsafe {
        use objc2::{msg_send, runtime::AnyObject};
        use objc2_foundation::{NSNumber, NSString};

        let wk_webview: *mut AnyObject = webview.inner().cast();
        let configuration: *mut AnyObject = msg_send![wk_webview, configuration];
        let preferences: *mut AnyObject = msg_send![configuration, preferences];
        let yes = NSNumber::numberWithBool(true);

        for key in [
            "mediaDevicesEnabled",
            "mediaStreamEnabled",
            "peerConnectionEnabled",
        ] {
            let ns_key = NSString::from_str(key);
            let _: () = msg_send![preferences, setValue: &*yes, forKey: &*ns_key];
        }
    })?;

    Ok(())
}
