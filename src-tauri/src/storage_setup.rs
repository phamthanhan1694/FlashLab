use std::{
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

pub fn needs_setup(app_data: &Path) -> Result<bool, String> {
    match fs::metadata(app_data.join("config.json")) {
        Ok(metadata) if metadata.is_file() => Ok(false),
        Ok(_) => Err("config.json phải là một tệp cấu hình.".into()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(true),
        Err(error) => Err(format!("Không đọc được cấu hình desktop: {error}")),
    }
}

fn template(path: &Path) -> Result<serde_json::Value, String> {
    let bytes = fs::read(path).map_err(|error| format!("Không đọc được cấu hình mẫu: {error}"))?;
    serde_json::from_slice(&bytes).map_err(|error| format!("Cấu hình mẫu không hợp lệ: {error}"))
}

pub fn default_directory(app_data: &Path, template_path: &Path) -> Result<PathBuf, String> {
    let config = template(template_path)?;
    directory_from_config(app_data, &config)
}

fn directory_from_config(app_data: &Path, config: &serde_json::Value) -> Result<PathBuf, String> {
    let directory = config["storage"]["directory"]
        .as_str()
        .filter(|path| !path.trim().is_empty())
        .ok_or("Cấu hình thiếu thư mục lưu dữ liệu.")?;
    let path = Path::new(directory);
    Ok(if path.is_absolute() {
        path.to_owned()
    } else {
        app_data.join(path)
    })
}

fn check_directory(directory: &Path) -> Result<(), String> {
    if !directory.is_absolute() {
        return Err("Hãy chọn đường dẫn đầy đủ tới thư mục dữ liệu.".into());
    }
    fs::create_dir_all(directory)
        .map_err(|error| format!("Không tạo hoặc mở được thư mục dữ liệu: {error}"))?;
    // Never replace an existing file that is not a SQLite database.
    match File::open(directory.join("flashlab.sqlite")) {
        Ok(mut database) => {
            let mut header = [0_u8; 16];
            if database.read_exact(&mut header).is_err() || &header != b"SQLite format 3\0" {
                return Err("Thư mục có file flashlab.sqlite không hợp lệ. Hãy chọn thư mục khác; file hiện có được giữ nguyên.".into());
            }
        }
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => {
            return Err(format!(
                "Không đọc được database trong thư mục đã chọn: {error}"
            ))
        }
    }
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let probe = directory.join(format!(
        ".flashlab-write-check-{}-{unique}",
        std::process::id()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&probe)
        .map_err(|error| format!("FlashLab không có quyền ghi vào thư mục đã chọn: {error}"))?;
    let result = file
        .write_all(b"FlashLab storage check\n")
        .and_then(|_| file.sync_all());
    drop(file);
    let cleanup = fs::remove_file(&probe);
    result
        .and(cleanup)
        .map_err(|error| format!("Không ghi được dữ liệu trong thư mục đã chọn: {error}"))
}

pub fn initialize(
    app_data: &Path,
    template_path: &Path,
    selected: Option<&Path>,
) -> Result<(), String> {
    if !needs_setup(app_data)? {
        return Ok(());
    }
    let mut config = template(template_path)?;
    let directory = match selected {
        Some(path) => {
            if !path.is_absolute() {
                return Err("Hãy chọn đường dẫn đầy đủ tới thư mục dữ liệu.".into());
            }
            let path = dunce::simplified(path);
            let text = path
                .to_str()
                .ok_or("Đường dẫn thư mục không hỗ trợ ký tự hiện tại.")?;
            config["storage"]["directory"] = serde_json::Value::String(text.to_owned());
            path.to_owned()
        }
        None => directory_from_config(app_data, &config)?,
    };
    check_directory(&directory)?;
    fs::create_dir_all(app_data)
        .map_err(|error| format!("Không mở được thư mục cấu hình: {error}"))?;
    let config_path = app_data.join("config.json");
    let mut bytes = serde_json::to_vec_pretty(&config).map_err(|error| error.to_string())?;
    bytes.push(b'\n');
    let mut file = match OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&config_path)
    {
        Ok(file) => file,
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => return Ok(()),
        Err(error) => return Err(format!("Không lưu được lựa chọn thư mục: {error}")),
    };
    let result = file.write_all(&bytes).and_then(|_| file.sync_all());
    drop(file);
    if let Err(error) = result {
        // This file was created by this call; remove only our incomplete config.
        let _ = fs::remove_file(&config_path);
        return Err(format!("Không lưu được lựa chọn thư mục: {error}"));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Fixture(PathBuf);
    impl Fixture {
        fn new() -> Self {
            let unique = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos();
            let root = std::env::temp_dir()
                .join(format!("flashlab-storage-{}-{unique}", std::process::id()));
            fs::create_dir_all(&root).unwrap();
            fs::write(
                root.join("template.json"),
                include_str!("../../flashlab.config.example.json"),
            )
            .unwrap();
            Self(root)
        }
        fn app_data(&self) -> PathBuf {
            self.0.join("application")
        }
        fn template(&self) -> PathBuf {
            self.0.join("template.json")
        }
    }
    impl Drop for Fixture {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn custom_folder_is_remembered_without_changing_existing_database() {
        let fixture = Fixture::new();
        let directory = fixture.0.join("Kho dữ liệu riêng");
        fs::create_dir_all(&directory).unwrap();
        let original = b"SQLite format 3\0preserve existing contents";
        fs::write(directory.join("flashlab.sqlite"), original).unwrap();
        assert!(needs_setup(&fixture.app_data()).unwrap());
        initialize(&fixture.app_data(), &fixture.template(), Some(&directory)).unwrap();
        assert!(!needs_setup(&fixture.app_data()).unwrap());
        let config = template(&fixture.app_data().join("config.json")).unwrap();
        assert_eq!(
            Path::new(config["storage"]["directory"].as_str().unwrap()),
            directory
        );
        assert_eq!(
            fs::read(directory.join("flashlab.sqlite")).unwrap(),
            original
        );
        assert_eq!(
            fs::read_dir(directory).unwrap().count(),
            1,
            "write probe is removed"
        );
    }

    #[test]
    fn default_choice_uses_local_app_data_without_personal_paths() {
        let fixture = Fixture::new();
        initialize(&fixture.app_data(), &fixture.template(), None).unwrap();
        let config = template(&fixture.app_data().join("config.json")).unwrap();
        assert_eq!(config["storage"]["directory"], "data/profiles");
        assert!(fixture.app_data().join("data/profiles").is_dir());
    }

    #[test]
    fn subsequent_launch_preserves_existing_configuration() {
        let fixture = Fixture::new();
        initialize(&fixture.app_data(), &fixture.template(), None).unwrap();
        let config = fixture.app_data().join("config.json");
        let original = fs::read(&config).unwrap();
        let different = fixture.0.join("different");
        initialize(&fixture.app_data(), &fixture.template(), Some(&different)).unwrap();
        assert_eq!(fs::read(config).unwrap(), original);
        assert!(!different.exists());
    }

    #[test]
    fn invalid_locations_do_not_commit_a_configuration_or_overwrite_files() {
        let fixture = Fixture::new();
        assert!(initialize(
            &fixture.app_data(),
            &fixture.template(),
            Some(Path::new("relative"))
        )
        .is_err());
        let file = fixture.0.join("not-a-folder");
        fs::write(&file, "keep").unwrap();
        assert!(initialize(&fixture.app_data(), &fixture.template(), Some(&file)).is_err());
        let invalid = fixture.0.join("invalid-database");
        fs::create_dir_all(&invalid).unwrap();
        fs::write(invalid.join("flashlab.sqlite"), "keep this file").unwrap();
        assert!(initialize(&fixture.app_data(), &fixture.template(), Some(&invalid)).is_err());
        assert!(needs_setup(&fixture.app_data()).unwrap());
        assert_eq!(
            fs::read_to_string(invalid.join("flashlab.sqlite")).unwrap(),
            "keep this file"
        );
    }
}
