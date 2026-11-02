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

      // 5. Aktualizace aplikace
      sectionUpdates: "Aktualizace aplikace",
      currentVersionLabel: "Nainstalovaná verze",
      updateCheckDesc: "Ověřte, zda je na GitHubu k dispozici novější verze aplikace Tracker.",
      checkUpdateBtn: "Zkontrolovat aktualizace",
      checkingUpdates: "Ověřuji...",
      checkAgainBtn: "Zkontrolovat znovu",
      upToDateStatus: "Máte nejnovější verzi aplikace ({version}).",
      updateAvailableStatus: "Je k dispozici nová verze: <strong>{version}</strong>!",
      downloadUpdateBtn: "Stáhnout novou verzi",
      viewReleaseNotes: "Zobrazit novinky",
      updateCheckError: "Nepodařilo se ověřit aktualizace. Zkontrolujte připojení k internetu.",
      rateLimitBadge: "Limit API",
      rateLimitError: "Byl dočasně vyčerpán limit GitHub API (60 dotazů/hod). Zkuste to prosím za chvíli.",
      newVersionToast: "Byla nalezena nová verze aplikace Tracker ({version})!",
      upToDateToast: "Používáte nejnovější verzi ({version}).",
      changelogTitle: "Co je nového v této verzi:",
      changelogLoading: "Načítám přehled změn...",
      changelogEmpty: "Podrobnosti o změnách nebyly nalezeny.",

      // 6. Podpora a hlášení chyb
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
    },
    form: {
      modalTitleAdd: "Přidat novou položku",
      modalTitleEdit: "Upravit položku",
      modalTitleEditWithTitle: "Upravit: {title}",
      modalTitleAddWithTitle: "Přidat: {title}",
      importTmdbBtnTitle: "Předvyplnit z mezinárodní databáze TMDB",
      importTmdbBtnText: "Načíst z TMDB",
      importRawgBtnTitle: "Předvyplnit z herní databáze RAWG.io",
      importRawgBtnText: "Načíst z RAWG",
      closeBtnAria: "Zavřít",

      // 1. Kategorie a stav
      sectionCategoryStatus: "Kategorie a stav",
      itemTypeLabel: "Typ položky",
      typeFilm: "Film",
      typeSeries: "Seriál",
      typeGame: "Hra",
      statusLabel: "Stav sledování / hraní",
      statusBacklogMovie: "Chci vidět",
      statusBacklogGame: "Chci hrát",
      statusProgressMovie: "Právě sleduji",
      statusProgressGame: "Právě hraji",
      statusCompletedMovie: "Zhlédnuto",
      statusCompletedGame: "Dohráno",
      statusDropped: "Odloženo",

      // 2. Základní informace
      sectionBasicInfo: "Základní informace",
      titleLabel: "Název",
      requiredTitle: "Povinné pole",
      titlePlaceholder: "Např. Interstellar, The Last of Us, Cyberpunk...",
      yearLabel: "Rok vydání",
      yearPlaceholder: "2024",
      genreLabel: "Žánr",
      genrePlaceholder: "Sci-Fi, RPG, Drama...",
      tagsLabel: "Klíčová slova (Tagy)",
      tagsPlaceholder: "Oddělujte čárkou, např.: vesmír, cyberpunk, kooperace, otevřený svět",
      descLabel: "Popis",
      descPlaceholder: "Stručný popis příběhu, herního konceptu nebo synopse...",

      // 3. Informace o filmu / seriálu
      sectionFilmSeries: "Informace o filmu / seriálu",
      directorLabel: "Režie",
      directorPlaceholder: "Např. Christopher Nolan",
      writerLabel: "Scénář",
      writerPlaceholder: "Např. Jonathan Nolan",
      productionLabel: "Produkce / Studio",
      productionPlaceholder: "Např. Warner Bros., HBO, Netflix",
      durationLabel: "Délka",
      durationPlaceholder: "Např. 169 min nebo 50 min/ep",
      seasonEpisodesLabel: "Struktura - Číslo řady nebo epizody",
      seasonEpisodesPlaceholder: "Např. 2. série (8 epizod) nebo S02E05",
      castLabel: "Herecké obsazení",
      castPlaceholder: "Herci oddělení čárkou, např.: Matthew McConaughey, Anne Hathaway...",

      // 4. Informace o hře
      sectionGame: "Informace o hře",
      developerLabel: "Vývojářské studio",
      developerPlaceholder: "Např. CD Projekt RED, FromSoftware",
      publisherLabel: "Vydavatel",
      publisherPlaceholder: "Např. Sony, Bandai Namco, Xbox",
      gameModeLabel: "Herní režim",
      gameModePlaceholder: "Singleplayer, Kooperace, Multiplayer...",
      platformsLabel: "Platformy",
      platformsPlaceholder: "PC, PlayStation 5, Xbox Series X, Switch...",
      engineLabel: "Herní Engine",
      enginePlaceholder: "Unreal Engine 5, Unity, Custom...",

      // 5. Hodnocení & Poznámky
      sectionRatingNotes: "Hodnocení & Poznámky",
      myRatingLabel: "Moje hodnocení (0 - 10)",
      noRatingBtnTitle: "Uložit tuto položku bez hodnocení",
      noRatingBtnText: "Nehodnotit",
      apiRatingLabel: "Veřejné / API hodnocení",
      apiBadgeTitle: "Příprava pro napojení na filmové/herní API",
      apiRatingPlaceholder: "Např. 8.6 nebo 92",
      apiRatingHint: "Např. IMDb / ČSFD / Metacritic skóre",
      notesLabel: "Osobní poznámky",
      notesPlaceholder: "Osobní postřehy, památné momenty, doporučení...",
      trailerLabel: "Odkaz na trailer (YouTube nebo video)",
      trailerBadgeTitle: "Zadejte odkaz na YouTube upoutávku",
      trailerPlaceholder: "Např. https://www.youtube.com/watch?v=... nebo ID videa",
      trailerHint: "V detailu se pak zobrazí tlačítko pro okamžité přehrání",

      // 6. Obrázek / Plakát
      sectionPoster: "Obrázek / Plakát",
      selectImageBtn: "Vybrat obrázek z disku",
      noImageSelected: "Žádný nový soubor nevybrán",
      removeImageBtnTitle: "Odebrat obrázek",
      savedPoster: "Uložený plakát",
      noPoster: "Položka nemá plakát",
      posterFromDatabase: "Plakát načten z online databáze",
      noPosterFound: "Žádný plakát nebyl nalezen",

      // 7. Vlastní metadata
      sectionCustomMeta: "Vlastní metadata",
      customMetaSubtitle: "Přidejte libovolné doplňující parametry (např. Dabing, Herní doba, Soundtrack...)",
      addMetaParamBtn: "Přidat parametr",
      metaKeyPlaceholder: "Název (např. Dabing)",
      metaValPlaceholder: "Hodnota (např. CZ dabing)",
      removeParamBtnTitle: "Odebrat parametr",

      // Patička
      requiredHint: "Povinné pole",
      cancelBtn: "Zrušit",
      saveBtn: "Uložit položku",
      saveChangesBtn: "Uložit změny"
    },
    apiModal: {
      headerTitle: "Přidat pomocí online API",
      headerSubtitle: "Vyhledejte a nechte automaticky předvyplnit všechny údaje i obálku.",
      closeBtnAria: "Zavřít",

      // Přepínač poskytovatelů
      switchTmdb: "Filmy a seriály",
      switchRawg: "Videohry",

      // TMDB Sekce
      tmdbKeyTitle: "API klíč TMDB",
      tmdbKeySubtitle: "Potřebný pro načítání filmové a seriálové databáze",
      tmdbKeyPlaceholder: "Vložte váš TMDB API klíč (v3 auth nebo v4 token)...",
      keyMissing: "Klíč nezadán",
      keySaved: "✓ Klíč uložen",
      saveKeyBtn: "Uložit klíč",
      toggleKeyTitle: "Zobrazit / skrýt klíč",
      tmdbKeyHint: "Klíč zdarma získáte registrací na <strong>themoviedb.org</strong> (Profil &rarr; Nastavení &rarr; API).",

      tmdbSearchTitle: "Vyhledávání",
      tmdbSearchSubtitle: "Vyhledejte film nebo seriál v databázi",
      typeAll: "Vše",
      typeMovies: "Filmy",
      typeSeries: "Seriály",
      tmdbQueryPlaceholder: "Zadejte název filmu nebo seriálu.. (např. Inception, Temný rytíř, Fallout)",
      clearSearchTitle: "Vymazat",
      searchBtn: "Vyhledat",

      tmdbPlaceholderTitle: "Vyhledejte film nebo seriál",
      tmdbPlaceholderSub: "Zadejte váš API klíč a název titulu pro okamžité nalezení a automatické předvyplnění údajů a obálky.",

      // RAWG Sekce
      rawgKeyTitle: "API klíč RAWG.io",
      rawgKeySubtitle: "Potřebný pro načítání herní databáze",
      rawgKeyPlaceholder: "Vložte váš RAWG API klíč (z rawg.io/apidocs)...",
      rawgKeyHint: "Klíč zdarma získáte registrací na <strong>rawg.io/apidocs</strong> (&rarr; Get an API key).",

      rawgSearchTitle: "Vyhledávání",
      rawgSearchSubtitle: "Vyhledejte videohru v databázi",
      rawgQueryPlaceholder: "Zadejte název videohry.. (např. Cyberpunk 2077, Elden Ring, Half-Life)",

      rawgPlaceholderTitle: "Vyhledejte videohru",
      rawgPlaceholderSub: "Zadejte váš API klíč a název hry pro okamžité nalezení a automatické předvyplnění údajů a obálky.",

      // Výsledky a stavy
      selectAndPrefillBtn: "Vybrat a předvyplnit",
      loadingDetails: "Načítám...",
      downloadingPoster: "Stahuji a optimalizuji obálku...",
      allDownloaded: "✓ Vše staženo!",
      searching: "Vyhledávám...",
      noResultsFound: "Nebyly nalezeny žádné výsledky pro váš dotaz.",
      searchFailed: "Vyhledávání selhalo. Zkontrolujte připojení k internetu a váš API klíč.",
      resultsCountMovies: "Nalezeno celkem <strong>{count}</strong> výsledků:",
      resultsCountGames: "Nalezeno celkem <strong>{count}</strong> her:",
      untitled: "Bez názvu",
      noOverview: "Popis není k dispozici.",
      genresLabel: "Žánry",
      noGenres: "Žánry neuvedeny.",
      promptEnterTmdbKey: "Nejprve prosím vložte váš TMDB API klíč.",
      promptEnterMovieQuery: "Zadejte název díla pro vyhledání.",
      promptEnterRawgKey: "Nejprve prosím vložte váš RAWG API klíč.",
      promptEnterGameQuery: "Zadejte název hry pro vyhledání.",
      noResultsFoundTitle: "Nebyly nalezeny žádné výsledky",
      noMoviesFoundSub: "Pro dotaz \"{query}\" nebyly nalezeny žádné tituly. Zkuste jiný výraz nebo přepnout filtr typu.",
      noGamesFoundTitle: "Nebyly nalezeny žádné hry",
      noGamesFoundSub: "Pro dotaz \"{query}\" nebyly nalezeny žádné tituly. Zkuste upřesnit název hry.",
      tmdbErrorTitle: "Chyba při komunikaci s TMDB",
      rawgErrorTitle: "Chyba při komunikaci s RAWG.io",
      origTitleLabel: "Pův.:",
      origTitleFull: "Původní název:",
      metacriticScore: "Metacritic skóre",
      downloadCancelled: "Stahování z online databáze bylo zrušeno.",

      // Patička
      footerHint: "Předvyplněné údaje budete moci před uložením libovolně upravit",
      closeBtn: "Zavřít"
    },
    main: {
      // Záhlaví a navigace
      subtitle: "Evidence filmů, seriálů a her.",
      splashStatus: "Spouštění a načítání sbírky...",
      searchPlaceholder: "Hledat podle názvu, žánru, studia, herců...",
      clearSearchTitle: "Vymazat hledání",
      reloadAppTitle: "Znovu načíst (F5)",
      openSettingsTitle: "Nastavení aplikace",

      // Tlačítko Přidat a dropdown
      addBtn: "Přidat",
      addBtnTitle: "Přidat položku",
      addManualTitle: "Přidat ručně",
      addManualSub: "Vytvořit položku od začátku (film, seriál, hra)",
      addTmdbTitle: "Přidat pomocí API",
      addTmdbPill: "ONLINE",
      addTmdbSub: "Automaticky stáhne obálku i informace",

      // Filtrovací taby
      filterAll: "Vše",
      filterFilms: "Filmy",
      filterSeries: "Seriály",
      filterGames: "Hry",

      // Přepínač zobrazení
      viewSwitcherTitle: "Způsob zobrazení",
      viewGridTitle: "Dlaždice (Plakáty)",
      viewGridLabel: "Dlaždice",
      viewCompactTitle: "Kompaktní mřížka",
      viewCompactLabel: "Mřížka",
      viewListTitle: "Detailní seznam",
      viewListLabel: "Seznam",

      // Karty a odznaky
      typeFilmBadge: "Film",
      typeSeriesBadge: "Seriál",
      typeGameBadge: "Hra",
      viewDetailHint: "Zobrazit detail",

      // Seznam (tabulka)
      colPoster: "Plakát",
      colTitle: "Název a rok",
      colType: "Druh",
      colGenre: "Žánr",
      colCreator: "Tvůrce / Studio",
      colRatings: "Hodnocení",
      colAction: "Akce",
      btnDetail: "Detail",
      directorPrefix: "Režie:",
      developerPrefix: "Studio:",

      // Filtr stavu
      statusFilterLabel: "Stav:",
      statusFilterTitle: "Filtrovat podle stavu",
      statusAll: "Všechny stavy",
      statusBacklog: "Chci vidět / hrát",
      statusProgress: "Právě sleduji / hraji",
      statusCompleted: "Dokončeno",
      statusDropped: "Odloženo / Zrušeno",

      // Řazení
      sortLabel: "Řadit:",
      sortTitle: "Vyberte způsob řazení",
      sortNewest: "Nejnovější přidané",
      sortRatingDesc: "Hodnocení (nejvyšší)",
      sortRatingAsc: "Hodnocení (nejnižší)",
      sortYearDesc: "Rok vydání (nejnovější)",
      sortTitleAsc: "Název (A - Z)",

      // Spodní lišta a prázdný stav
      paginationInfo: "Zobrazeno {start}–{end} z {total} záznamů",
      paginationEmpty: "Zobrazeno 0–0 z 0",
      prevPageTitle: "Předchozí strana",
      nextPageTitle: "Další strana",
      emptyNoRecords: "Žádné záznamy k zobrazení",
      emptyNoSearchMatch: "Hledanému výrazu \"{query}\" neodpovídá žádný záznam.",
      emptyInitialText: "Zatím jste nepřidali žádný film, seriál ani hru. Začněte tvořit svou sbírku kliknutím na tlačítko níže.",
      emptyAddFirstBtn: "Přidat první záznam"
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

      // 5. Application Updates
      sectionUpdates: "Application Updates",
      currentVersionLabel: "Installed version",
      updateCheckDesc: "Check if a newer version of Tracker is available on GitHub.",
      checkUpdateBtn: "Check for Updates",
      checkingUpdates: "Checking...",
      checkAgainBtn: "Check Again",
      upToDateStatus: "You have the latest version of the app ({version}).",
      updateAvailableStatus: "A new version is available: <strong>{version}</strong>!",
      downloadUpdateBtn: "Download New Version",
      viewReleaseNotes: "View Release Notes",
      updateCheckError: "Failed to check for updates. Please check your internet connection.",
      rateLimitBadge: "Rate limit",
      rateLimitError: "GitHub API hourly rate limit (60 req/hr) exceeded. Please try again shortly.",
      newVersionToast: "A new version of Tracker was found ({version})!",
      upToDateToast: "You are using the latest version ({version}).",
      changelogTitle: "What's new in this version:",
      changelogLoading: "Loading changelog...",
      changelogEmpty: "No commit details available.",

      // 6. Support & Bug Reports
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
    },
    form: {
      modalTitleAdd: "Add New Item",
      modalTitleEdit: "Edit Item",
      modalTitleEditWithTitle: "Edit: {title}",
      modalTitleAddWithTitle: "Add: {title}",
      importTmdbBtnTitle: "Prefill from international TMDB database",
      importTmdbBtnText: "Load from TMDB",
      importRawgBtnTitle: "Prefill from RAWG.io game database",
      importRawgBtnText: "Load from RAWG",
      closeBtnAria: "Close",

      // 1. Category & status
      sectionCategoryStatus: "Category & Status",
      itemTypeLabel: "Item Type",
      typeFilm: "Movie",
      typeSeries: "Series",
      typeGame: "Game",
      statusLabel: "Watch / Play Status",
      statusBacklogMovie: "Plan to Watch",
      statusBacklogGame: "Plan to Play",
      statusProgressMovie: "Watching",
      statusProgressGame: "Playing",
      statusCompletedMovie: "Watched",
      statusCompletedGame: "Completed",
      statusDropped: "Dropped",

      // 2. Basic information
      sectionBasicInfo: "Basic Information",
      titleLabel: "Title",
      requiredTitle: "Required field",
      titlePlaceholder: "e.g. Interstellar, The Last of Us, Cyberpunk...",
      yearLabel: "Release Year",
      yearPlaceholder: "2024",
      genreLabel: "Genre",
      genrePlaceholder: "Sci-Fi, RPG, Drama...",
      tagsLabel: "Keywords (Tags)",
      tagsPlaceholder: "Separate with comma, e.g.: space, cyberpunk, co-op, open world",
      descLabel: "Description",
      descPlaceholder: "Brief synopsis, story summary or game concept...",

      // 3. Movie / Series details
      sectionFilmSeries: "Movie / Series Details",
      directorLabel: "Director",
      directorPlaceholder: "e.g. Christopher Nolan",
      writerLabel: "Screenplay / Writer",
      writerPlaceholder: "e.g. Jonathan Nolan",
      productionLabel: "Production / Studio",
      productionPlaceholder: "e.g. Warner Bros., HBO, Netflix",
      durationLabel: "Duration",
      durationPlaceholder: "e.g. 169 min or 50 min/ep",
      seasonEpisodesLabel: "Structure - Season or Episode Number",
      seasonEpisodesPlaceholder: "e.g. Season 2 (8 episodes) or S02E05",
      castLabel: "Cast",
      castPlaceholder: "Actors separated by comma, e.g.: Matthew McConaughey, Anne Hathaway...",

      // 4. Game details
      sectionGame: "Game Details",
      developerLabel: "Developer Studio",
      developerPlaceholder: "e.g. CD Projekt RED, FromSoftware",
      publisherLabel: "Publisher",
      publisherPlaceholder: "e.g. Sony, Bandai Namco, Xbox",
      gameModeLabel: "Game Mode",
      gameModePlaceholder: "Single-player, Co-op, Multiplayer...",
      platformsLabel: "Platforms",
      platformsPlaceholder: "PC, PlayStation 5, Xbox Series X, Switch...",
      engineLabel: "Game Engine",
      enginePlaceholder: "Unreal Engine 5, Unity, Custom...",

      // 5. Rating & Notes
      sectionRatingNotes: "Rating & Notes",
      myRatingLabel: "My Rating (0 - 10)",
      noRatingBtnTitle: "Save this item without rating",
      noRatingBtnText: "Unrated",
      apiRatingLabel: "Public / API Rating",
      apiBadgeTitle: "Preparation for movie/game API integration",
      apiRatingPlaceholder: "e.g. 8.6 or 92",
      apiRatingHint: "e.g. IMDb / Metacritic / TMDb score",
      notesLabel: "Personal Notes",
      notesPlaceholder: "Personal impressions, memorable moments, recommendations...",
      trailerLabel: "Trailer Link (YouTube or video)",
      trailerBadgeTitle: "Enter YouTube trailer link",
      trailerPlaceholder: "e.g. https://www.youtube.com/watch?v=... or video ID",
      trailerHint: "A direct play button will appear in the item details",

      // 6. Image / Cover Art
      sectionPoster: "Image / Cover Art",
      selectImageBtn: "Choose Image from Disk",
      noImageSelected: "No new file selected",
      removeImageBtnTitle: "Remove image",
      savedPoster: "Saved cover",
      noPoster: "Item has no cover",
      posterFromDatabase: "Cover loaded from online database",
      noPosterFound: "No cover was found",

      // 7. Custom metadata
      sectionCustomMeta: "Custom Metadata",
      customMetaSubtitle: "Add any additional parameters (e.g. Dubbing, Playtime, Soundtrack...)",
      addMetaParamBtn: "Add Parameter",
      metaKeyPlaceholder: "Key (e.g. Dubbing)",
      metaValPlaceholder: "Value (e.g. English)",
      removeParamBtnTitle: "Remove parameter",

      // Footer
      requiredHint: "Required field",
      cancelBtn: "Cancel",
      saveBtn: "Save Item",
      saveChangesBtn: "Save Changes"
    },
    apiModal: {
      headerTitle: "Add via Online API",
      headerSubtitle: "Search and automatically prefill all details and cover art.",
      closeBtnAria: "Close",

      // Provider switch
      switchTmdb: "Movies & Series",
      switchRawg: "Video Games",

      // TMDB Section
      tmdbKeyTitle: "TMDB API Key",
      tmdbKeySubtitle: "Required for fetching movie and TV show database",
      tmdbKeyPlaceholder: "Paste your TMDB API key (v3 auth or v4 token)...",
      keyMissing: "No Key Entered",
      keySaved: "✓ Key Saved",
      saveKeyBtn: "Save Key",
      toggleKeyTitle: "Show / hide key",
      tmdbKeyHint: "Get a free key by registering at <strong>themoviedb.org</strong> (Profile &rarr; Settings &rarr; API).",

      tmdbSearchTitle: "Search",
      tmdbSearchSubtitle: "Search for a movie or TV series in the database",
      typeAll: "All",
      typeMovies: "Movies",
      typeSeries: "Series",
      tmdbQueryPlaceholder: "Enter movie or series title.. (e.g. Inception, The Dark Knight, Fallout)",
      clearSearchTitle: "Clear",
      searchBtn: "Search",

      tmdbPlaceholderTitle: "Search for a movie or series",
      tmdbPlaceholderSub: "Enter your API key and title name to instantly find and auto-fill details and poster.",

      // RAWG Section
      rawgKeyTitle: "RAWG.io API Key",
      rawgKeySubtitle: "Required for fetching video game database",
      rawgKeyPlaceholder: "Paste your RAWG API key (from rawg.io/apidocs)...",
      rawgKeyHint: "Get a free key by registering at <strong>rawg.io/apidocs</strong> (&rarr; Get an API key).",

      rawgSearchTitle: "Search",
      rawgSearchSubtitle: "Search for a video game in the database",
      rawgQueryPlaceholder: "Enter video game title.. (e.g. Cyberpunk 2077, Elden Ring, Half-Life)",

      rawgPlaceholderTitle: "Search for a video game",
      rawgPlaceholderSub: "Enter your API key and game title to instantly find and auto-fill details and cover.",

      // Results & statuses
      selectAndPrefillBtn: "Select & Prefill",
      loadingDetails: "Loading...",
      downloadingPoster: "Downloading & optimizing cover...",
      allDownloaded: "✓ All Downloaded!",
      searching: "Searching...",
      noResultsFound: "No results found for your query.",
      searchFailed: "Search failed. Check your internet connection and API key.",
      resultsCountMovies: "Found <strong>{count}</strong> results:",
      resultsCountGames: "Found <strong>{count}</strong> games:",
      untitled: "Untitled",
      noOverview: "No description available.",
      genresLabel: "Genres",
      noGenres: "No genres specified.",
      promptEnterTmdbKey: "Please enter your TMDB API key first.",
      promptEnterMovieQuery: "Enter a title to search.",
      promptEnterRawgKey: "Please enter your RAWG API key first.",
      promptEnterGameQuery: "Enter a game title to search.",
      noResultsFoundTitle: "No results found",
      noMoviesFoundSub: "No titles were found for \"{query}\". Try another search term or switch type filter.",
      noGamesFoundTitle: "No games found",
      noGamesFoundSub: "No titles were found for \"{query}\". Try refining the game title.",
      tmdbErrorTitle: "Error communicating with TMDB",
      rawgErrorTitle: "Error communicating with RAWG.io",
      origTitleLabel: "Orig.:",
      origTitleFull: "Original title:",
      metacriticScore: "Metacritic score",
      downloadCancelled: "Download from online database was cancelled.",

      // Footer
      footerHint: "You can freely edit the prefilled details before saving",
      closeBtn: "Close"
    },
    main: {
      // Header and navigation
      subtitle: "Track movies, series and games.",
      splashStatus: "Starting and loading collection...",
      searchPlaceholder: "Search by title, genre, studio, cast...",
      clearSearchTitle: "Clear search",
      reloadAppTitle: "Reload (F5)",
      openSettingsTitle: "Application settings",

      // Add button and dropdown
      addBtn: "Add",
      addBtnTitle: "Add item",
      addManualTitle: "Add Manually",
      addManualSub: "Create an item from scratch (movie, series, game)",
      addTmdbTitle: "Add via API",
      addTmdbPill: "ONLINE",
      addTmdbSub: "Automatically downloads cover art and details",

      // Filter tabs
      filterAll: "All",
      filterFilms: "Movies",
      filterSeries: "Series",
      filterGames: "Games",

      // View switcher
      viewSwitcherTitle: "View mode",
      viewGridTitle: "Tiles (Posters)",
      viewGridLabel: "Tiles",
      viewCompactTitle: "Compact grid",
      viewCompactLabel: "Grid",
      viewListTitle: "Detailed list",
      viewListLabel: "List",

      // Cards and badges
      typeFilmBadge: "Movie",
      typeSeriesBadge: "Series",
      typeGameBadge: "Game",
      viewDetailHint: "View detail",

      // List (table)
      colPoster: "Poster",
      colTitle: "Title & year",
      colType: "Type",
      colGenre: "Genre",
      colCreator: "Creator / Studio",
      colRatings: "Rating",
      colAction: "Action",
      btnDetail: "Detail",
      directorPrefix: "Director:",
      developerPrefix: "Studio:",

      // Status filter
      statusFilterLabel: "Status:",
      statusFilterTitle: "Filter by status",
      statusAll: "All statuses",
      statusBacklog: "Plan to watch / play",
      statusProgress: "Watching / playing",
      statusCompleted: "Completed",
      statusDropped: "Dropped / Cancelled",

      // Sorting
      sortLabel: "Sort:",
      sortTitle: "Select sort order",
      sortNewest: "Recently added",
      sortRatingDesc: "Rating (highest)",
      sortRatingAsc: "Rating (lowest)",
      sortYearDesc: "Release year (newest)",
      sortTitleAsc: "Title (A - Z)",

      // Bottom bar and empty state
      paginationInfo: "Showing {start}–{end} of {total} items",
      paginationEmpty: "Showing 0–0 of 0",
      prevPageTitle: "Previous page",
      nextPageTitle: "Next page",
      emptyNoRecords: "No records to display",
      emptyNoSearchMatch: "No records match search query \"{query}\".",
      emptyInitialText: "You haven't added any movies, series or games yet. Start building your collection by clicking the button below.",
      emptyAddFirstBtn: "Add first record"
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
function applyTranslations(root = (typeof document !== "undefined" ? document : null)) {
  if (!root) return;
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
