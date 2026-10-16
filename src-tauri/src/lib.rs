#[cfg(desktop)]
mod desktop;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            use tauri::Manager;
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .setup(desktop::setup);
    #[cfg(mobile)]
    let builder = builder.setup(|app| {
        use tauri::Manager;
        let address = option_env!("FLASHLAB_MOBILE_URL")
            .ok_or("Set FLASHLAB_MOBILE_URL to your HTTPS FlashLab server before building mobile")?;
        let url: tauri::Url = address.parse()?;
        if url.scheme() != "https" || url.host_str().is_none() {
            return Err("FLASHLAB_MOBILE_URL must be an HTTPS server URL".into());
        }
        app.get_webview_window("main").ok_or("Missing main window")?.navigate(url)?;
        Ok(())
    });
    let app = builder.build(tauri::generate_context!()).expect("Could not initialize FlashLab");
    app.run(|app, event| {
        #[cfg(desktop)]
        if matches!(event, tauri::RunEvent::Exit) {
            desktop::stop(app);
        }
        #[cfg(mobile)]
        let _ = (app, event);
    });
}
