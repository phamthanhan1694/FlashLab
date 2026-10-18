use std::{
    collections::VecDeque,
    fs::{self, OpenOptions},
    io::{BufRead, BufReader, Write},
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    sync::{mpsc, Arc, Mutex},
    time::Duration,
};
use tauri::Manager;

struct Backend(Arc<Mutex<Option<Child>>>);

fn backend_command(node: &Path, resources: &Path, data: &Path) -> Command {
    // Tauri can return verbatim Windows paths (\\?\C:\...). Node's main-module
    // resolver rejects that form, before our backend can even create its config.
    let mut command = Command::new(dunce::simplified(node));
    command
        .arg(dunce::simplified(resources).join("backend.mjs"))
        .arg(dunce::simplified(resources))
        .arg(dunce::simplified(data))
        .current_dir(dunce::simplified(resources))
        .env_remove("NODE_OPTIONS")
        .env_remove("NODE_PATH")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }
    command
}

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
            .join(format!(
                "flashlab-node-{}{}",
                env!("FLASHLAB_HOST_TRIPLE"),
                suffix
            ))
    } else {
        let suffix = if cfg!(windows) { ".exe" } else { "" };
        std::env::current_exe()?
            .parent()
            .ok_or("Missing executable directory")?
            .join(format!("flashlab-node{}", suffix))
    };
    let app_data = app.path().app_data_dir()?;
    fs::create_dir_all(&app_data)?;
    let log_path = app_data.join("startup.log");
    let mut log = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .ok();
    if let Some(file) = log.as_mut() {
        let _ = writeln!(
            file,
            "\nFlashLab startup: {:?}\nRuntime: {}\nResources: {}\nData: {}",
            std::time::SystemTime::now(),
            node.display(),
            resources.display(),
            app_data.display()
        );
    }
    let mut child = backend_command(&node, &resources, &app_data).spawn()?;
    let stdout = child.stdout.take().ok_or("Missing backend stdout")?;
    let stderr = child.stderr.take().ok_or("Missing backend stderr")?;
    let state = Arc::new(Mutex::new(Some(child)));
    app.manage(Backend(state.clone()));
    let (sender, receiver) = mpsc::channel::<Result<String, String>>();
    let errors = sender.clone();
    std::thread::spawn(move || {
        let mut tail = VecDeque::new();
        for line in BufReader::new(stderr).lines().map_while(Result::ok) {
            eprintln!("{line}");
            if let Some(file) = log.as_mut() {
                let _ = writeln!(file, "{line}");
            }
            tail.push_back(line);
            if tail.len() > 16 {
                tail.pop_front();
            }
        }
        let message = if tail.is_empty() {
            "Backend đã đóng trước khi báo sẵn sàng.".to_owned()
        } else {
            tail.into_iter().collect::<Vec<_>>().join("\n")
        };
        let _ = errors.send(Err(message));
    });
    std::thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(&line) {
                if let Some(address) = value.get("ready").and_then(|value| value.as_str()) {
                    let _ = sender.send(Ok(address.to_owned()));
                    return;
                }
            }
        }
    });
    let handle = app.handle().clone();
    std::thread::spawn(move || {
        let result = receiver
            .recv_timeout(Duration::from_secs(30))
            .map_err(|_| "Backend chưa báo sẵn sàng sau 30 giây.".to_owned())
            .and_then(|ready| ready)
            .and_then(|address| {
                let url: tauri::Url = address
                    .parse()
                    .map_err(|_| "Địa chỉ backend không hợp lệ.".to_owned())?;
                if url.scheme() != "http" || url.host_str() != Some("127.0.0.1") {
                    return Err("Backend phải chạy trên máy này.".to_owned());
                }
                let window = handle
                    .get_webview_window("main")
                    .ok_or_else(|| "Không tìm thấy cửa sổ FlashLab.".to_owned())?;
                window
                    .navigate(url)
                    .map_err(|error| format!("Không mở được FlashLab: {error}"))
            });
        if let Err(message) = result {
            stop(&handle);
            show_startup_error(&handle, &message, &log_path);
        }
    });
    Ok(())
}

