/**
 * Tracker - i18n Lokalizační systém
 * Umožňuje vícejazyčné rozhraní (aktuálně Čeština a English).
 */

const TRANSLATIONS = {
  cs: {
    settings: {
      headerTitle: "Nastavení aplikace",
      closeAria: "Zavřít",

      // 1. Jazyk
      sectionLanguage: "Jazyk",
      langLabel: "Jazyk aplikace",
      langDesc: "Zvolte preferovaný jazyk uživatelského rozhraní",
      langCs: "Čeština",
      langEn: "English",

      // 2. Předvolby zobrazení
      sectionDisplay: "Předvolby zobrazení",

      viewLabel: "Výchozí rozvržení",
      viewDesc: "Způsob jakým se budou načtené položky zobrazovat",
      viewGrid: "Dlaždice",
      viewCompact: "Kompaktní mřížka",
      viewList: "Detailní seznam",

      perPageLabel: "Položek na stránku",
      perPageDesc: "Počet položek zobrazených na jedné stránce",
      perPage12: "12 položek",
      perPage24: "24 položek",
      perPage48: "48 položek",
      perPage96: "96 položek",
      perPageAll: "Vše (Nekonečné rolování)",

      // 2. Integrace a online API
      sectionApi: "Integrace a online API",
      tmdbKeyLabel: "TMDB API klíč",
      tmdbKeyDesc: "Umožňuje vyhledávat a automaticky stahovat informace i obálky filmů a seriálů",
      getKeyBtn: "Získat klíč",
      tmdbLinkTitle: "Otevřít stránku themoviedb.org a získat API klíč (v prohlížeči)",
      tmdbKeyPlaceholder: "Zadejte váš TMDB API klíč...",
      showHideKeyTitle: "Zobrazit / skrýt klíč",

      rawgKeyLabel: "RAWG.io API klíč",
      rawgKeyDesc: "Umožňuje vyhledávat a automaticky stahovat informace i obálky her",
      rawgLinkTitle: "Otevřít stránku rawg.io a získat API klíč (v prohlížeči)",
      rawgKeyPlaceholder: "Zadejte váš RAWG API klíč...",

      // 3. Úložiště a databáze
      sectionStorage: "Úložiště a databáze",
      dbSystemLabel: "Systém databáze:",
      dbSystemVal: "SQLite (vestavěný, bez externích závislostí)",
      storagePathLabel: "Úložiště:",
      storagePathVal: "Lokální složka aplikace (User\\AppData\\Local\\com.tracker.app)",
      itemsCountLabel: "Počet uložených položek:",
      tempCountLabel: "Počet dočasných položek:",

      openDataFolderBtn: "Otevřít složku s daty",
      openDataFolderTitle: "Otevřít složku s daty aplikace v systémovém Průzkumníku",
      clearTempBtn: "Vyčistit dočasné soubory",
      clearTempTitle: "Smazat dočasně stažené soubory obálek",

      webpQualityLabel: "Kvalita komprese obálek (formát WebP)",
      webpQualityDesc: "Ovlivňuje ostrost detailů vs. velikost souborů (doporučeno kolem 85–90 %)",
      optimizeCoversBtn: "Optimalizovat obálky do WebP",
      optimizeCoversTitle: "Legacy: Převede stávající obálky na úsporný formát WebP (500×750 px)",

      // 4. Záloha
      sectionBackup: "Záloha",
      backupDesc: "Uložte celou svou databázi do záložního souboru JSON pro bezpečné uchování nebo přenos. Soubor se automaticky vytvoří <strong>do vaší systémové složky</strong>.",
      backupHint: "📁 Uloží se do složky: Stažené soubory",
      exportBackupBtn: "Vytvořit zálohu (.json)",

      // 5. Podpora a hlášení chyb
      sectionSupport: "Podpora a hlášení chyb",
      supportDesc: "Našli jste v aplikaci chybu nebo máte nápad na vylepšení? Otevřete issue na GitHubu projektu.",
      reportBugBtn: "Nahlásit chybu",

      // Patička
      createdBy: "Vytvořil <strong>MichalBr</strong>",
      cancelBtn: "Zavřít",
      saveBtn: "Uložit nastavení",

      // Dialogy, toasty a stavy
      savedToast: "Nastavení bylo úspěšně uloženo.",
      openDataFolderToast: "Otevírám složku s daty aplikace v Průzkumníku...",
      openDataFolderErrorToast: "Nepodařilo se otevřít složku: ",
      tempClearedToast: "Dočasné soubory byly vyčištěny (smazáno: {count}).",
      tempAlreadyEmptyToast: "Složka dočasných souborů je již prázdná.",
      tempClearErrorToast: "Nepodařilo se vyčistit dočasné soubory: ",
      allCoversWebpToast: "Všechny vaše obálky již jsou v moderním formátu WebP (500×750 px).",
      optimizeConfirmTitle: "Optimalizovat stávající obálky",
      optimizeConfirmMsg: "Nalezeno {count} obálek ke konverzi. Obrázky budou oříznuty na poměr 2:3, zmenšeny na zlatý střed 500×750 px a převedeny na WebP. Ušetří se místo na disku a zrychlí načítání. Chcete pokračovat?",
      optimizeConfirmOk: "Ano, optimalizovat",
      optimizeConfirmCancel: "Zrušit",
      optimizingToast: "Zahajuji optimalizaci {count} obálek...",
      optimizedDoneToast: "Hotovo! Převedeno a zmenšeno {success} z {total} obálek do WebP.",
      exportSuccessToast: "Záloha \"{fileName}\" byla stažena do složky Downloads.",
      exportErrorToast: "Nepodařilo se exportovat zálohu: "
    }
  },
  en: {
    settings: {
      headerTitle: "Application Settings",
      closeAria: "Close",

      // 1. Language
      sectionLanguage: "Language",
      langLabel: "Application Language",
      langDesc: "Select your preferred user interface language",
      langCs: "Čeština",
      langEn: "English",

      // 2. Display preferences
      sectionDisplay: "Display Preferences",

      viewLabel: "Default Layout",
      viewDesc: "How loaded items should be displayed by default",
      viewGrid: "Grid",
      viewCompact: "Compact Grid",
      viewList: "Detailed List",

      perPageLabel: "Items per Page",
      perPageDesc: "Number of items displayed on one page",
      perPage12: "12 items",
      perPage24: "24 items",
      perPage48: "48 items",
      perPage96: "96 items",
      perPageAll: "All (Infinite Scroll)",

      // 2. Integrations & Online APIs
      sectionApi: "Integrations & Online APIs",
      tmdbKeyLabel: "TMDB API Key",
      tmdbKeyDesc: "Enables searching and automatic retrieval of movie & TV show metadata and posters",
      getKeyBtn: "Get Key",
      tmdbLinkTitle: "Open themoviedb.org to get an API key (in browser)",
      tmdbKeyPlaceholder: "Enter your TMDB API key...",
      showHideKeyTitle: "Show / hide key",

      rawgKeyLabel: "RAWG.io API Key",
      rawgKeyDesc: "Enables searching and automatic retrieval of game metadata and covers",
      rawgLinkTitle: "Open rawg.io to get an API key (in browser)",
      rawgKeyPlaceholder: "Enter your RAWG API key...",

      // 3. Storage & Database
      sectionStorage: "Storage & Database",
      dbSystemLabel: "Database Engine:",
      dbSystemVal: "SQLite (embedded, zero dependencies)",
      storagePathLabel: "Storage:",
      storagePathVal: "Local application folder (User\\AppData\\Local\\com.tracker.app)",
      itemsCountLabel: "Saved items count:",
      tempCountLabel: "Temporary items count:",

      openDataFolderBtn: "Open Data Folder",
      openDataFolderTitle: "Open application data folder in system Explorer",
      clearTempBtn: "Clear Temporary Files",
      clearTempTitle: "Delete temporarily downloaded cover files",

      webpQualityLabel: "Cover compression quality (WebP format)",
      webpQualityDesc: "Affects detail sharpness vs. file size (recommended ~85–90%)",
      optimizeCoversBtn: "Optimize covers to WebP",
      optimizeCoversTitle: "Legacy: Converts existing covers to compact WebP format (500×750 px)",

      // 4. Backup
      sectionBackup: "Backup",
      backupDesc: "Save your entire database into a JSON backup file for secure storage or migration. The file will be created <strong>in your system folder</strong>.",
      backupHint: "📁 Saved to folder: Downloads",
      exportBackupBtn: "Create Backup (.json)",

      // 5. Support & Bug Reports
      sectionSupport: "Support & Bug Reports",
      supportDesc: "Found a bug or have an idea for improvement? Open an issue on GitHub.",
      reportBugBtn: "Report a Bug",

      // Footer
      createdBy: "Created by <strong>MichalBr</strong>",
      cancelBtn: "Close",
      saveBtn: "Save Settings",

      // Dialogs, toasts & states
      savedToast: "Settings have been successfully saved.",
      openDataFolderToast: "Opening application data folder in Explorer...",
      openDataFolderErrorToast: "Failed to open data folder: ",
      tempClearedToast: "Temporary files have been cleared (deleted: {count}).",
      tempAlreadyEmptyToast: "Temporary files folder is already empty.",
      tempClearErrorToast: "Failed to clear temporary files: ",
      allCoversWebpToast: "All your covers are already in modern WebP format (500×750 px).",
      optimizeConfirmTitle: "Optimize Existing Covers",
      optimizeConfirmMsg: "Found {count} covers to convert. Images will be cropped to 2:3 ratio, resized to 500×750 px and converted to WebP. This saves disk space and speeds up loading. Do you want to continue?",
      optimizeConfirmOk: "Yes, optimize",
      optimizeConfirmCancel: "Cancel",
      optimizingToast: "Starting optimization of {count} covers...",
      optimizedDoneToast: "Done! Converted and optimized {success} of {total} covers to WebP.",
      exportSuccessToast: "Backup \"{fileName}\" has been downloaded to the Downloads folder.",
      exportErrorToast: "Failed to export backup: "
    }
  }
};

