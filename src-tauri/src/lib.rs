use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use uuid::Uuid;

/// Kompletní reprezentace jedné položky (Film, Seriál, Hra)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MediaItem {
    pub id: i64,
    pub item_type: String, // "Film", "Seriál", "Hra"
    pub title: String,
    pub description: String,
    pub tags: String,
    pub genre: String,
    pub rating: Option<f64>,
    pub api_rating: Option<f64>,
    pub note: String,
    pub image_path: Option<String>,
    pub image_data: Option<String>, // Base64 data URL pro zobrazení ve frontendu
    pub release_year: Option<i32>,
    // Pole specifická pro Filmy / Seriály
    pub duration: String,
    pub director: String,
    pub writer: String,
    pub cast_members: String,
    pub production: String,
    pub season_episodes: String, // Pouze Seriál (např. S01E05 nebo 3 série)
    // Pole specifická pro Hry
    pub developer: String,
    pub publisher: String,
    pub game_mode: String,
    pub platforms: String,
    pub engine: String,
    // Dynamická uživatelská metadata (klíč -> hodnota)
    pub custom_metadata: HashMap<String, String>,
    pub status: String,      // "backlog", "in_progress", "completed", "dropped"
    pub trailer_url: String, // Odkaz na video trailer (např. YouTube)
    pub created_at: String,
    pub updated_at: String,
}

/// Vstupní data pro přidání nové položky
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddMediaItemInput {
    pub item_type: String,
    pub title: String,
    pub description: Option<String>,
    pub tags: Option<String>,
    pub genre: Option<String>,
    pub rating: Option<f64>,
    pub api_rating: Option<f64>,
    pub note: Option<String>,
    pub image_source_path: Option<String>,
    pub release_year: Option<i32>,
    pub duration: Option<String>,
    pub director: Option<String>,
    pub writer: Option<String>,
    pub cast_members: Option<String>,
    pub production: Option<String>,
    pub season_episodes: Option<String>,
    pub developer: Option<String>,
    pub publisher: Option<String>,
    pub game_mode: Option<String>,
    pub platforms: Option<String>,
    pub engine: Option<String>,
    pub custom_metadata: Option<HashMap<String, String>>,
    pub status: Option<String>,
    pub trailer_url: Option<String>,
}

/// Vstupní data pro editaci existující položky
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMediaItemInput {
    pub id: i64,
    pub item_type: String,
    pub title: String,
    pub description: Option<String>,
    pub tags: Option<String>,
    pub genre: Option<String>,
    pub rating: Option<f64>,
    pub api_rating: Option<f64>,
    pub note: Option<String>,
    pub image_source_path: Option<String>, // Pokud byl vybrán nový soubor
    pub remove_image: bool,               // Pokud si uživatel přeje obrázek odstranit
    pub release_year: Option<i32>,
    pub duration: Option<String>,
    pub director: Option<String>,
    pub writer: Option<String>,
    pub cast_members: Option<String>,
    pub production: Option<String>,
    pub season_episodes: Option<String>,
    pub developer: Option<String>,
    pub publisher: Option<String>,
    pub game_mode: Option<String>,
    pub platforms: Option<String>,
    pub engine: Option<String>,
    pub custom_metadata: Option<HashMap<String, String>>,
    pub status: Option<String>,
    pub trailer_url: Option<String>,
}

/// Globální stav aplikace sdílený mezi příkazy
pub struct AppState {
    pub db: Mutex<Connection>,
    pub covers_dir: PathBuf,
    pub app_data_dir: PathBuf,
}

/// Načte obrázek z disku a převede jej na data URL (base64) - záložní pomocná funkce
#[allow(dead_code)]
fn load_image_as_data_url(path: &PathBuf) -> Option<String> {
    if !path.exists() || !path.is_file() {
        return None;
    }

    let bytes = fs::read(path).ok()?;
    let extension = path
        .extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase())
        .unwrap_or_default();

    let mime = match extension.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        _ => "image/jpeg",
    };

    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD.encode(bytes);
    Some(format!("data:{};base64,{}", mime, b64))
}

