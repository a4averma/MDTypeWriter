use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::command;
use walkdir::WalkDir;

#[derive(Serialize, Deserialize)]
struct FileTree {
    name: String,
    path: String,
    is_directory: bool,
    children: Option<Vec<FileTree>>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Recursively get all files and folders inside the given directory.
#[command]
async fn get_file_tree(folder_path: String) -> Result<FileTree, String> {
    let path = PathBuf::from(&folder_path);

    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !path.is_dir() {
        return Err("Provided path is not a directory".to_string());
    }

    Ok(build_file_tree(&path))
}

/// Build a file tree recursively.
fn build_file_tree(path: &PathBuf) -> FileTree {
    let mut children = Vec::new();

    if path.is_dir() {
        for entry in WalkDir::new(path)
            .min_depth(1)
            .max_depth(1) // Control recursion depth
            .follow_links(false) // Safety against symlink cycles
            .sort_by(|a, b| a.file_name().cmp(b.file_name()))
        // Alphabetical order
        {
            match entry {
                Ok(e) => children.push(build_file_tree(&e.path().to_path_buf())),
                Err(_) => continue, // Skip entries with errors instead of panicking
            }
        }
    }

    FileTree {
        name: path.file_name().unwrap().to_string_lossy().to_string(),
        path: path.to_string_lossy().to_string(),
        is_directory: path.is_dir(),
        children: if children.is_empty() {
            None
        } else {
            Some(children)
        },
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_file_tree])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