/**
 * Získá aktuálně nastavený jazyk (výchozí: 'cs')
 */
function getLanguage() {
  return localStorage.getItem("tracker_lang") || "cs";
}

/**
 * Získá přeložený text podle klíče s podporou fallbacku a parametrů {param}
 */
function t(path, params = {}, fallback = "") {
  const lang = getLanguage();
  const keys = path.split(".");

  let val = keys.reduce((obj, k) => obj?.[k], TRANSLATIONS[lang]);
  if ((val === undefined || val === null) && lang !== "cs") {
    val = keys.reduce((obj, k) => obj?.[k], TRANSLATIONS.cs);
  }

  if (typeof val !== "string") {
    return fallback || path;
  }

  // Nahrazení proměnných {count}, {success}, atd.
  return val.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
}

/**
 * Naformátuje počet položek podle jazyka (správné skloňování v CS vs EN)
 */
function formatItemCount(count) {
  const lang = getLanguage();
  const num = typeof count === "number" ? count : parseInt(count, 10) || 0;
  if (lang === "en") {
    return `${num} ${num === 1 ? "item" : "items"}`;
  }
  const word = num === 1 ? "položka" : (num >= 2 && num <= 4 ? "položky" : "položek");
  return `${num} ${word}`;
}

/**
 * Aplikuje překlady na označené DOM elementy
 */
function applyTranslations(root = document) {
  // 1. Textový obsah
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

  // 2. HTML obsah (např. značky <strong>)
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) {
      el.innerHTML = t(key);
    }
  });

  // 3. Placeholdery
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.setAttribute("placeholder", t(key));
    }
  });

  // 4. Titulky (tooltipy)
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) {
      el.setAttribute("title", t(key));
    }
  });

  // 5. Aria-label
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) {
      el.setAttribute("aria-label", t(key));
    }
  });
}

/**
 * Nastaví a uloží nový jazyk a ihned aktualizuje překlady
 */
function setLanguage(lang) {
  const validLang = lang === "en" ? "en" : "cs";
  localStorage.setItem("tracker_lang", validLang);
  applyTranslations();
  window.dispatchEvent(new CustomEvent("tracker:languageChanged", { detail: { lang: validLang } }));
}

// Export do globálního kontextu pro použití v main.js
window.i18n = {
  TRANSLATIONS,
  getLanguage,
  setLanguage,
  t,
  formatItemCount,
  applyTranslations
};