/// 1. Příkaz: Načtení všech položek z databáze
#[tauri::command]
fn get_items(state: tauri::State<'_, AppState>) -> Result<Vec<MediaItem>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT 
                id, item_type, title, description, tags, genre, rating, api_rating, note, image_path,
                release_year, duration, director, writer, cast_members, production, season_episodes,
                developer, publisher, game_mode, platforms, engine, custom_metadata, created_at, updated_at,
                status, trailer_url
             FROM media_items 
             ORDER BY id DESC",
        )
        .map_err(|e| e.to_string())?;

    let items_iter = stmt
        .query_map([], |row| {
            let id: i64 = row.get(0)?;
            let item_type: String = row.get(1)?;
            let title: String = row.get(2)?;
            let description: String = row.get(3)?;
            let tags: String = row.get(4)?;
            let genre: String = row.get(5)?;
            let raw_rating: Option<f64> = row.get(6).ok();
            let rating: Option<f64> = raw_rating.and_then(|r| if r < 0.0 { None } else { Some(r) });
            let api_rating: Option<f64> = row.get(7)?;
            let note: String = row.get(8)?;
            let image_path: Option<String> = row.get(9)?;
            let release_year: Option<i32> = row.get(10)?;
            let duration: String = row.get(11)?;
            let director: String = row.get(12)?;
            let writer: String = row.get(13)?;
            let cast_members: String = row.get(14)?;
            let production: String = row.get(15)?;
            let season_episodes: String = row.get(16)?;
            let developer: String = row.get(17)?;
            let publisher: String = row.get(18)?;
            let game_mode: String = row.get(19)?;
            let platforms: String = row.get(20)?;
            let engine: String = row.get(21)?;
            let custom_meta_raw: String = row.get(22)?;
            let created_at: String = row.get(23)?;
            let updated_at: String = row.get(24)?;
            let status: String = row.get(25).unwrap_or_else(|_| "completed".to_string());
            let trailer_url: String = row.get(26).unwrap_or_default();

            let custom_metadata: HashMap<String, String> =
                serde_json::from_str(&custom_meta_raw).unwrap_or_default();

            Ok((
                id,
                item_type,
                title,
                description,
                tags,
                genre,
                rating,
                api_rating,
                note,
                image_path,
                release_year,
                duration,
                director,
                writer,
                cast_members,
                production,
                season_episodes,
                developer,
                publisher,
                game_mode,
                platforms,
                engine,
                custom_metadata,
                created_at,
                updated_at,
                status,
                trailer_url,
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for row in items_iter {
        let (
            id,
            item_type,
            title,
            description,
            tags,
            genre,
            rating,
            api_rating,
            note,
            image_path,
            release_year,
            duration,
            director,
            writer,
            cast_members,
            production,
            season_episodes,
            developer,
            publisher,
            game_mode,
            platforms,
            engine,
            custom_metadata,
            created_at,
            updated_at,
            status,
            trailer_url,
        ) = row.map_err(|e| e.to_string())?;

        let image_data = if let Some(ref file_name) = image_path {
            let full_path = state.covers_dir.join(file_name);
            if full_path.exists() {
                Some(full_path.to_string_lossy().to_string())
            } else {
                None
            }
        } else {
            None
        };

        result.push(MediaItem {
            id,
            item_type,
            title,
            description,
            tags,
            genre,
            rating,
            api_rating,
            note,
            image_path,
            image_data,
            release_year,
            duration,
            director,
            writer,
            cast_members,
            production,
            season_episodes,
            developer,
            publisher,
            game_mode,
            platforms,
            engine,
            custom_metadata,
            status,
            trailer_url,
            created_at,
            updated_at,
        });
    }

    Ok(result)
}

/// 2. Příkaz: Přidání nové položky do databáze
#[tauri::command]
fn add_item(
    state: tauri::State<'_, AppState>,
    item: AddMediaItemInput,
) -> Result<MediaItem, String> {
    let trimmed_title = item.title.trim().to_string();
    if trimmed_title.is_empty() {
        return Err("Název položky nesmí být prázdný.".to_string());
    }

    if let Some(r) = item.rating {
        if r < 0.0 || r > 10.0 {
            return Err("Hodnocení musí být číslo v rozmezí od 0 do 10 (např. 8, 6.5 nebo 6.25).".to_string());
        }
    }

    // Extrakce hodnot
    let item_type = item.item_type;
    let description = item.description.unwrap_or_default();
    let tags = item.tags.unwrap_or_default();
    let genre = item.genre.unwrap_or_default();
    let rating = item.rating;
    let db_rating = item.rating;
    let api_rating = item.api_rating;
    let note = item.note.unwrap_or_default();
    let release_year = item.release_year;
    let duration = item.duration.unwrap_or_default();
    let director = item.director.unwrap_or_default();
    let writer = item.writer.unwrap_or_default();
    let cast_members = item.cast_members.unwrap_or_default();
    let production = item.production.unwrap_or_default();
    let season_episodes = item.season_episodes.unwrap_or_default();
    let developer = item.developer.unwrap_or_default();
    let publisher = item.publisher.unwrap_or_default();
    let game_mode = item.game_mode.unwrap_or_default();
    let platforms = item.platforms.unwrap_or_default();
    let engine = item.engine.unwrap_or_default();
    let custom_metadata = item.custom_metadata.unwrap_or_default();
    let status = item.status.unwrap_or_else(|| "completed".to_string());
    let trailer_url = item.trailer_url.unwrap_or_default();

    // Zpracování obrázku, pokud byl zadán
    let mut saved_rel_path: Option<String> = None;
    let mut saved_image_data: Option<String> = None;

    if let Some(ref src_path_str) = item.image_source_path {
        let src_path = PathBuf::from(src_path_str);
        if src_path.exists() && src_path.is_file() {
            let ext = src_path
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or("jpg")
                .to_lowercase();

            let unique_file_name = format!("{}.{}", Uuid::new_v4(), ext);
            let dest_path = state.covers_dir.join(&unique_file_name);

            fs::copy(&src_path, &dest_path).map_err(|e| {
                format!("Nepodařilo se zkopírovat obrázek do složky aplikace: {}", e)
            })?;

            saved_image_data = Some(dest_path.to_string_lossy().to_string());
            saved_rel_path = Some(unique_file_name);
        }
    }

    let custom_meta_json = serde_json::to_string(&custom_metadata)
        .unwrap_or_else(|_| "{}".to_string());

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO media_items (
            item_type, title, description, tags, genre, rating, api_rating, note, image_path,
            release_year, duration, director, writer, cast_members, production, season_episodes,
            developer, publisher, game_mode, platforms, engine, custom_metadata, status, trailer_url
         ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9,
            ?10, ?11, ?12, ?13, ?14, ?15, ?16,
            ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24
         )",
        params![
            &item_type,
            &trimmed_title,
            &description,
            &tags,
            &genre,
            db_rating,
            api_rating,
            &note,
            &saved_rel_path,
            release_year,
            &duration,
            &director,
            &writer,
            &cast_members,
            &production,
            &season_episodes,
            &developer,
            &publisher,
            &game_mode,
            &platforms,
            &engine,
            &custom_meta_json,
            &status,
            &trailer_url,
        ],
    )
    .map_err(|e| e.to_string())?;

    let last_id = conn.last_insert_rowid();

    let (created_at, updated_at): (String, String) = conn
        .query_row(
            "SELECT created_at, updated_at FROM media_items WHERE id = ?1",
            params![last_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .unwrap_or_else(|_| ("Nyní".to_string(), "Nyní".to_string()));

    Ok(MediaItem {
        id: last_id,
        item_type,
        title: trimmed_title,
        description,
        tags,
        genre,
        rating,
        api_rating,
        note,
        image_path: saved_rel_path,
        image_data: saved_image_data,
        release_year,
        duration,
        director,
        writer,
        cast_members,
        production,
        season_episodes,
        developer,
        publisher,
        game_mode,
        platforms,
        engine,
        custom_metadata,
        status,
        trailer_url,
        created_at,
        updated_at,
    })
}

/// 3. Příkaz: Úprava existující položky v databázi (včetně správy obrázku)
#[tauri::command]
fn update_item(
    state: tauri::State<'_, AppState>,
    item: UpdateMediaItemInput,
) -> Result<MediaItem, String> {
    let trimmed_title = item.title.trim().to_string();
    if trimmed_title.is_empty() {
        return Err("Název položky nesmí být prázdný.".to_string());
    }

    if let Some(r) = item.rating {
        if r < 0.0 || r > 10.0 {
            return Err("Hodnocení musí být číslo v rozmezí od 0 do 10 (např. 8, 6.5 nebo 6.25).".to_string());
        }
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Zjistíme současný obrázek položky
    let current_image_path: Option<String> = conn
        .query_row(
            "SELECT image_path FROM media_items WHERE id = ?1",
            params![item.id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Položka s ID {} nebyla nalezena: {}", item.id, e))?;

    let mut final_image_path = current_image_path.clone();
    let mut final_image_data: Option<String> = None;

    if item.remove_image {
        // Uživatel si přeje obrázek smazat
        if let Some(ref old_file) = current_image_path {
            let old_full_path = state.covers_dir.join(old_file);
            if old_full_path.exists() {
                let _ = fs::remove_file(old_full_path);
            }
        }
        final_image_path = None;
    } else if let Some(ref new_src_str) = item.image_source_path {
        // Uživatel vybral nový obrázek
        let src_path = PathBuf::from(new_src_str);
        if src_path.exists() && src_path.is_file() {
            // Smažeme starý soubor
            if let Some(ref old_file) = current_image_path {
                let old_full_path = state.covers_dir.join(old_file);
                if old_full_path.exists() {
                    let _ = fs::remove_file(old_full_path);
                }
            }

            let ext = src_path
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or("jpg")
                .to_lowercase();

            let unique_file_name = format!("{}.{}", Uuid::new_v4(), ext);
            let dest_path = state.covers_dir.join(&unique_file_name);

            fs::copy(&src_path, &dest_path).map_err(|e| {
                format!("Nepodařilo se zkopírovat nový obrázek: {}", e)
            })?;

            final_image_data = Some(dest_path.to_string_lossy().to_string());
            final_image_path = Some(unique_file_name);
        }
    } else if let Some(ref existing_file) = final_image_path {
        // Obrázek zůstává nezměněn, nastavíme cestu pro náhled
        let full_path = state.covers_dir.join(existing_file);
        if full_path.exists() {
            final_image_data = Some(full_path.to_string_lossy().to_string());
        }
    }

    let item_type = item.item_type;
    let description = item.description.unwrap_or_default();
    let tags = item.tags.unwrap_or_default();
    let genre = item.genre.unwrap_or_default();
    let rating = item.rating;
    let db_rating = item.rating;
    let api_rating = item.api_rating;
    let note = item.note.unwrap_or_default();
    let release_year = item.release_year;
    let duration = item.duration.unwrap_or_default();
    let director = item.director.unwrap_or_default();
    let writer = item.writer.unwrap_or_default();
    let cast_members = item.cast_members.unwrap_or_default();
    let production = item.production.unwrap_or_default();
    let season_episodes = item.season_episodes.unwrap_or_default();
    let developer = item.developer.unwrap_or_default();
    let publisher = item.publisher.unwrap_or_default();
    let game_mode = item.game_mode.unwrap_or_default();
    let platforms = item.platforms.unwrap_or_default();
    let engine = item.engine.unwrap_or_default();
    let custom_metadata = item.custom_metadata.unwrap_or_default();
    let status = item.status.unwrap_or_else(|| "completed".to_string());
    let trailer_url = item.trailer_url.unwrap_or_default();

    let custom_meta_json = serde_json::to_string(&custom_metadata)
        .unwrap_or_else(|_| "{}".to_string());

    conn.execute(
        "UPDATE media_items SET
            item_type = ?1,
            title = ?2,
            description = ?3,
            tags = ?4,
            genre = ?5,
            rating = ?6,
            api_rating = ?7,
            note = ?8,
            image_path = ?9,
            release_year = ?10,
            duration = ?11,
            director = ?12,
            writer = ?13,
            cast_members = ?14,
            production = ?15,
            season_episodes = ?16,
            developer = ?17,
            publisher = ?18,
            game_mode = ?19,
            platforms = ?20,
            engine = ?21,
            custom_metadata = ?22,
            status = ?23,
            trailer_url = ?24,
            updated_at = (datetime('now', 'localtime'))
         WHERE id = ?25",
        params![
            &item_type,
            &trimmed_title,
            &description,
            &tags,
            &genre,
            db_rating,
            api_rating,
            &note,
            &final_image_path,
            release_year,
            &duration,
            &director,
            &writer,
            &cast_members,
            &production,
            &season_episodes,
            &developer,
            &publisher,
            &game_mode,
            &platforms,
            &engine,
            &custom_meta_json,
            &status,
            &trailer_url,
            item.id,
        ],
    )
    .map_err(|e| e.to_string())?;

    let (created_at, updated_at): (String, String) = conn
        .query_row(
            "SELECT created_at, updated_at FROM media_items WHERE id = ?1",
            params![item.id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .unwrap_or_else(|_| ("Nyní".to_string(), "Nyní".to_string()));

    Ok(MediaItem {
        id: item.id,
        item_type,
        title: trimmed_title,
        description,
        tags,
        genre,
        rating,
        api_rating,
        note,
        image_path: final_image_path,
        image_data: final_image_data,
        release_year,
        duration,
        director,
        writer,
        cast_members,
        production,
        season_episodes,
        developer,
        publisher,
        game_mode,
        platforms,
        engine,
        custom_metadata,
        status,
        trailer_url,
        created_at,
        updated_at,
    })
}

/// 4. Příkaz: Smazání položky (odstraní záznam i soubor obrázku z disku)
#[tauri::command]
fn delete_item(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let image_path: Option<String> = conn
        .query_row(
            "SELECT image_path FROM media_items WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .ok()
        .flatten();

    conn.execute("DELETE FROM media_items WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    if let Some(file_name) = image_path {
        let full_path = state.covers_dir.join(file_name);
        if full_path.exists() {
            let _ = fs::remove_file(full_path);
        }
    }

    Ok(())
}

/// 5. Pomocný příkaz: Nativní dialog pro výběr obrázku
#[tauri::command]
fn select_image() -> Result<Option<String>, String> {
    let file = rfd::FileDialog::new()
        .add_filter(
            "Obrázky (*.jpg, *.jpeg, *.png, *.webp)",
            &["jpg", "jpeg", "png", "webp", "gif"],
        )
        .set_title("Vyberte plakát nebo náhledový obrázek")
        .pick_file();

    Ok(file.map(|p| p.to_string_lossy().to_string()))
}

/// 6. Pomocný příkaz: Uložení obrázku (např. staženého z TMDB) z Base64 do dočasné složky
#[tauri::command]
fn save_image_from_base64(
    state: tauri::State<'_, AppState>,
    base64_data: String,
    ext: String,
) -> Result<String, String> {
    let clean_b64 = if let Some(idx) = base64_data.find(',') {
        &base64_data[idx + 1..]
    } else {
        &base64_data
    };

    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(clean_b64.trim())
        .map_err(|e| format!("Chyba při dekódování base64 obrázku: {}", e))?;

    let clean_ext = match ext.to_lowercase().as_str() {
        "png" => "png",
        "webp" => "webp",
        _ => "jpg",
    };

    let temp_dir = state.app_data_dir.join("temp_imports");
    if !temp_dir.exists() {
        let _ = fs::create_dir_all(&temp_dir);
    }

    let file_name = format!("edited_{}.{}", Uuid::new_v4(), clean_ext);
    let dest_path = temp_dir.join(&file_name);
    fs::write(&dest_path, bytes).map_err(|e| format!("Chyba při ukládání souboru obrázku: {}", e))?;

    Ok(dest_path.to_string_lossy().to_string())
}

/// 6. Příkaz: Otevření složky s daty aplikace v systémovém průzkumníku souborů
#[tauri::command]
fn open_data_folder(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let path = &state.app_data_dir;

    if !path.exists() {
        let _ = fs::create_dir_all(path);
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Chyba při otevírání Průzkumníka: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Chyba při otevírání správce souborů: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Chyba při otevírání Finderu: {}", e))?;
    }

    Ok(())
}

#[derive(serde::Serialize)]
struct TempFilesInfo {
    count: usize,
    total_size_bytes: u64,
}

/// Zjištění počtu a celkové velikosti dočasných souborů ve složce temp_imports
#[tauri::command]
fn get_temp_files_info(state: tauri::State<'_, AppState>) -> Result<TempFilesInfo, String> {
    let temp_dir = state.app_data_dir.join("temp_imports");
    if !temp_dir.exists() {
        return Ok(TempFilesInfo {
            count: 0,
            total_size_bytes: 0,
        });
    }

    let mut count = 0;
    let mut total_size_bytes: u64 = 0;
    if let Ok(entries) = fs::read_dir(&temp_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                count += 1;
                if let Ok(metadata) = fs::metadata(&path) {
                    total_size_bytes += metadata.len();
                }
            }
        }
    }

    Ok(TempFilesInfo {
        count,
        total_size_bytes,
    })
}

#[derive(serde::Serialize)]
struct CoversFilesInfo {
    count: usize,
    total_size_bytes: u64,
}

/// Zjištění počtu a celkové velikosti obálek ve složce covers
#[tauri::command]
fn get_covers_files_info(state: tauri::State<'_, AppState>) -> Result<CoversFilesInfo, String> {
    if !state.covers_dir.exists() {
        return Ok(CoversFilesInfo {
            count: 0,
            total_size_bytes: 0,
        });
    }

    let mut count = 0;
    let mut total_size_bytes: u64 = 0;
    if let Ok(entries) = fs::read_dir(&state.covers_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                count += 1;
                if let Ok(metadata) = fs::metadata(&path) {
                    total_size_bytes += metadata.len();
                }
            }
        }
    }

    Ok(CoversFilesInfo {
        count,
        total_size_bytes,
    })
}

/// 7. Příkaz: Vyčištění dočasných importovaných souborů ze složky temp_imports
#[tauri::command]
fn clear_temp_files(state: tauri::State<'_, AppState>) -> Result<usize, String> {
    let temp_dir = state.app_data_dir.join("temp_imports");
    if !temp_dir.exists() {
        return Ok(0);
    }

    let mut deleted_count = 0;
    if let Ok(entries) = fs::read_dir(&temp_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if fs::remove_file(&path).is_ok() {
                    deleted_count += 1;
                }
            } else if path.is_dir() {
                let _ = fs::remove_dir_all(&path);
            }
        }
    }

    Ok(deleted_count)
}

/// 8. Příkaz: Rychlá aktualizace pouze stavu položky (backlog, in_progress, completed, dropped)
#[tauri::command]
fn update_item_status(
    state: tauri::State<'_, AppState>,
    id: i64,
    status: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE media_items SET status = ?1, updated_at = datetime('now', 'localtime') WHERE id = ?2",
        params![status, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(serde::Serialize)]
struct DownloadImageResponse {
    image_path: String,
    base64_data: String,
}

/// 9. Příkaz: Spolehlivé stažení obrázku z externí URL (RAWG / TMDB) s obcházením CORS
#[tauri::command]
fn download_and_save_image(
    state: tauri::State<'_, AppState>,
    url: String,
) -> Result<DownloadImageResponse, String> {
    let trimmed = url.trim();
    if trimmed.is_empty() {
        return Err("URL adresa obrázku je prázdná.".to_string());
    }

    #[cfg(target_os = "windows")]
    let output = std::process::Command::new("curl.exe")
        .args([
            "-s",
            "-L",
            "--max-time",
            "18",
            "-A",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            trimmed,
        ])
        .output()
        .map_err(|e| format!("Nepodařilo se spustit stahování curl: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let output = std::process::Command::new("curl")
        .args([
            "-s",
            "-L",
            "--max-time",
            "18",
            "-A",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            trimmed,
        ])
        .output()
        .map_err(|e| format!("Nepodařilo se spustit stahování curl: {}", e))?;

    if !output.status.success() || output.stdout.is_empty() {
        return Err(format!("Stažení obrázku z '{}' selhalo nebo byl vrácen prázdný obsah.", trimmed));
    }

    let bytes = output.stdout;

    let (ext, mime) = if bytes.starts_with(&[0x89, 0x50, 0x4E, 0x47]) {
        ("png", "image/png")
    } else if bytes.starts_with(b"RIFF") && bytes.len() > 12 && &bytes[8..12] == b"WEBP" {
        ("webp", "image/webp")
    } else {
        ("jpg", "image/jpeg")
    };

    use base64::Engine;
    let b64_str = base64::engine::general_purpose::STANDARD.encode(&bytes);
    let full_b64 = format!("data:{};base64,{}", mime, b64_str);

    let temp_dir = state.app_data_dir.join("temp_imports");
    if !temp_dir.exists() {
        let _ = fs::create_dir_all(&temp_dir);
    }

    let file_name = format!("import_{}.{}", Uuid::new_v4(), ext);
    let dest_path = temp_dir.join(&file_name);
    fs::write(&dest_path, &bytes).map_err(|e| format!("Chyba při zápisu souboru obrázku: {}", e))?;

    Ok(DownloadImageResponse {
        image_path: dest_path.to_string_lossy().to_string(),
        base64_data: full_b64,
    })
}

/// 8. Příkaz: Bezpečné otevření externí webové URL adresy ve výchozím prohlížeči systému
#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    let trimmed = url.trim();
    if trimmed.is_empty() {
        return Err("URL adresa nesmí být prázdná.".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", trimmed])
            .spawn()
            .map_err(|e| format!("Chyba při otevírání odkazu: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Chyba při otevírání odkazu: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Chyba při otevírání odkazu: {}", e))?;
    }
    Ok(())
}

/// Zobrazí hlavní okno aplikace po dokončení vykreslení HTML/CSS,
/// čímž se stoprocentně zamezí jakémukoliv probliknutí šedé barvy WebView2.
#[tauri::command]
fn show_main_window(window: tauri::WebviewWindow) {
    let _ = window.show();
    let _ = window.set_focus();
}

/// Inicializace a spuštění Tauri v2 aplikace
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let main_win = app.get_webview_window("main");
            if let Some(w) = &main_win {
                if let Some(icon) = app.default_window_icon() {
                    let _ = w.set_icon(icon.clone());
                }
                // Pojistka: pokud by frontend z nějakého neočekávaného důvodu nezavolal show,
                // okno se bezpečně zobrazí po 1,5 sekundě
                let w_clone = w.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(1500));
                    let _ = w_clone.show();
                });
            }

            // Zjištění složky aplikace: Podpora pro plnohodnotný Portable režim
            // Pokud vedle souboru .exe existuje soubor 'portable.txt' nebo podsložka 'data',
            // veškerá data (SQLite databáze i stažené obálky) se ukládají lokálně na stejné místo (např. USB flash disk).
            let exe_dir = std::env::current_exe()
                .ok()
                .and_then(|p| p.parent().map(|d| d.to_path_buf()));

            let is_portable = exe_dir.as_ref().map_or(false, |d| {
                d.join("portable.txt").exists() || d.join("data").exists() || d.join(".portable").exists()
            });

            let app_data_dir = if is_portable {
                let p_dir = exe_dir.unwrap().join("data");
                let _ = fs::create_dir_all(&p_dir);
                p_dir
            } else {
                app.path()
                    .app_local_data_dir()
                    .expect("Nepodařilo se zjistit složku aplikace")
            };

            fs::create_dir_all(&app_data_dir)
                .expect("Nepodařilo se vytvořit složku aplikace");

            let covers_dir = app_data_dir.join("covers");
            fs::create_dir_all(&covers_dir)
                .expect("Nepodařilo se vytvořit podsložku 'covers'");

            let _ = app.asset_protocol_scope().allow_directory(&app_data_dir, true);

            let db_path = app_data_dir.join("tracker.sqlite");
            let conn = Connection::open(&db_path)
                .expect("Nepodařilo se otevřít SQLite databázi");

            // Vytvoření tabulky se všemi požadovanými sloupci
            conn.execute_batch(
                "CREATE TABLE IF NOT EXISTS media_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    tags TEXT NOT NULL DEFAULT '',
                    genre TEXT NOT NULL DEFAULT '',
                    rating REAL NOT NULL DEFAULT 8,
                    api_rating REAL,
                    note TEXT NOT NULL DEFAULT '',
                    image_path TEXT,
                    release_year INTEGER,
                    duration TEXT NOT NULL DEFAULT '',
                    director TEXT NOT NULL DEFAULT '',
                    writer TEXT NOT NULL DEFAULT '',
                    cast_members TEXT NOT NULL DEFAULT '',
                    production TEXT NOT NULL DEFAULT '',
                    season_episodes TEXT NOT NULL DEFAULT '',
                    developer TEXT NOT NULL DEFAULT '',
                    publisher TEXT NOT NULL DEFAULT '',
                    game_mode TEXT NOT NULL DEFAULT '',
                    platforms TEXT NOT NULL DEFAULT '',
                    engine TEXT NOT NULL DEFAULT '',
                    custom_metadata TEXT NOT NULL DEFAULT '{}',
                    status TEXT NOT NULL DEFAULT 'completed',
                    trailer_url TEXT NOT NULL DEFAULT '',
                    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
                    updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
                );"
            ).expect("Nepodařilo se inicializovat schéma databáze");

            // Kontrola a automatická migrace sloupce rating (povolení NULL a odstranění starého CHECK omezení rating >= 1)
            let table_sql: String = conn
                .query_row(
                    "SELECT sql FROM sqlite_master WHERE type='table' AND name='media_items'",
                    [],
                    |row| row.get(0),
                )
                .unwrap_or_default();

            if table_sql.contains("CHECK(rating >= 1") || table_sql.contains("rating INTEGER") || table_sql.contains("rating REAL NOT NULL") {
                let _ = conn.execute_batch(
                    "PRAGMA foreign_keys=off;
                     BEGIN TRANSACTION;
                     CREATE TABLE IF NOT EXISTS media_items_mig (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        item_type TEXT NOT NULL,
                        title TEXT NOT NULL,
                        description TEXT NOT NULL DEFAULT '',
                        tags TEXT NOT NULL DEFAULT '',
                        genre TEXT NOT NULL DEFAULT '',
                        rating REAL,
                        api_rating REAL,
                        note TEXT NOT NULL DEFAULT '',
                        image_path TEXT,
                        release_year INTEGER,
                        duration TEXT NOT NULL DEFAULT '',
                        director TEXT NOT NULL DEFAULT '',
                        writer TEXT NOT NULL DEFAULT '',
                        cast_members TEXT NOT NULL DEFAULT '',
                        production TEXT NOT NULL DEFAULT '',
                        season_episodes TEXT NOT NULL DEFAULT '',
                        developer TEXT NOT NULL DEFAULT '',
                        publisher TEXT NOT NULL DEFAULT '',
                        game_mode TEXT NOT NULL DEFAULT '',
                        platforms TEXT NOT NULL DEFAULT '',
                        engine TEXT NOT NULL DEFAULT '',
                        custom_metadata TEXT NOT NULL DEFAULT '{}',
                        status TEXT NOT NULL DEFAULT 'completed',
                        trailer_url TEXT NOT NULL DEFAULT '',
                        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
                        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
                     );
                     INSERT INTO media_items_mig (
                        id, item_type, title, description, tags, genre, rating, api_rating, note, image_path,
                        release_year, duration, director, writer, cast_members, production, season_episodes,
                        developer, publisher, game_mode, platforms, engine, custom_metadata, status, trailer_url,
                        created_at, updated_at
                     )
                     SELECT 
                        id, item_type, title, description, tags, genre,
                        CASE WHEN rating < 0 THEN NULL ELSE rating END,
                        api_rating, note, image_path,
                        release_year, duration, director, writer, cast_members, production, season_episodes,
                        developer, publisher, game_mode, platforms, engine, custom_metadata, status, trailer_url,
                        created_at, updated_at
                     FROM media_items;
                     DROP TABLE media_items;
                     ALTER TABLE media_items_mig RENAME TO media_items;
                     COMMIT;
                     PRAGMA foreign_keys=on;"
                );
            }

            // Migrace: pokud databáze existovala dříve se starší strukturou, přidáme případné chybějící sloupce
            let columns_to_add = [
                ("description", "TEXT NOT NULL DEFAULT ''"),
                ("tags", "TEXT NOT NULL DEFAULT ''"),
                ("genre", "TEXT NOT NULL DEFAULT ''"),
                ("api_rating", "REAL"),
                ("release_year", "INTEGER"),
                ("duration", "TEXT NOT NULL DEFAULT ''"),
                ("director", "TEXT NOT NULL DEFAULT ''"),
                ("writer", "TEXT NOT NULL DEFAULT ''"),
                ("cast_members", "TEXT NOT NULL DEFAULT ''"),
                ("production", "TEXT NOT NULL DEFAULT ''"),
                ("season_episodes", "TEXT NOT NULL DEFAULT ''"),
                ("developer", "TEXT NOT NULL DEFAULT ''"),
                ("publisher", "TEXT NOT NULL DEFAULT ''"),
                ("game_mode", "TEXT NOT NULL DEFAULT ''"),
                ("platforms", "TEXT NOT NULL DEFAULT ''"),
                ("engine", "TEXT NOT NULL DEFAULT ''"),
                ("custom_metadata", "TEXT NOT NULL DEFAULT '{}'"),
                ("status", "TEXT NOT NULL DEFAULT 'completed'"),
                ("trailer_url", "TEXT NOT NULL DEFAULT ''"),
                ("updated_at", "DATETIME DEFAULT (datetime('now', 'localtime'))"),
            ];

            for (col_name, col_def) in columns_to_add {
                let alter_query = format!("ALTER TABLE media_items ADD COLUMN {} {}", col_name, col_def);
                let _ = conn.execute(&alter_query, []);
            }

            app.manage(AppState {
                db: Mutex::new(conn),
                covers_dir,
                app_data_dir,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_items,
            add_item,
            update_item,
            delete_item,
            select_image,
            open_data_folder,
            get_temp_files_info,
            get_covers_files_info,
            clear_temp_files,
            show_main_window,
            save_image_from_base64,
            download_and_save_image,
            update_item_status,
            open_url
        ])
        .run(tauri::generate_context!())
        .expect("Chyba při běhu aplikace Tracker");
}