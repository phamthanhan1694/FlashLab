fn main() {
    println!("cargo:rerun-if-env-changed=FLASHLAB_MOBILE_URL");
    let target = std::env::var("TARGET").expect("Cargo target missing");
    println!("cargo:rustc-env=FLASHLAB_HOST_TRIPLE={target}");
    tauri_build::build()
}