fn show_startup_error(app: &tauri::AppHandle, message: &str, log_path: &Path) {
    if let Some(window) = app.get_webview_window("main") {
        let detail = format!(
            "Không khởi động được FlashLab.\n{message}\n\nNhật ký: {}",
            dunce::simplified(log_path).display()
        );
        let message = serde_json::to_string(&detail).unwrap_or_default();
        let _ = window.eval(&format!("document.getElementById('startup-status').hidden=true;const error=document.getElementById('startup-error');error.hidden=false;error.textContent={message};"));
    }
}

pub fn stop(app: &tauri::AppHandle) {
    if let Some(state) = app.try_state::<Backend>() {
        if let Ok(mut guard) = state.0.lock() {
            if let Some(mut child) = guard.take() {
                // End stdin first so Fastify can finish writes and close cleanly.
                drop(child.stdin.take());
                for _ in 0..50 {
                    if child.try_wait().ok().flatten().is_some() {
                        return;
                    }
                    std::thread::sleep(Duration::from_millis(100));
                }
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }
}

#[cfg(all(test, windows))]
mod tests {
    use super::*;

    struct Fixture {
        directory: PathBuf,
        child: Option<Child>,
    }

    impl Drop for Fixture {
        fn drop(&mut self) {
            if let Some(child) = self.child.as_mut() {
                let _ = child.kill();
                let _ = child.wait();
            }
            let _ = fs::remove_dir_all(&self.directory);
        }
    }

    #[test]
    fn packaged_backend_starts_from_verbatim_windows_paths() {
        let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let source = manifest.join("resources");
        let node = manifest
            .join("binaries")
            .join(format!(
                "flashlab-node-{}.exe",
                env!("FLASHLAB_HOST_TRIPLE")
            ))
            .canonicalize()
            .expect("Run desktop:prepare before this test");
        let unique = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let directory = std::env::temp_dir().join(format!(
            "flashlab-desktop-đường dẫn-{}-{unique}",
            std::process::id()
        ));
        fs::create_dir_all(&directory).unwrap();
        let mut fixture = Fixture {
            directory,
            child: None,
        };
        let resources = fixture.directory.join("resources");
        fs::create_dir_all(&resources).unwrap();
        // Put the actual bundled entry point in a path with spaces and Unicode.
        fs::copy(source.join("backend.mjs"), resources.join("backend.mjs")).unwrap();
        fs::copy(
            source.join("config.example.json"),
            resources.join("config.example.json"),
        )
        .unwrap();
        fs::create_dir_all(resources.join("frontend")).unwrap();
        let data = fixture.directory.join("data");
        fs::create_dir_all(&data).unwrap();
        let resources = resources.canonicalize().unwrap();
        let data = data.canonicalize().unwrap();
        assert!(resources.to_string_lossy().starts_with(r"\\?\"));
        let mut child = backend_command(&node, &resources, &data).spawn().unwrap();
        let stdout = child.stdout.take().unwrap();
        let stderr = child.stderr.take().unwrap();
        fixture.child = Some(child);
        let errors = std::thread::spawn(move || {
            use std::io::Read;
            let mut errors = String::new();
            BufReader::new(stderr).read_to_string(&mut errors).unwrap();
            errors
        });
        let (sender, receiver) = mpsc::channel();
        std::thread::spawn(move || {
            for line in BufReader::new(stdout).lines().map_while(Result::ok) {
                if let Ok(value) = serde_json::from_str::<serde_json::Value>(&line) {
                    if value.get("ready").is_some() {
                        let _ = sender.send(value);
                        return;
                    }
                }
            }
        });
        let ready = receiver.recv_timeout(Duration::from_secs(15));
        let child = fixture.child.as_mut().unwrap();
        drop(child.stdin.take());
        for _ in 0..50 {
            if child.try_wait().unwrap().is_some() {
                break;
            }
            std::thread::sleep(Duration::from_millis(100));
        }
        if child.try_wait().unwrap().is_none() {
            child.kill().unwrap();
        }
        let status = child.wait().unwrap();
        let errors = errors.join().unwrap();
        assert!(ready.is_ok(), "Backend did not become ready: {errors}");
        assert!(status.success(), "Backend exited with {status}: {errors}");
        assert!(data.join("config.json").is_file());
        assert!(data.join("data/profiles/flashlab.sqlite").is_file());
    }
}
