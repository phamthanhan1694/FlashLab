use std::{
    io::{BufRead, BufReader},
    path::PathBuf,
    process::{Child, Command, Stdio},
    sync::{mpsc, Arc, Mutex},
    time::Duration,
};
use tauri::Manager;

struct Backend(Arc<Mutex<Option<Child>>>);

pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let resources = if cfg!(debug_assertions) {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources")
    } else {
        app.path().resource_dir()?
    };
    let node = if cfg!(debug_assertions) {
        let suffix = if cfg!(windows) { ".exe" } else { "" };
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("binaries")
            .join(format!("flashlab-node-{}{}", env!("FLASHLAB_HOST_TRIPLE"), suffix))
    } else {
        let suffix = if cfg!(windows) { ".exe" } else { "" };
        std::env::current_exe()?.parent().ok_or("Missing executable directory")?
            .join(format!("flashlab-node{}", suffix))
    };
    let mut command = Command::new(node);
    command.arg(resources.join("backend.mjs"))
        .arg(&resources).arg(app.path().app_data_dir()?)
        .env_remove("NODE_OPTIONS").env_remove("NODE_PATH")
        .stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    let mut child = command.spawn()?;
    let stdout = child.stdout.take().ok_or("Missing backend stdout")?;
    let stderr = child.stderr.take().ok_or("Missing backend stderr")?;
    let state = Arc::new(Mutex::new(Some(child)));
    app.manage(Backend(state.clone()));
    let (sender, receiver) = mpsc::channel();
    std::thread::spawn(move || {
        for line in BufReader::new(stderr).lines().map_while(Result::ok) {
            eprintln!("{line}");
        }
    });
    std::thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(&line) {
                if let Some(address) = value.get("ready").and_then(|value| value.as_str()) {
                    let _ = sender.send(address.to_owned());
                    return;
                }
            }
        }
    });
    let handle = app.handle().clone();
    std::thread::spawn(move || {
        let result = receiver.recv_timeout(Duration::from_secs(30))
            .map_err(|_| "Không khởi động được kho dữ liệu. Kiểm tra cấu hình trong thư mục dữ liệu FlashLab.")
            .and_then(|address| {
                let url: tauri::Url = address.parse().map_err(|_| "Địa chỉ backend không hợp lệ.")?;
                if url.scheme() != "http" || url.host_str() != Some("127.0.0.1") {
                    return Err("Backend phải chạy trên máy này.");
                }
                let window = handle.get_webview_window("main").ok_or("Không tìm thấy cửa sổ FlashLab.")?;
                window.navigate(url).map_err(|_| "Không mở được FlashLab.")
            });
        if let Err(message) = result {
            stop(&handle);
            if let Some(window) = handle.get_webview_window("main") {
                let message = serde_json::to_string(message).unwrap_or_default();
                let _ = window.eval(&format!("document.getElementById('startup-status').hidden=true;const error=document.getElementById('startup-error');error.hidden=false;error.textContent={message};"));
            }
        }
    });
    Ok(())
}

pub fn stop(app: &tauri::AppHandle) {
    if let Some(state) = app.try_state::<Backend>() {
        if let Ok(mut guard) = state.0.lock() {
            if let Some(mut child) = guard.take() {
                // End stdin first so Fastify can finish writes and close cleanly.
                drop(child.stdin.take());
                for _ in 0..50 {
                    if child.try_wait().ok().flatten().is_some() { return; }
                    std::thread::sleep(Duration::from_millis(100));
                }
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }
}
