// ==========================================================================
// Tracker - Frontend logika (Vanilla JS s Tauri v2 IPC a SVG ikonami)
// ==========================================================================

// Zabezpečení proti jakémukoliv prohlížečovému oknu ("Web říká")
window.alert = (msg) => {
  showToast(String(msg));
};
window.confirm = () => {
  console.warn("Použijte showConfirmDialog() namísto window.confirm().");
  return false;
};

// ==========================================================================
// Vypnutí prvků chování webové stránky (Nativní desktopový režim)
// ==========================================================================

// 1. Zákaz kontextového menu prohlížeče (Zpět, Vpřed, Znovu načíst, Prozkoumat prvek)
window.addEventListener("contextmenu", (e) => {
  // Povolit pravé tlačítko pouze pro psaní/kopírování v textových vstupech
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) {
    return;
  }
  e.preventDefault();
}, false);

// 2. Zákaz kláves pro obnovení (F5, Ctrl+R), DevTools (F12, Ctrl+Shift+I) a webové zkratky
window.addEventListener("keydown", (e) => {
  const isCtrl = e.ctrlKey || e.metaKey;
  const key = e.key;

  // Obnovení stránky: F5, Ctrl+R, Ctrl+Shift+R
  if (key === "F5" || (isCtrl && (key === "r" || key === "R"))) {
    e.preventDefault();
    return false;
  }

  // Vývojářské nástroje (DevTools): F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  if (key === "F12" || (isCtrl && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(key))) {
    e.preventDefault();
    return false;
  }

  // Zobrazení zdrojového kódu, tisk, uložení HTML stránky: Ctrl+U, Ctrl+P, Ctrl+S
  if (isCtrl && ["u", "U", "p", "P", "s", "S"].includes(key)) {
    e.preventDefault();
    return false;
  }

  // Klávesový zoom: Ctrl + Plus, Ctrl + Mínus, Ctrl + 0
  if (isCtrl && ["+", "-", "=", "0"].includes(key)) {
    e.preventDefault();
    return false;
  }
}, false);

// 3. Zákaz zoomování kolečkem myši při stisknutém Ctrl (narušuje desktopové měřítko)
window.addEventListener("wheel", (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
  }
}, { passive: false });

// 4. Zákaz nechtěného přetažení souborů mimo zónu pro nahrávání (zabraňuje otevření v okně)
window.addEventListener("dragover", (e) => e.preventDefault(), false);
window.addEventListener("drop", (e) => e.preventDefault(), false);

// Pomocná funkce pro bezpečné volání Tauri IPC příkazů
async function tauriInvoke(cmd, args = {}) {
  const invoke = window.__TAURI__?.core?.invoke || window.__TAURI__?.invoke;

  if (typeof invoke === "function") {
    return await invoke(cmd, args);
  }

  console.warn(`[Tauri Mock] Příkaz '${cmd}' - Tauri IPC není dostupné.`);
  throw new Error("Tauri IPC není dostupné. Spusťte aplikaci v prostředí Tauri.");
}

// Pomocná funkce pro bezpečný převod cesty k souboru na nativní Tauri Asset URL
function getCoverUrl(src) {
  if (!src) return "";
  // Pokud je to již webová URL nebo data URL
  if (src.startsWith("data:") || src.startsWith("http:") || src.startsWith("https:") || src.startsWith("asset:")) {
    return src;
  }
  // Nativní Tauri Asset Protocol (bleskové streamování přímo z disku bez Base64)
  const convert = window.__TAURI__?.core?.convertFileSrc || window.__TAURI__?.convertFileSrc;
  if (typeof convert === "function") {
    try {
      return convert(src);
    } catch (err) {
      console.warn("Chyba při konverzi asset cesty:", err);
    }
  }
  return src;
}

// ==========================================================================
// Knihovna SVG Ikon (Sjednocený moderní outline styl: 24x24, stroke-width 2)
// ==========================================================================
const SVG_ICONS = {
  film: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4.5" width="20" height="15" rx="2.5"></rect><path d="M2 9.5h20"></path><path d="m6 4.5 2.5 5"></path><path d="m11 4.5 2.5 5"></path><path d="m16 4.5 2.5 5"></path></svg>`,
  series: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4.5" width="20" height="13" rx="2.5"></rect><line x1="12" y1="17.5" x2="12" y2="20"></line><line x1="8" y1="20" x2="16" y2="20"></line></svg>`,
  game: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path><line x1="6" y1="11" x2="10" y2="11"></line><line x1="8" y1="9" x2="8" y2="13"></line><circle cx="15" cy="12" r="0.75" fill="currentColor"></circle><circle cx="18" cy="10" r="0.75" fill="currentColor"></circle></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  api: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
};

// Ošetření chyby načtení obrázku obálky (nahrazení placeholderem)
function handlePosterError(img) {
  if (!img || !img.parentElement) return;
  img.onerror = null;
  img.parentElement.innerHTML = `
    <div class="poster-placeholder">
      <div class="placeholder-eye-off">${SVG_ICONS.eyeOff}</div>
    </div>
  `;
}

// Obsluha načtení plakátu – spuštění plynulého fade-in rozsvícení
function handlePosterLoad(img) {
  if (!img) return;
  img.classList.add("loaded");
}

// Sdílený IntersectionObserver pro spolehlivý lazy-loading při nekonečném rolování
let gridImageObserver = null;

function setupGridImageObserver() {
  if (gridImageObserver) {
    gridImageObserver.disconnect();
  }

  if ("IntersectionObserver" in window) {
    gridImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: "450px 0px",
      threshold: 0.01
    });
  }
}

// Globální stav
let allItems = [];
let activeFilter = "all";
let searchQuery = "";
let currentSort = "newest";
let currentStatusFilter = "all"; // 'all', 'backlog', 'in_progress', 'completed', 'dropped'
let currentTrailerUrl = "";

// Nastavení rozvržení a stránkování (načteno z localStorage)
let currentView = localStorage.getItem("tracker_view_mode") || "grid"; // 'grid', 'compact', 'list'
let itemsPerPage = localStorage.getItem("tracker_items_per_page") || "24"; // '12', '24', '48', 'all'
let currentPage = 1;

let editingItemId = null;
let currentItemDetail = null;
let detailModalItemBeforeEdit = null;

// Správa obrázků
let selectedImagePath = null;
let removeImageFlag = false;
let existingImageData = null;

// DOM Reference
const mediaGrid = document.getElementById("mediaGrid");
const listHeader = document.getElementById("listHeader");
const emptyState = document.getElementById("emptyState");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const sortSelect = document.getElementById("sortSelect");
const filterButtons = document.querySelectorAll(".filter-btn");
const viewButtons = document.querySelectorAll(".view-btn");

// Stránkování
const paginationBar = document.getElementById("paginationBar");
const paginationInfo = document.getElementById("paginationInfo");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageNumbers = document.getElementById("pageNumbers");

// Počítadla
const countAll = document.getElementById("countAll");
const countFilms = document.getElementById("countFilms");
const countSeries = document.getElementById("countSeries");
const countGames = document.getElementById("countGames");

// Formulář Modál
const formModal = document.getElementById("formModal");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const openAddMenuBtn = document.getElementById("openAddMenuBtn");
const addBtnDropdownWrapper = document.querySelector(".add-btn-dropdown-wrapper");
const addDropdownMenu = document.getElementById("addDropdownMenu");
const addManualBtn = document.getElementById("addManualBtn");
const addTmdbBtn = document.getElementById("addTmdbBtn");
const formImportTmdbBtn = document.getElementById("formImportTmdbBtn");
const closeFormModalBtn = document.getElementById("closeFormModalBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const mediaForm = document.getElementById("mediaForm");
const modalTitle = document.getElementById("modalTitle");

// Dynamické sekce formuláře
const sectionFilmSeries = document.getElementById("sectionFilmSeries");
const sectionGames = document.getElementById("sectionGames");
const fieldSeasonEpisodes = document.getElementById("fieldSeasonEpisodes");
const itemTypeRadios = document.querySelectorAll('input[name="itemType"]');

// Formulářová pole
const itemTitle = document.getElementById("itemTitle");
const itemReleaseYear = document.getElementById("itemReleaseYear");
const itemGenre = document.getElementById("itemGenre");
const itemTags = document.getElementById("itemTags");
const itemDescription = document.getElementById("itemDescription");
const itemRating = document.getElementById("itemRating");
const itemRatingInput = document.getElementById("itemRatingInput");
const toggleNoRatingBtn = document.getElementById("toggleNoRatingBtn");
const ratingControlGroup = document.getElementById("ratingControlGroup");
const itemApiRating = document.getElementById("itemApiRating");
const itemNote = document.getElementById("itemNote");
const itemTrailerUrl = document.getElementById("itemTrailerUrl");

let isNoRatingActive = false;

function setNoRatingState(active) {
  isNoRatingActive = active;
  if (toggleNoRatingBtn) {
    toggleNoRatingBtn.classList.toggle("active", active);
  }
  if (ratingControlGroup) {
    ratingControlGroup.classList.toggle("rating-disabled", active);
  }
  if (itemRating) {
    itemRating.disabled = active;
  }
  if (itemRatingInput) {
    itemRatingInput.disabled = active;
    if (active) {
      if (itemRatingInput.value !== "—") {
        itemRatingInput.dataset.savedVal = itemRatingInput.value;
      }
      itemRatingInput.value = "—";
    } else {
      const restored = itemRatingInput.dataset.savedVal || itemRating.value || "8";
      itemRatingInput.value = restored;
      const num = parseFloat(restored);
      if (!isNaN(num)) itemRating.value = num;
      updateRatingInputWidth();
    }
  }
}

// Pomocná funkce pro automatické škálování šířky číselného vstupu hodnocení
function updateRatingInputWidth() {
  if (!itemRatingInput) return;
  const str = String(itemRatingInput.value || "8");
  // Dynamická šířka podle počtu znaků (např. 6.25, 10.00), aby žádné číslo nebylo oříznuté
  const charCount = Math.max(3, str.length);
  itemRatingInput.style.width = `${Math.max(54, charCount * 11)}px`;
}

// Filmy/Seriály pole
const itemDirector = document.getElementById("itemDirector");
const itemWriter = document.getElementById("itemWriter");
const itemProduction = document.getElementById("itemProduction");
const itemDuration = document.getElementById("itemDuration");
const itemSeasonEpisodes = document.getElementById("itemSeasonEpisodes");
const itemCast = document.getElementById("itemCast");

// Hry pole
const itemDeveloper = document.getElementById("itemDeveloper");
const itemPublisher = document.getElementById("itemPublisher");
const itemGameMode = document.getElementById("itemGameMode");
const itemPlatforms = document.getElementById("itemPlatforms");
const itemEngine = document.getElementById("itemEngine");

// Plakát
const selectImageBtn = document.getElementById("selectImageBtn");
const selectedImagePathText = document.getElementById("selectedImagePathText");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imagePreviewImg = document.getElementById("imagePreviewImg");
const removeImageBtn = document.getElementById("removeImageBtn");

// Vlastní metadata
const customMetadataContainer = document.getElementById("customMetadataContainer");
const addMetaFieldBtn = document.getElementById("addMetaFieldBtn");

// Detail Modál
const detailModal = document.getElementById("detailModal");
const closeDetailModalBtn = document.getElementById("closeDetailModalBtn");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const detailEditBtn = document.getElementById("detailEditBtn");
const detailDeleteBtn = document.getElementById("detailDeleteBtn");

const detailTypeBadge = document.getElementById("detailTypeBadge");
const detailYearBadge = document.getElementById("detailYearBadge");
const detailPosterWrap = document.getElementById("detailPosterWrap");
const detailUserRating = document.getElementById("detailUserRating");
const detailApiRating = document.getElementById("detailApiRating");
const detailApiRatingBox = document.getElementById("detailApiRatingBox");
const detailTitle = document.getElementById("detailTitle");
const detailGenre = document.getElementById("detailGenre");
const detailTags = document.getElementById("detailTags");
const detailDescriptionWrap = document.getElementById("detailDescriptionWrap");
const detailDescription = document.getElementById("detailDescription");
const detailMetaWrap = document.getElementById("detailMetaWrap");
const detailMetaGrid = document.getElementById("detailMetaGrid");
const detailNoteWrap = document.getElementById("detailNoteWrap");
const detailNote = document.getElementById("detailNote");
const detailCustomMetaWrap = document.getElementById("detailCustomMetaWrap");
const detailCustomMetaGrid = document.getElementById("detailCustomMetaGrid");
const detailTrailerBtn = document.getElementById("detailTrailerBtn");
const detailStatusBox = document.getElementById("detailStatusBox");
const detailStatusPills = document.getElementById("detailStatusPills");
const detailLinksWrap = document.getElementById("detailLinksWrap");
const detailLinksList = document.getElementById("detailLinksList");

// Stavový filtr v horní liště
const statusDropdownWrapper = document.getElementById("statusDropdownWrapper");
const statusDropdownBtn = document.getElementById("statusDropdownBtn");
const statusCurrentLabel = document.getElementById("statusCurrentLabel");
const statusDropdownMenu = document.getElementById("statusDropdownMenu");

// Nastavení Modál
const settingsModal = document.getElementById("settingsModal");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsModalBtn = document.getElementById("closeSettingsModalBtn");
const cancelSettingsBtn = document.getElementById("cancelSettingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const settingsDefaultView = document.getElementById("settingsDefaultView");
const settingsItemsPerPage = document.getElementById("settingsItemsPerPage");
const settingsItemCount = document.getElementById("settingsItemCount");
const openDataFolderBtn = document.getElementById("openDataFolderBtn");
const clearTempBtn = document.getElementById("clearTempBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const reportBugBtn = document.getElementById("reportBugBtn");
const settingsTmdbApiKey = document.getElementById("settingsTmdbApiKey");
const settingsRawgApiKey = document.getElementById("settingsRawgApiKey");

// API Modál prvky (TMDB & RAWG)
const tmdbModal = document.getElementById("tmdbModal");
const closeTmdbModalBtn = document.getElementById("closeTmdbModalBtn");
const cancelTmdbModalBtn = document.getElementById("cancelTmdbModalBtn");
const apiSwitchTmdb = document.getElementById("apiSwitchTmdb");
const apiSwitchRawg = document.getElementById("apiSwitchRawg");
const tmdbSectionWrapper = document.getElementById("tmdbSectionWrapper");
const rawgSectionWrapper = document.getElementById("rawgSectionWrapper");

// TMDB prvky
const tmdbApiKeyInput = document.getElementById("tmdbApiKeyInput");
const toggleTmdbKeyVisibilityBtn = document.getElementById("toggleTmdbKeyVisibilityBtn");
const tmdbEyeIcon = document.getElementById("tmdbEyeIcon");
const saveTmdbKeyBtn = document.getElementById("saveTmdbKeyBtn");
const tmdbKeyBadge = document.getElementById("tmdbKeyBadge");
const tmdbQueryInput = document.getElementById("tmdbQueryInput");
const clearTmdbQueryBtn = document.getElementById("clearTmdbQueryBtn");
const executeTmdbSearchBtn = document.getElementById("executeTmdbSearchBtn");
const tmdbResultsArea = document.getElementById("tmdbResultsArea");

// RAWG prvky
const rawgApiKeyInput = document.getElementById("rawgApiKeyInput");
const toggleRawgKeyVisibilityBtn = document.getElementById("toggleRawgKeyVisibilityBtn");
const rawgEyeIcon = document.getElementById("rawgEyeIcon");
const saveRawgKeyBtn = document.getElementById("saveRawgKeyBtn");
const rawgKeyBadge = document.getElementById("rawgKeyBadge");
const rawgQueryInput = document.getElementById("rawgQueryInput");
const clearRawgQueryBtn = document.getElementById("clearRawgQueryBtn");
const executeRawgSearchBtn = document.getElementById("executeRawgSearchBtn");
const rawgResultsArea = document.getElementById("rawgResultsArea");

// Trailer Modál prvky
const trailerModal = document.getElementById("trailerModal");
const trailerPlayerWrap = document.getElementById("trailerPlayerWrap");
const trailerExternalBtn = document.getElementById("trailerExternalBtn");
const closeTrailerModalBtn = document.getElementById("closeTrailerModalBtn");

// Potvrzovací dialog prvky
const confirmModal = document.getElementById("confirmModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

const toast = document.getElementById("toast");

// ==========================================================================
// Inicializace
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.removeAttribute("data-accent");
  localStorage.removeItem("tracker_accent_color");
  setupViewMode(currentView);
  setupEventListeners();
  updateTmdbKeyBadge();
  updateRawgKeyBadge();
  loadItems();

  // Okno zobrazíme až po dokončení vykreslení DOMu a načítací obrazovky.
  // Díky tomu uživatel nikdy neuvidí počáteční šedé probliknutí inicializace WebView2.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      tauriInvoke("show_main_window").catch(() => {});
    });
  });
});

function setupEventListeners() {
  // Rozbalovací nabídka "+ Přidat"
  if (openAddMenuBtn && addDropdownMenu) {
    openAddMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSortDropdown();
      closeStatusDropdown();
      const isHidden = addDropdownMenu.classList.contains("hidden");
      if (isHidden) {
        addDropdownMenu.classList.remove("hidden");
        addBtnDropdownWrapper?.classList.add("open");
      } else {
        closeAddDropdown();
      }
    });

    document.addEventListener("click", (e) => {
      if (addBtnDropdownWrapper && !addBtnDropdownWrapper.contains(e.target)) {
        closeAddDropdown();
      }
    });
  }

  function closeAddDropdown() {
    if (addDropdownMenu) {
      addDropdownMenu.classList.add("hidden");
      addBtnDropdownWrapper?.classList.remove("open");
    }
  }

  function closeSortDropdown() {
    const sortDropdownMenu = document.getElementById("sortDropdownMenu");
    const sortDropdownWrapper = document.getElementById("sortDropdownWrapper");
    const sortDropdownBtn = document.getElementById("sortDropdownBtn");
    if (sortDropdownMenu) {
      sortDropdownMenu.classList.add("hidden");
      sortDropdownWrapper?.classList.remove("open");
      sortDropdownBtn?.setAttribute("aria-expanded", "false");
    }
  }

  function closeStatusDropdown() {
    if (statusDropdownMenu) {
      statusDropdownMenu.classList.add("hidden");
      statusDropdownWrapper?.classList.remove("open");
      statusDropdownBtn?.setAttribute("aria-expanded", "false");
    }
  }

  // Filtr podle stavu položky (Watchlist / Backlog)
  if (statusDropdownBtn && statusDropdownMenu) {
    statusDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAddDropdown();
      const isHidden = statusDropdownMenu.classList.contains("hidden");
      if (isHidden) {
        statusDropdownMenu.classList.remove("hidden");
        statusDropdownWrapper?.classList.add("open");
        statusDropdownBtn.setAttribute("aria-expanded", "true");
      } else {
        closeStatusDropdown();
      }
    });

    document.addEventListener("click", (e) => {
      if (statusDropdownWrapper && !statusDropdownWrapper.contains(e.target)) {
        closeStatusDropdown();
      }
    });

    const statusOptions = statusDropdownMenu.querySelectorAll(".status-option");
    statusOptions.forEach((opt) => {
      opt.addEventListener("click", () => {
        const val = opt.dataset.statusVal;
        currentStatusFilter = val;

        statusOptions.forEach((o) => o.classList.toggle("active", o.dataset.statusVal === val));
        if (statusCurrentLabel) {
          const spans = opt.querySelectorAll("span");
          const textSpan = spans[spans.length - 1];
          if (textSpan) statusCurrentLabel.textContent = textSpan.textContent;
        }

        closeStatusDropdown();
        currentPage = 1;
        renderGrid();
      });
    });
  }

  // Akce rozbalovací nabídky "+ Přidat"
  if (addManualBtn) {
    addManualBtn.addEventListener("click", () => {
      closeAddDropdown();
      openFormModal(null);
    });
  }

  if (addTmdbBtn) {
    addTmdbBtn.addEventListener("click", () => {
      closeAddDropdown();
      openTmdbModal();
    });
  }

  if (formImportTmdbBtn) {
    formImportTmdbBtn.addEventListener("click", () => {
      openTmdbModal();
    });
  }

  // Zpětná kompatibilita pro původní tlačítko přidání
  if (openAddModalBtn) {
    openAddModalBtn.addEventListener("click", () => openFormModal(null));
  }
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener("click", () => openFormModal(null));
  }

  // Otevření a zavření formuláře
  closeFormModalBtn.addEventListener("click", () => closeFormModal(false));
  cancelFormBtn.addEventListener("click", () => closeFormModal(false));

  // Přepínač API poskytovatelů (TMDB vs. RAWG)
  if (apiSwitchTmdb && apiSwitchRawg) {
    apiSwitchTmdb.addEventListener("click", () => {
      apiSwitchTmdb.classList.add("active");
      apiSwitchRawg.classList.remove("active");
      tmdbSectionWrapper?.classList.remove("hidden");
      rawgSectionWrapper?.classList.add("hidden");
      const titleEl = document.getElementById("apiModalHeaderTitle");
      if (titleEl) titleEl.textContent = "Přidat pomocí online API (TMDB)";
    });

    apiSwitchRawg.addEventListener("click", () => {
      apiSwitchRawg.classList.add("active");
      apiSwitchTmdb.classList.remove("active");
      rawgSectionWrapper?.classList.remove("hidden");
      tmdbSectionWrapper?.classList.add("hidden");
      const titleEl = document.getElementById("apiModalHeaderTitle");
      if (titleEl) titleEl.textContent = "Přidat pomocí online API (RAWG.io)";
      updateRawgKeyBadge();
    });
  }

  // TMDB Modál zavření a ovládání
  if (closeTmdbModalBtn) closeTmdbModalBtn.addEventListener("click", closeTmdbModal);
  if (cancelTmdbModalBtn) cancelTmdbModalBtn.addEventListener("click", closeTmdbModal);

  if (saveTmdbKeyBtn) {
    saveTmdbKeyBtn.addEventListener("click", () => {
      let key = tmdbApiKeyInput ? tmdbApiKeyInput.value.trim() : "";
      key = key.replace(/^["']|["']$/g, "").trim();
      if (key.toLowerCase().startsWith("bearer ")) {
        key = key.substring(7).trim();
      }
      if (tmdbApiKeyInput) tmdbApiKeyInput.value = key;
      localStorage.setItem("tracker_tmdb_api_key", key);
      if (settingsTmdbApiKey) settingsTmdbApiKey.value = key;
      updateTmdbKeyBadge();
      showToast(key ? "TMDB API klíč byl úspěšně uložen." : "TMDB API klíč byl vymazán.");
    });
  }

  if (toggleTmdbKeyVisibilityBtn && tmdbApiKeyInput) {
    toggleTmdbKeyVisibilityBtn.addEventListener("click", () => {
      const isPass = tmdbApiKeyInput.type === "password";
      tmdbApiKeyInput.type = isPass ? "text" : "password";
      if (tmdbEyeIcon) {
        tmdbEyeIcon.innerHTML = isPass ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
      }
    });
  }

  if (executeTmdbSearchBtn) {
    executeTmdbSearchBtn.addEventListener("click", executeTmdbSearch);
  }

  if (tmdbQueryInput) {
    tmdbQueryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeTmdbSearch();
      }
    });

    tmdbQueryInput.addEventListener("input", (e) => {
      if (clearTmdbQueryBtn) {
        clearTmdbQueryBtn.classList.toggle("hidden", e.target.value.trim() === "");
      }
    });
  }

  if (clearTmdbQueryBtn && tmdbQueryInput) {
    clearTmdbQueryBtn.addEventListener("click", () => {
      tmdbQueryInput.value = "";
      clearTmdbQueryBtn.classList.add("hidden");
      tmdbQueryInput.focus();
    });
  }

  // RAWG.io Herní API ovládání
  if (saveRawgKeyBtn) {
    saveRawgKeyBtn.addEventListener("click", () => {
      let key = rawgApiKeyInput ? rawgApiKeyInput.value.trim() : "";
      key = key.replace(/^["']|["']$/g, "").trim();
      if (rawgApiKeyInput) rawgApiKeyInput.value = key;
      localStorage.setItem("tracker_rawg_api_key", key);
      if (settingsRawgApiKey) settingsRawgApiKey.value = key;
      updateRawgKeyBadge();
      showToast(key ? "RAWG API klíč byl úspěšně uložen." : "RAWG API klíč byl vymazán.");
    });
  }

  if (toggleRawgKeyVisibilityBtn && rawgApiKeyInput) {
    toggleRawgKeyVisibilityBtn.addEventListener("click", () => {
      const isPass = rawgApiKeyInput.type === "password";
      rawgApiKeyInput.type = isPass ? "text" : "password";
      if (rawgEyeIcon) {
        rawgEyeIcon.innerHTML = isPass ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
      }
    });
  }

  if (executeRawgSearchBtn) {
    executeRawgSearchBtn.addEventListener("click", executeRawgSearch);
  }

  if (rawgQueryInput) {
    rawgQueryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeRawgSearch();
      }
    });

    rawgQueryInput.addEventListener("input", (e) => {
      if (clearRawgQueryBtn) {
        clearRawgQueryBtn.classList.toggle("hidden", e.target.value.trim() === "");
      }
    });
  }

  if (clearRawgQueryBtn && rawgQueryInput) {
    clearRawgQueryBtn.addEventListener("click", () => {
      rawgQueryInput.value = "";
      clearRawgQueryBtn.classList.add("hidden");
      rawgQueryInput.focus();
    });
  }

  // Trailer Modál zavření a otevření v prohlížeči
  if (closeTrailerModalBtn) {
    closeTrailerModalBtn.addEventListener("click", closeTrailerModal);
  }
  if (trailerExternalBtn) {
    trailerExternalBtn.addEventListener("click", () => {
      if (currentTrailerUrl) {
        openExternalUrl(currentTrailerUrl);
      }
    });
  }

  // Detail modál zavření
  closeDetailModalBtn.addEventListener("click", closeDetailModal);
  detailCloseBtn.addEventListener("click", closeDetailModal);

  // Uložení reference před zavřením modálu
  detailEditBtn.addEventListener("click", () => {
    if (currentItemDetail) {
      detailModalItemBeforeEdit = currentItemDetail;
      const itemToEdit = currentItemDetail;
      detailModal.classList.add("hidden");
      currentItemDetail = null;
      openFormModal(itemToEdit);
    }
  });

  detailDeleteBtn.addEventListener("click", () => {
    if (currentItemDetail) {
      detailModalItemBeforeEdit = null;
      const itemToDelete = currentItemDetail;
      handleDeleteItem(itemToDelete.id, itemToDelete.title, true);
    }
  });

  // Znovu načíst aplikaci (F5)
  const reloadAppBtn = document.getElementById("reloadAppBtn");
  if (reloadAppBtn) {
    reloadAppBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }

  // Zákaz přetahování a nechtěného kopírování obrázků myší
  document.addEventListener("dragstart", (e) => {
    if (e.target && (e.target.tagName === "IMG" || e.target.closest("img"))) {
      e.preventDefault();
    }
  });


  // Zobrazení / skrytí API klíčů v nastavení
  const toggleSettingsTmdbKeyBtn = document.getElementById("toggleSettingsTmdbKeyBtn");
  const settingsTmdbEyeIcon = document.getElementById("settingsTmdbEyeIcon");
  if (toggleSettingsTmdbKeyBtn && settingsTmdbApiKey) {
    toggleSettingsTmdbKeyBtn.addEventListener("click", () => {
      const isPass = settingsTmdbApiKey.type === "password";
      settingsTmdbApiKey.type = isPass ? "text" : "password";
      if (settingsTmdbEyeIcon) {
        settingsTmdbEyeIcon.innerHTML = isPass ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
      }
    });
  }

  const toggleSettingsRawgKeyBtn = document.getElementById("toggleSettingsRawgKeyBtn");
  const settingsRawgEyeIcon = document.getElementById("settingsRawgEyeIcon");
  if (toggleSettingsRawgKeyBtn && settingsRawgApiKey) {
    toggleSettingsRawgKeyBtn.addEventListener("click", () => {
      const isPass = settingsRawgApiKey.type === "password";
      settingsRawgApiKey.type = isPass ? "text" : "password";
      if (settingsRawgEyeIcon) {
        settingsRawgEyeIcon.innerHTML = isPass ? SVG_ICONS.eyeOff : SVG_ICONS.eye;
      }
    });
  }

  // Nastavení modál
  openSettingsBtn.addEventListener("click", openSettingsModal);
  closeSettingsModalBtn.addEventListener("click", closeSettingsModal);
  if (cancelSettingsBtn) cancelSettingsBtn.addEventListener("click", closeSettingsModal);
  saveSettingsBtn.addEventListener("click", handleSaveSettings);
  if (openDataFolderBtn) openDataFolderBtn.addEventListener("click", handleOpenDataFolder);
  if (clearTempBtn) clearTempBtn.addEventListener("click", handleClearTempFiles);
  exportDataBtn.addEventListener("click", handleExportData);
  if (reportBugBtn) {
    reportBugBtn.addEventListener("click", () => {
      openExternalUrl("https://github.com/TheMichalBr/tracker/issues?q=sort%3Aupdated-desc+is%3Aissue+state%3Aopen+");
    });
  }

  // Zavření klikem mimo obsah
  formModal.addEventListener("click", (e) => {
    if (e.target === formModal) closeFormModal(false);
  });
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) closeDetailModal();
  });
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });
  if (tmdbModal) {
    tmdbModal.addEventListener("click", (e) => {
      if (e.target === tmdbModal) closeTmdbModal();
    });
  }
  if (trailerModal) {
    trailerModal.addEventListener("click", (e) => {
      if (e.target === trailerModal) closeTrailerModal();
    });
  }

  // Klávesa Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddDropdown();
      closeSortDropdown();
      closeStatusDropdown();
      if (!confirmModal.classList.contains("hidden")) {
        // Obstará confirm handler
      } else if (trailerModal && !trailerModal.classList.contains("hidden")) {
        closeTrailerModal();
      } else if (tmdbModal && !tmdbModal.classList.contains("hidden")) {
        closeTmdbModal();
      } else if (!formModal.classList.contains("hidden")) {
        closeFormModal(false);
      } else if (!detailModal.classList.contains("hidden")) {
        closeDetailModal();
      } else if (!settingsModal.classList.contains("hidden")) {
        closeSettingsModal();
      }
    }
  });

  // Přepínač rozvržení (Dlaždice / Kompaktní / Seznam)
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      setupViewMode(view);
      renderGrid();
    });
  });

  // Přepínání typu položky
  itemTypeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      updateDynamicFormSections(e.target.value);
    });
  });

  // Posuvník hodnocení a přímé textové zadání (včetně libovolných desetinných míst 6.25, 6,5)
  if (itemRating && itemRatingInput) {
    itemRating.addEventListener("input", (e) => {
      if (isNoRatingActive) setNoRatingState(false);
      itemRatingInput.value = e.target.value;
      updateRatingInputWidth();
    });

    itemRatingInput.addEventListener("input", (e) => {
      updateRatingInputWidth();
      const cleanVal = e.target.value.replace(",", ".");
      const num = parseFloat(cleanVal);
      if (!isNaN(num) && num >= 0 && num <= 10) {
        if (isNoRatingActive) setNoRatingState(false);
        itemRating.value = num;
      }
    });

    itemRatingInput.addEventListener("blur", (e) => {
      if (isNoRatingActive) return;
      const cleanVal = e.target.value.replace(",", ".");
      let num = parseFloat(cleanVal);
      if (isNaN(num)) {
        num = parseFloat(itemRating.value) || 8;
      } else {
        num = Math.min(10, Math.max(0, num));
      }
      num = Math.round(num * 100) / 100;
      itemRatingInput.value = num;
      itemRating.value = num;
      updateRatingInputWidth();
    });
  }

  // Tlačítko přepnutí "Nehodnotit"
  if (toggleNoRatingBtn) {
    toggleNoRatingBtn.addEventListener("click", () => {
      setNoRatingState(!isNoRatingActive);
    });
  }

  // Výběr a odebrání plakátu
  selectImageBtn.addEventListener("click", handleSelectImage);
  removeImageBtn.addEventListener("click", handleRemoveImage);

  // Vlastní metadata
  addMetaFieldBtn.addEventListener("click", () => addCustomMetaRow());

  // Odeslání formuláře
  mediaForm.addEventListener("submit", handleFormSubmit);

  // Vyhledávání v reálném čase s debounce (140 ms) pro plynulý chod bez problikávání
  let searchDebounceTimer = null;
  searchInput.addEventListener("input", (e) => {
    const val = e.target.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle("hidden", val === "");

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
      searchQuery = val;
      currentPage = 1;
      renderGrid();
    }, 140);
  });

  // Okamžité vyhledání při stisku klávesy Enter bez čekání na debounce
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      searchQuery = searchInput.value.trim().toLowerCase();
      currentPage = 1;
      renderGrid();
    }
  });

  clearSearchBtn.addEventListener("click", () => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    searchInput.value = "";
    searchQuery = "";
    clearSearchBtn.classList.add("hidden");
    currentPage = 1;
    renderGrid();
    searchInput.focus();
  });

  // Řazení: Vlastní moderní zaoblené rozbalovací menu
  const sortDropdownWrapper = document.getElementById("sortDropdownWrapper");
  const sortDropdownBtn = document.getElementById("sortDropdownBtn");
  const sortDropdownMenu = document.getElementById("sortDropdownMenu");
  const sortCurrentLabel = document.getElementById("sortCurrentLabel");
  const sortOptions = sortDropdownMenu.querySelectorAll(".sort-option");

  if (sortDropdownBtn && sortDropdownMenu) {
    sortDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = sortDropdownMenu.classList.contains("hidden");
      if (isHidden) {
        closeAddDropdown();
        sortDropdownMenu.classList.remove("hidden");
        sortDropdownWrapper?.classList.add("open");
        sortDropdownBtn.setAttribute("aria-expanded", "true");
      } else {
        closeSortDropdown();
      }
    });

    document.addEventListener("click", (e) => {
      if (sortDropdownWrapper && !sortDropdownWrapper.contains(e.target)) {
        closeSortDropdown();
      }
    });

    sortOptions.forEach((opt) => {
      opt.addEventListener("click", () => {
        const val = opt.dataset.value;
        currentSort = val;

        if (sortSelect) {
          sortSelect.value = val;
        }

        sortOptions.forEach((o) => o.classList.toggle("active", o.dataset.value === val));
        if (sortCurrentLabel) {
          const textSpan = opt.querySelector("span");
          if (textSpan) sortCurrentLabel.textContent = textSpan.textContent;
        }

        closeSortDropdown();
        currentPage = 1;
        renderGrid();
      });
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      sortOptions.forEach((o) => o.classList.toggle("active", o.dataset.value === currentSort));
      const activeOpt = Array.from(sortOptions).find((o) => o.dataset.value === currentSort);
      if (activeOpt && sortCurrentLabel) {
        const textSpan = activeOpt.querySelector("span");
        if (textSpan) sortCurrentLabel.textContent = textSpan.textContent;
      }
      currentPage = 1;
      renderGrid();
    });
  }

  // Filtrovací taby
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      currentPage = 1;
      renderGrid();
    });
  });

  // Stránkování tlačítek
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderGrid();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    renderGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==========================================================================
// Přepínání režimů zobrazení (Grid / Compact / List)
// ==========================================================================
function setupViewMode(view) {
  currentView = view;
  localStorage.setItem("tracker_view_mode", view);

  viewButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  mediaGrid.className = `media-grid view-${view}`;

  if (listHeader) {
    listHeader.classList.toggle("hidden", view !== "list" || allItems.length === 0);
  }
}

// ==========================================================================
// Zákaz scrollování pozadí při otevření jakéhokoliv modálního okna
// ==========================================================================
function updateModalBodyLock() {
  const isAnyModalOpen = Boolean(
    (detailModal && !detailModal.classList.contains("hidden")) ||
    (formModal && !formModal.classList.contains("hidden")) ||
    (settingsModal && !settingsModal.classList.contains("hidden")) ||
    (tmdbModal && !tmdbModal.classList.contains("hidden")) ||
    (trailerModal && !trailerModal.classList.contains("hidden")) ||
    (confirmModal && !confirmModal.classList.contains("hidden"))
  );
  document.body.classList.toggle("modal-open", isAnyModalOpen);
}

// ==========================================================================
// Univerzální potvrzovací dialog (Žádný webový alert/confirm)
// ==========================================================================
function showConfirmDialog({
  title = "Potvrzení",
  message = "Opravdu chcete tuto akci provést?",
  confirmText = "Ano, smazat",
  cancelText = "Zrušit",
  danger = true,
}) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmOkBtn.textContent = confirmText;
    confirmCancelBtn.textContent = cancelText;

    if (danger) {
      confirmOkBtn.className = "btn btn-danger";
    } else {
      confirmOkBtn.className = "btn btn-primary";
    }

    confirmModal.classList.remove("hidden");
    updateModalBodyLock();

    function cleanup(result) {
      confirmModal.classList.add("hidden");
      updateModalBodyLock();
      confirmOkBtn.removeEventListener("click", onOk);
      confirmCancelBtn.removeEventListener("click", onCancel);
      confirmModal.removeEventListener("click", onBackdrop);
      window.removeEventListener("keydown", onKeyDown);
      resolve(result);
    }

    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onBackdrop(e) {
      if (e.target === confirmModal) cleanup(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") cleanup(false);
      else if (e.key === "Enter") cleanup(true);
    }

    confirmOkBtn.addEventListener("click", onOk);
    confirmCancelBtn.addEventListener("click", onCancel);
    confirmModal.addEventListener("click", onBackdrop);
    window.addEventListener("keydown", onKeyDown);
    confirmCancelBtn.focus();
  });
}

// ==========================================================================
// Dynamické zobrazení sekcí formuláře podle typu
// ==========================================================================
function updateDynamicFormSections(selectedType) {
  if (selectedType === "Film") {
    sectionFilmSeries.classList.remove("hidden");
    fieldSeasonEpisodes.classList.add("hidden");
    sectionGames.classList.add("hidden");
  } else if (selectedType === "Seriál") {
    sectionFilmSeries.classList.remove("hidden");
    fieldSeasonEpisodes.classList.remove("hidden");
    sectionGames.classList.add("hidden");
  } else if (selectedType === "Hra") {
    sectionFilmSeries.classList.add("hidden");
    fieldSeasonEpisodes.classList.add("hidden");
    sectionGames.classList.remove("hidden");
  }

  const isGame = selectedType === "Hra";
  const statusLabelBacklog = document.getElementById("statusLabelBacklog");
  const statusLabelProgress = document.getElementById("statusLabelProgress");
  const statusLabelCompleted = document.getElementById("statusLabelCompleted");
  const statusLabelDropped = document.getElementById("statusLabelDropped");

  if (statusLabelBacklog) statusLabelBacklog.textContent = isGame ? "Chci hrát" : "Chci vidět";
  if (statusLabelProgress) statusLabelProgress.textContent = isGame ? "Právě hraji" : "Právě sleduji";
  if (statusLabelCompleted) statusLabelCompleted.textContent = isGame ? "Dohráno" : "Zhlédnuto";
  if (statusLabelDropped) statusLabelDropped.textContent = "Odloženo";
}

// ==========================================================================
// Načítání a správa dat z Tauri & Splash Screen
// ==========================================================================

function hideSplashScreen() {
  const splash = document.getElementById("appSplashScreen");
  if (splash) {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.remove();
    }, 450);
  }
}

async function loadItems() {
  const startTime = Date.now();
  try {
    const items = await tauriInvoke("get_items");
    allItems = items || [];
    updateCounts();
    renderGrid();
  } catch (err) {
    console.error("Chyba při načítání:", err);
    showToast("Nepodařilo se načíst data: " + err);
  } finally {
    // Zajistíme minimální dobu zobrazení načítací obrazovky (cca 450 ms),
    // aby byl start aplikace plynulý, bez jakéhokoliv probliknutí a působil profesionálně.
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, 450 - elapsed);
    setTimeout(hideSplashScreen, delay);
  }
}

// Výběr obrázku přes nativní dialog
async function handleSelectImage() {
  try {
    const filePath = await tauriInvoke("select_image");
    if (filePath) {
      selectedImagePath = filePath;
      removeImageFlag = false;
      selectedImagePathText.textContent = filePath;
      selectedImagePathText.title = filePath;

      imagePreviewContainer.classList.remove("hidden");
      imagePreviewImg.src = getCoverUrl(filePath);
    }
  } catch (err) {
    console.error("Chyba při výběru obrázku:", err);
    showToast("Chyba při otevírání dialogu: " + err);
  }
}

function handleRemoveImage() {
  selectedImagePath = null;
  removeImageFlag = true;
  existingImageData = null;
  selectedImagePathText.textContent = "Obrázek bude odebrán";
  imagePreviewContainer.classList.add("hidden");
  imagePreviewImg.src = "";
}

// Přidání řádku pro vlastní metadata (s autocomplete vypnutým)
function addCustomMetaRow(key = "", value = "") {
  const row = document.createElement("div");
  row.className = "custom-meta-row";
  row.innerHTML = `
    <input type="text" class="meta-key flex-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Název údaje (např. Dabing, Herní doba...)" value="${escapeHtml(key)}">
    <input type="text" class="meta-val flex-2" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Hodnota (např. Český dabing, 75 hodin...)" value="${escapeHtml(value)}">
    <button type="button" class="btn-remove-meta" title="Odebrat pole">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  row.querySelector(".btn-remove-meta").addEventListener("click", () => {
    row.remove();
  });

  customMetadataContainer.appendChild(row);
}

function collectCustomMetadata() {
  const meta = {};
  const rows = customMetadataContainer.querySelectorAll(".custom-meta-row");
  rows.forEach((row) => {
    const k = row.querySelector(".meta-key").value.trim();
    const v = row.querySelector(".meta-val").value.trim();
    if (k) {
      meta[k] = v;
    }
  });
  return meta;
}

// ==========================================================================
// Uložení formuláře (Přidání / Úprava)
// ==========================================================================
async function handleFormSubmit(e) {
  e.preventDefault();

  const title = itemTitle.value.trim();
  if (!title) {
    showToast("Zadejte prosím název položky.");
    return;
  }

  const saveBtn = document.getElementById("saveFormBtn");
  const selectedType = document.querySelector('input[name="itemType"]:checked').value;
  
  // Parsování hodnocení (podpora desetinných čísel s tečkou i čárkou, např. 6.25 nebo 6,5; případně bez hodnocení)
  let rating = null;
  if (!isNoRatingActive) {
    const rawRatingStr = (itemRatingInput?.value || itemRating.value).toString().replace(",", ".");
    let parsed = parseFloat(rawRatingStr);
    if (isNaN(parsed) || parsed < 0 || parsed > 10) {
      showToast("Hodnocení musí být číslo v rozmezí 0 až 10 (např. 8, 6.5 nebo 6,25).");
      return;
    }
    rating = Math.round(parsed * 100) / 100;
  }

  const releaseYearVal = itemReleaseYear.value ? parseInt(itemReleaseYear.value, 10) : null;
  const apiRatingVal = itemApiRating.value ? parseFloat(itemApiRating.value.replace(",", ".")) : null;

  saveBtn.disabled = true;
  saveBtn.textContent = "Ukládám...";

  try {
    const payload = {
      itemType: selectedType,
      title: title,
      description: itemDescription.value.trim(),
      tags: itemTags.value.trim(),
      genre: itemGenre.value.trim(),
      rating: rating,
      apiRating: apiRatingVal,
      note: itemNote.value.trim(),
      releaseYear: releaseYearVal,
      director: itemDirector.value.trim(),
      writer: itemWriter.value.trim(),
      castMembers: itemCast.value.trim(),
      production: itemProduction.value.trim(),
      duration: itemDuration.value.trim(),
      seasonEpisodes: selectedType === "Seriál" ? itemSeasonEpisodes.value.trim() : "",
      developer: itemDeveloper.value.trim(),
      publisher: itemPublisher.value.trim(),
      gameMode: itemGameMode.value.trim(),
      platforms: itemPlatforms.value.trim(),
      engine: itemEngine.value.trim(),
      customMetadata: collectCustomMetadata(),
      status: document.querySelector('input[name="itemStatus"]:checked')?.value || "completed",
      trailerUrl: itemTrailerUrl ? itemTrailerUrl.value.trim() : "",
    };

    if (editingItemId === null) {
      payload.imageSourcePath = selectedImagePath;
      const newItem = await tauriInvoke("add_item", { item: payload });
      allItems.unshift(newItem);
      showToast(`Položka "${newItem.title}" byla úspěšně přidána!`);
      updateCounts();
      renderGrid();
      closeFormModal(false);
    } else {
      payload.id = editingItemId;
      payload.imageSourcePath = selectedImagePath;
      payload.removeImage = removeImageFlag;

      const updatedItem = await tauriInvoke("update_item", { item: payload });
      const idx = allItems.findIndex((i) => i.id === editingItemId);
      if (idx !== -1) {
        allItems[idx] = updatedItem;
      }
      showToast(`Změny u "${updatedItem.title}" byly uloženy.`);
      updateCounts();
      renderGrid();
      closeFormModal(true, updatedItem);
    }
  } catch (err) {
    console.error("Chyba při ukládání:", err);
    showToast("Nepodařilo se uložit položku: " + err);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = editingItemId === null ? "Uložit položku" : "Uložit změny";
  }
}

// Smazání položky s vlastním in-app dialogem
async function handleDeleteItem(id, title, fromDetail = false) {
  const confirmed = await showConfirmDialog({
    title: "Smazat záznam",
    message: `Opravdu si přejete smazat "${title}" ze své sbírky? Tato akce je nevratná a odstraní také uložený plakát z disku.`,
    confirmText: "Ano, smazat",
    cancelText: "Zrušit",
    danger: true,
  });

  if (!confirmed) return;

  try {
    await tauriInvoke("delete_item", { id });
    allItems = allItems.filter((item) => item.id !== id);
    updateCounts();
    renderGrid();
    if (fromDetail) {
      closeDetailModal();
    }
    showToast(`Položka "${title}" byla smazána.`);
  } catch (err) {
    console.error("Chyba při mazání:", err);
    showToast("Chyba při mazání: " + err);
  }
}

// ==========================================================================
// Ovládání modálních oken
// ==========================================================================

function openFormModal(itemToEdit = null, prefillData = null) {
  mediaForm.reset();
  customMetadataContainer.innerHTML = "";
  selectedImagePath = null;
  removeImageFlag = false;
  existingImageData = null;

  if (!itemToEdit) {
    detailModalItemBeforeEdit = null;
  }

  if (itemToEdit) {
    editingItemId = itemToEdit.id;
    modalTitle.textContent = `Upravit: ${itemToEdit.title}`;
    document.getElementById("saveFormBtn").textContent = "Uložit změny";

    const typeRadio = document.querySelector(`input[name="itemType"][value="${itemToEdit.item_type}"]`);
    if (typeRadio) typeRadio.checked = true;
    updateDynamicFormSections(itemToEdit.item_type);

    const st = itemToEdit.status || "completed";
    const stRadio = document.querySelector(`input[name="itemStatus"][value="${st}"]`);
    if (stRadio) stRadio.checked = true;

    if (itemTrailerUrl) itemTrailerUrl.value = itemToEdit.trailer_url || "";

    itemTitle.value = itemToEdit.title || "";
    itemReleaseYear.value = itemToEdit.release_year || "";
    itemGenre.value = itemToEdit.genre || "";
    itemTags.value = itemToEdit.tags || "";
    itemDescription.value = itemToEdit.description || "";
    
    const hasRating = itemToEdit.rating !== undefined && itemToEdit.rating !== null;
    if (hasRating) {
      itemRating.value = itemToEdit.rating;
      if (itemRatingInput) {
        itemRatingInput.value = itemToEdit.rating;
        updateRatingInputWidth();
      }
      setNoRatingState(false);
    } else {
      itemRating.value = 8;
      if (itemRatingInput) {
        itemRatingInput.value = 8;
        updateRatingInputWidth();
      }
      setNoRatingState(true);
    }

    itemApiRating.value = itemToEdit.api_rating !== null && itemToEdit.api_rating !== undefined ? itemToEdit.api_rating : "";
    itemNote.value = itemToEdit.note || "";

    // Filmy / Seriály
    itemDirector.value = itemToEdit.director || "";
    itemWriter.value = itemToEdit.writer || "";
    itemProduction.value = itemToEdit.production || "";
    itemDuration.value = itemToEdit.duration || "";
    itemSeasonEpisodes.value = itemToEdit.season_episodes || "";
    itemCast.value = itemToEdit.cast_members || "";

    // Hry
    itemDeveloper.value = itemToEdit.developer || "";
    itemPublisher.value = itemToEdit.publisher || "";
    itemGameMode.value = itemToEdit.game_mode || "";
    itemPlatforms.value = itemToEdit.platforms || "";
    itemEngine.value = itemToEdit.engine || "";

    // Plakát
    if (itemToEdit.image_data) {
      existingImageData = itemToEdit.image_data;
      imagePreviewImg.src = getCoverUrl(itemToEdit.image_data);
      imagePreviewContainer.classList.remove("hidden");
      selectedImagePathText.textContent = itemToEdit.image_path || "Uložený plakát";
    } else {
      imagePreviewContainer.classList.add("hidden");
      selectedImagePathText.textContent = "Položka nemá plakát";
    }

    if (itemToEdit.custom_metadata) {
      for (const [k, v] of Object.entries(itemToEdit.custom_metadata)) {
        addCustomMetaRow(k, v);
      }
    }
  } else if (prefillData) {
    editingItemId = null;
    modalTitle.textContent = `Přidat: ${prefillData.title || "z TMDB"}`;
    document.getElementById("saveFormBtn").textContent = "Uložit položku";

    const targetType = prefillData.itemType || "Film";
    const typeRadio = document.querySelector(`input[name="itemType"][value="${targetType}"]`);
    if (typeRadio) typeRadio.checked = true;
    updateDynamicFormSections(targetType);

    const st = prefillData.status || "completed";
    const stRadio = document.querySelector(`input[name="itemStatus"][value="${st}"]`);
    if (stRadio) stRadio.checked = true;

    if (itemTrailerUrl) itemTrailerUrl.value = prefillData.trailerUrl || "";

    itemTitle.value = prefillData.title || "";
    itemReleaseYear.value = prefillData.releaseYear || "";
    itemGenre.value = prefillData.genre || "";
    itemTags.value = prefillData.tags || "";
    itemDescription.value = prefillData.description || "";

    const prefRating = prefillData.rating !== undefined && prefillData.rating !== null ? prefillData.rating : 8;
    itemRating.value = prefRating;
    if (itemRatingInput) {
      itemRatingInput.value = prefRating;
      updateRatingInputWidth();
    }
    setNoRatingState(prefillData.rating === null);
    itemApiRating.value = prefillData.apiRating !== undefined && prefillData.apiRating !== null ? prefillData.apiRating : "";
    itemNote.value = prefillData.note || "";

    // Filmy / Seriály
    itemDirector.value = prefillData.director || "";
    itemWriter.value = prefillData.writer || "";
    itemProduction.value = prefillData.production || "";
    itemDuration.value = prefillData.duration || "";
    if (itemSeasonEpisodes) itemSeasonEpisodes.value = prefillData.seasonEpisodes || "";
    itemCast.value = prefillData.castMembers || "";

    // Hry
    itemDeveloper.value = prefillData.developer || "";
    itemPublisher.value = prefillData.publisher || "";
    itemGameMode.value = prefillData.gameMode || "";
    itemPlatforms.value = prefillData.platforms || "";
    itemEngine.value = prefillData.engine || "";

    // Plakát
    if (prefillData.imageData || prefillData.imagePath) {
      selectedImagePath = prefillData.imagePath || "";
      existingImageData = prefillData.imageData || "";
      imagePreviewImg.src = getCoverUrl(prefillData.imageData || prefillData.imagePath);
      imagePreviewContainer.classList.remove("hidden");
      selectedImagePathText.textContent = "Plakát načten z online databáze";
    } else {
      imagePreviewContainer.classList.add("hidden");
      selectedImagePathText.textContent = "Žádný plakát nebyl nalezen";
    }

    if (prefillData.customMetadata) {
      for (const [k, v] of Object.entries(prefillData.customMetadata)) {
        addCustomMetaRow(k, v);
      }
    }
  } else {
    editingItemId = null;
    modalTitle.textContent = "Přidat novou položku";
    document.getElementById("saveFormBtn").textContent = "Uložit položku";

    document.querySelector('input[name="itemType"][value="Film"]').checked = true;
    updateDynamicFormSections("Film");

    const defStRadio = document.querySelector('input[name="itemStatus"][value="completed"]');
    if (defStRadio) defStRadio.checked = true;
    if (itemTrailerUrl) itemTrailerUrl.value = "";

    itemRating.value = 8;
    if (itemRatingInput) {
      itemRatingInput.value = 8;
      updateRatingInputWidth();
    }
    setNoRatingState(false);
    imagePreviewContainer.classList.add("hidden");
    selectedImagePathText.textContent = "Žádný nový soubor nevybrán";
  }

  formModal.classList.remove("hidden");
  updateModalBodyLock();
  itemTitle.focus();
}

function closeFormModal(wasSaved = false, updatedItem = null) {
  formModal.classList.add("hidden");
  updateModalBodyLock();

  if (detailModalItemBeforeEdit) {
    const prevItem = detailModalItemBeforeEdit;
    detailModalItemBeforeEdit = null;
    const itemToShow = wasSaved && updatedItem
      ? updatedItem
      : (allItems.find((i) => i.id === prevItem.id) || prevItem);
    openDetailModal(itemToShow);
  }
}

// ==========================================================================
// Informace o stavu položky (Watchlist / Backlog)
// ==========================================================================
function getStatusInfo(statusKey, itemType = "Film") {
  const isGame = itemType === "Hra";
  const status = statusKey || "completed";

  switch (status) {
    case "backlog":
      return {
        key: "backlog",
        label: isGame ? "Chci hrát" : "Chci vidět",
        bulletClass: "bullet-backlog",
      };
    case "in_progress":
      return {
        key: "progress",
        label: isGame ? "Právě hraji" : "Právě sleduji",
        bulletClass: "bullet-progress",
      };
    case "completed":
      return {
        key: "completed",
        label: isGame ? "Dohráno" : "Zhlédnuto",
        bulletClass: "bullet-completed",
      };
    case "dropped":
      return {
        key: "dropped",
        label: "Odloženo",
        bulletClass: "bullet-dropped",
      };
    default:
      return {
        key: "completed",
        label: isGame ? "Dohráno" : "Zhlédnuto",
        bulletClass: "bullet-completed",
      };
  }
}

// ==========================================================================
// Bezpečné otevírání externích odkazů v prohlížeči přes Tauri IPC
// ==========================================================================
function openExternalUrl(url) {
  if (!url) return;
  tauriInvoke("open_url", { url }).catch((err) => {
    console.warn("Chyba při otevírání odkazu přes Tauri:", err);
    window.open(url, "_blank");
  });
}

// ==========================================================================
// Přehrávač trailerů
// ==========================================================================
function openTrailerModal(url, title) {
  if (!url) return;
  currentTrailerUrl = url;
  const trailerModalTitle = document.getElementById("trailerModalTitle");
  const trailerModalSubtitle = document.getElementById("trailerModalSubtitle");

  if (trailerModalTitle) {
    trailerModalTitle.textContent = title ? `Trailer: ${title}` : "Přehrát trailer";
  }
  if (trailerModalSubtitle) {
    trailerModalSubtitle.textContent = "Oficiální videoupoutávka";
  }

  // Zjištění YouTube ID
  let youtubeId = null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    youtubeId = ytMatch[1];
  } else if (/^[\w-]{11}$/.test(url.trim())) {
    youtubeId = url.trim();
  }

  if (trailerPlayerWrap) {
    if (youtubeId) {
      trailerPlayerWrap.innerHTML = `
        <iframe 
          src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      `;
    } else {
      trailerPlayerWrap.innerHTML = `
        <video controls autoplay src="${escapeHtml(url)}" style="width: 100%; height: 100%;">
          Váš prohlížeč nepodporuje přehrávání tohoto formátu videa.
        </video>
      `;
    }
  }

  if (trailerModal) {
    trailerModal.classList.remove("hidden");
    updateModalBodyLock();
  }
}

function closeTrailerModal() {
  if (trailerPlayerWrap) {
    trailerPlayerWrap.innerHTML = "";
  }
  if (trailerModal) {
    trailerModal.classList.add("hidden");
    updateModalBodyLock();
  }
  currentTrailerUrl = "";
}

// Aktualizace stavových tlačítek v detailu
function updateDetailStatusView(item) {
  const isGame = item.item_type === "Hra";
  const status = item.status || "completed";

  const backlogText = document.getElementById("detailStatusTextBacklog");
  const progressText = document.getElementById("detailStatusTextProgress");
  const completedText = document.getElementById("detailStatusTextCompleted");
  const droppedText = document.getElementById("detailStatusTextDropped");

  if (backlogText) backlogText.textContent = isGame ? "Chci hrát" : "Chci vidět";
  if (progressText) progressText.textContent = isGame ? "Hraji" : "Sleduji";
  if (completedText) completedText.textContent = isGame ? "Dohráno" : "Dokončeno";
  if (droppedText) droppedText.textContent = "Odloženo";

  const buttons = document.querySelectorAll(".detail-status-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.status === status);
    btn.onclick = async () => {
      const newStatus = btn.dataset.status;
      if (item.status === newStatus) return;

      try {
        await tauriInvoke("update_item_status", { id: item.id, status: newStatus });
        item.status = newStatus;
        const idx = allItems.findIndex((i) => i.id === item.id);
        if (idx !== -1) allItems[idx].status = newStatus;

        updateDetailStatusView(item);
        renderGrid();
        const updatedInfo = getStatusInfo(newStatus, item.item_type);
        showToast(`Stav byl změněn na: "${updatedInfo.label}".`);
      } catch (err) {
        console.error("Chyba při změně stavu:", err);
        showToast("Nepodařilo se změnit stav: " + err);
      }
    };
  });
}

// Vykreslení externích odkazů v detailu
function renderDetailLinks(item) {
  if (!detailLinksList) return;
  detailLinksList.innerHTML = "";

  const titleEnc = encodeURIComponent(item.title);
  const links = [];

  if (item.item_type === "Film" || item.item_type === "Seriál") {
    links.push({
      name: "ČSFD.cz",
      tag: "ČSFD",
      tagClass: "tag-csfd",
      url: `https://www.csfd.cz/hledat/?q=${titleEnc}`,
      hint: "Hledat na Česko-Slovenské filmové databázi",
    });

    let imdbId = item.custom_metadata?.["IMDb ID"] || item.custom_metadata?.["imdb_id"];
    const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : `https://www.imdb.com/find/?q=${titleEnc}`;
    links.push({
      name: "IMDb",
      tag: "IMDb",
      tagClass: "tag-imdb",
      url: imdbUrl,
      hint: imdbId ? `Přejít přímo na IMDb (${imdbId})` : "Hledat na IMDb",
    });

    let tmdbId = item.custom_metadata?.["TMDB ID"] || item.custom_metadata?.["tmdb_id"];
    const tmdbType = item.item_type === "Seriál" ? "tv" : "movie";
    const tmdbUrl = tmdbId ? `https://www.themoviedb.org/${tmdbType}/${tmdbId}` : `https://www.themoviedb.org/search?query=${titleEnc}`;
    links.push({
      name: "The Movie DB",
      tag: "TMDB",
      tagClass: "tag-tmdb",
      url: tmdbUrl,
      hint: "Zobrazit na TMDB",
    });
  } else if (item.item_type === "Hra") {
    links.push({
      name: "Steam Store",
      tag: "Steam",
      tagClass: "tag-steam",
      url: `https://store.steampowered.com/search/?term=${titleEnc}`,
      hint: "Vyhledat na platformě Steam",
    });

    links.push({
      name: "Metacritic",
      tag: "MC",
      tagClass: "tag-metacritic",
      url: `https://www.metacritic.com/search/${titleEnc}/`,
      hint: "Zobrazit recenze na Metacritic",
    });

    let rawgId = item.custom_metadata?.["RAWG ID"];
    const rawgUrl = rawgId ? `https://rawg.io/games/${rawgId}` : `https://rawg.io/search?query=${titleEnc}`;
    links.push({
      name: "RAWG.io",
      tag: "RAWG",
      tagClass: "tag-rawg",
      url: rawgUrl,
      hint: "Zobrazit na herní databázi RAWG",
    });
  }

  links.forEach((link) => {
    const a = document.createElement("a");
    a.className = "detail-link-pill";
    a.href = "#";
    a.title = link.hint;
    a.innerHTML = `
      <div class="detail-link-pill-left">
        <span class="link-brand-tag ${link.tagClass}">${escapeHtml(link.tag)}</span>
        <span>${escapeHtml(link.name)}</span>
      </div>
      <svg class="detail-link-external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    `;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openExternalUrl(link.url);
    });
    detailLinksList.appendChild(a);
  });
}

// ==========================================================================
// Přepočet hodnocení (0-10) na 5 hvězdiček (Plná, Poloviční, Prázdná)
// ==========================================================================
function renderStarRatingHtml(ratingVal) {
  const num = typeof ratingVal === "number" ? ratingVal : parseFloat(ratingVal) || 0;
  // Převod škály 0 až 10 na škálu 0 až 5 hvězd
  const starScore = Math.max(0, Math.min(5, num / 2));
  
  const starPolygon = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";
  let starsHtml = "";

  for (let i = 1; i <= 5; i++) {
    const diff = starScore - (i - 1);
    if (diff >= 0.75) {
      // Plná zlatá hvězdička
      starsHtml += `<svg class="rating-star star-filled" viewBox="0 0 24 24" width="18" height="18" fill="#f59e0b"><polygon points="${starPolygon}"></polygon></svg>`;
    } else if (diff >= 0.25) {
      // Poloviční hvězdička (levá polovina zlatá, pravá prázdná)
      starsHtml += `<svg class="rating-star star-half" viewBox="0 0 24 24" width="18" height="18"><polygon points="${starPolygon}" fill="rgba(255, 255, 255, 0.18)"></polygon><path d="M12 2 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" fill="#f59e0b"></path></svg>`;
    } else {
      // Prázdná hvězdička
      starsHtml += `<svg class="rating-star star-empty" viewBox="0 0 24 24" width="18" height="18" fill="rgba(255, 255, 255, 0.18)"><polygon points="${starPolygon}"></polygon></svg>`;
    }
  }

  return `<div class="rating-stars-group" title="${num} z 10 (${Math.round(starScore * 10) / 10} z 5)">${starsHtml}</div>`;
}

// Zobrazení detailu položky
function openDetailModal(item) {
  currentItemDetail = item;

  // Typ a Rok s SVG ikonou
  const typeIcon = item.item_type === "Film" ? SVG_ICONS.film : item.item_type === "Seriál" ? SVG_ICONS.series : SVG_ICONS.game;
  detailTypeBadge.className = `card-type-badge type-${escapeHtml(item.item_type)}`;
  detailTypeBadge.innerHTML = `${typeIcon} <span>${item.item_type}</span>`;

  if (item.release_year) {
    detailYearBadge.innerHTML = `${SVG_ICONS.calendar} <span>${item.release_year}</span>`;
    detailYearBadge.classList.remove("hidden");
  } else {
    detailYearBadge.classList.add("hidden");
  }

  // Plakát (v modálu se zobrazí ihned bez zpoždění a bez animace)
  detailPosterWrap.innerHTML = "";
  const detailCoverSrc = getCoverUrl(item.image_data);
  if (detailCoverSrc) {
    detailPosterWrap.innerHTML = `<img src="${detailCoverSrc}" alt="${escapeHtml(item.title)}" draggable="false" onerror="handlePosterError(this)">`;
  } else {
    detailPosterWrap.innerHTML = `
      <div class="poster-placeholder">
        <div class="placeholder-eye-off">${SVG_ICONS.eyeOff}</div>
      </div>
    `;
  }

  // Hodnocení: 5 hvězdiček (matematicky převedeno z 10) + číselný údaj (pokud je položka ohodnocena)
  if (item.rating !== null && item.rating !== undefined && item.rating >= 0) {
    detailUserRating.innerHTML = `
      ${renderStarRatingHtml(item.rating)}
      <div class="rating-val-text-wrap">
        <span class="rating-val-num">${item.rating}</span><span class="rating-max">/10</span>
      </div>
    `;
    detailUserRatingBox.classList.remove("hidden");
  } else {
    detailUserRatingBox.classList.add("hidden");
  }
  if (item.api_rating !== null && item.api_rating !== undefined && String(item.api_rating).trim() !== "") {
    detailApiRating.innerHTML = `${SVG_ICONS.api} <span>${item.api_rating}</span>`;
    detailApiRatingBox.classList.remove("hidden");
  } else {
    detailApiRatingBox.classList.add("hidden");
  }

  detailTitle.textContent = item.title;
  detailTitle.title = item.title;

  // Žánr
  detailGenre.innerHTML = "";
  const detailGenreWrap = document.getElementById("detailGenreWrap");
  if (item.genre && item.genre.trim() !== "") {
    const genres = item.genre.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    genres.forEach((g) => {
      detailGenre.innerHTML += `<span class="genre-tag">${escapeHtml(g)}</span>`;
    });
    if (detailGenreWrap) detailGenreWrap.classList.remove("hidden");
  } else {
    if (detailGenreWrap) detailGenreWrap.classList.add("hidden");
  }

  // Tagy
  detailTags.innerHTML = "";
  const detailTagsWrap = document.getElementById("detailTagsWrap");
  if (item.tags) {
    const tags = item.tags.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    tags.forEach((t) => {
      detailTags.innerHTML += `<span class="tag-pill">#${escapeHtml(t)}</span>`;
    });
    if (detailTagsWrap) detailTagsWrap.classList.remove("hidden");
  } else {
    if (detailTagsWrap) detailTagsWrap.classList.add("hidden");
  }

  // Popis
  if (item.description) {
    detailDescription.textContent = item.description;
    detailDescriptionWrap.classList.remove("hidden");
  } else {
    detailDescriptionWrap.classList.add("hidden");
  }

  // Mřížka podrobností
  detailMetaGrid.innerHTML = "";

  if (item.item_type === "Film" || item.item_type === "Seriál") {
    if (item.director) addDetailMetaCell(detailMetaGrid, "Režie", item.director);
    if (item.writer) addDetailMetaCell(detailMetaGrid, "Scénář", item.writer);
    if (item.production) addDetailMetaCell(detailMetaGrid, "Produkce", item.production);
    if (item.duration) addDetailMetaCell(detailMetaGrid, "Délka", item.duration);
    if (item.item_type === "Seriál" && item.season_episodes) {
      addDetailMetaCell(detailMetaGrid, "Řada / Epizody", item.season_episodes);
    }
    if (item.cast_members) addDetailMetaCell(detailMetaGrid, "Obsazení", item.cast_members);
  } else if (item.item_type === "Hra") {
    if (item.developer) addDetailMetaCell(detailMetaGrid, "Vývojářské studio", item.developer);
    if (item.publisher) addDetailMetaCell(detailMetaGrid, "Vydavatel", item.publisher);
    if (item.engine) addDetailMetaCell(detailMetaGrid, "Engine", item.engine);
    if (item.game_mode) addDetailMetaCell(detailMetaGrid, "Herní režim", item.game_mode);
    if (item.platforms) addDetailMetaCell(detailMetaGrid, "Platformy", item.platforms);
  }

  if (detailMetaWrap) {
    if (detailMetaGrid.children.length > 0) {
      detailMetaWrap.classList.remove("hidden");
    } else {
      detailMetaWrap.classList.add("hidden");
    }
  }

  if (item.note) {
    detailNote.textContent = item.note;
    detailNoteWrap.classList.remove("hidden");
  } else {
    detailNoteWrap.classList.add("hidden");
  }

  detailCustomMetaGrid.innerHTML = "";
  if (item.custom_metadata && Object.keys(item.custom_metadata).length > 0) {
    detailCustomMetaWrap.classList.remove("hidden");
    for (const [key, val] of Object.entries(item.custom_metadata)) {
      addDetailMetaCell(detailCustomMetaGrid, key, val);
    }
  } else {
    detailCustomMetaWrap.classList.add("hidden");
  }

  const detailPersonalWrap = document.getElementById("detailPersonalWrap");
  const hasNotes = Boolean(item.note);
  const hasCustom = Boolean(item.custom_metadata && Object.keys(item.custom_metadata).length > 0);
  if (detailPersonalWrap && detailMetaWrap) {
    if (!hasNotes && !hasCustom) {
      detailPersonalWrap.classList.add("hidden");
      detailMetaWrap.classList.add("full-width");
    } else {
      detailPersonalWrap.classList.remove("hidden");
      detailMetaWrap.classList.remove("full-width");
    }
  }

  // 1. Stav položky (Watchlist / Backlog)
  updateDetailStatusView(item);

  // 2. Klikací externí databáze (ČSFD, IMDb, TMDB, Steam, Metacritic, RAWG)
  renderDetailLinks(item);

  // 3. Tlačítko pro spuštění traileru
  if (detailTrailerBtn) {
    if (item.trailer_url && item.trailer_url.trim() !== "") {
      detailTrailerBtn.classList.remove("hidden");
      detailTrailerBtn.onclick = () => {
        openTrailerModal(item.trailer_url, item.title);
      };
    } else {
      detailTrailerBtn.classList.add("hidden");
      detailTrailerBtn.onclick = null;
    }
  }

  detailModal.classList.remove("hidden");
  updateModalBodyLock();
}

function addDetailMetaCell(container, label, value) {
  const cell = document.createElement("div");
  const isWide = String(value).length > 32 || label === "Obsazení" || label === "Herecké obsazení" || label === "Platformy" || label === "Vývojářské studio";
  cell.className = `detail-meta-cell${isWide ? " full-width" : ""}`;

  let iconHtml = "";
  if (label === "Režie") iconHtml = "🎬 ";
  else if (label === "Scénář") iconHtml = "✍️ ";
  else if (label === "Produkce") iconHtml = "🏢 ";
  else if (label === "Délka") iconHtml = "⏱️ ";
  else if (label === "Řada / Epizody") iconHtml = "📺 ";
  else if (label === "Obsazení" || label === "Herecké obsazení") iconHtml = "🎭 ";
  else if (label === "Vývojářské studio") iconHtml = "💻 ";
  else if (label === "Vydavatel") iconHtml = "📦 ";
  else if (label === "Engine") iconHtml = "⚙️ ";
  else if (label === "Herní režim") iconHtml = "🕹️ ";
  else if (label === "Platformy") iconHtml = "🎮 ";
  else iconHtml = ""; // Odstraněna emoji pinned pro další podrobnosti

  cell.innerHTML = `
    <span class="meta-cell-label">${iconHtml}${escapeHtml(label)}</span>
    <span class="meta-cell-value">${escapeHtml(value)}</span>
  `;
  container.appendChild(cell);
}

function closeDetailModal() {
  detailModal.classList.add("hidden");
  currentItemDetail = null;
  detailModalItemBeforeEdit = null;
  updateModalBodyLock();
}

// ==========================================================================
// Modál: Nastavení aplikace
// ==========================================================================
function openSettingsModal() {
  settingsDefaultView.value = localStorage.getItem("tracker_view_mode") || "grid";
  settingsItemsPerPage.value = localStorage.getItem("tracker_items_per_page") || "24";
  settingsItemCount.textContent = `${allItems.length} položek`;
  if (settingsTmdbApiKey) {
    settingsTmdbApiKey.value = localStorage.getItem("tracker_tmdb_api_key") || "";
  }
  if (settingsRawgApiKey) {
    settingsRawgApiKey.value = localStorage.getItem("tracker_rawg_api_key") || "";
  }

  settingsModal.classList.remove("hidden");
  updateModalBodyLock();
}

function closeSettingsModal() {
  settingsModal.classList.add("hidden");
  updateModalBodyLock();
}

function handleSaveSettings() {
  const newView = settingsDefaultView.value;
  const newItemsPerPage = settingsItemsPerPage.value;

  localStorage.setItem("tracker_view_mode", newView);
  localStorage.setItem("tracker_items_per_page", newItemsPerPage);

  if (settingsTmdbApiKey) {
    let key = settingsTmdbApiKey.value.trim().replace(/^["']|["']$/g, "").trim();
    if (key.toLowerCase().startsWith("bearer ")) {
      key = key.substring(7).trim();
    }
    settingsTmdbApiKey.value = key;
    localStorage.setItem("tracker_tmdb_api_key", key);
    if (tmdbApiKeyInput) tmdbApiKeyInput.value = key;
    updateTmdbKeyBadge();
  }

  if (settingsRawgApiKey) {
    let rawgKey = settingsRawgApiKey.value.trim().replace(/^["']|["']$/g, "").trim();
    settingsRawgApiKey.value = rawgKey;
    localStorage.setItem("tracker_rawg_api_key", rawgKey);
    if (rawgApiKeyInput) rawgApiKeyInput.value = rawgKey;
    updateRawgKeyBadge();
  }

  setupViewMode(newView);
  itemsPerPage = newItemsPerPage;
  currentPage = 1;
  renderGrid();

  closeSettingsModal();
  showToast("Nastavení bylo úspěšně uloženo.");
}

async function handleOpenDataFolder() {
  try {
    await tauriInvoke("open_data_folder");
    showToast("Otevírám složku s daty aplikace v Průzkumníku...");
  } catch (err) {
    console.error("Chyba při otevírání složky:", err);
    showToast("Nepodařilo se otevřít složku: " + err);
  }
}

async function handleClearTempFiles() {
  try {
    const deletedCount = await tauriInvoke("clear_temp_files");
    if (deletedCount > 0) {
      showToast(`Dočasné soubory byly vyčištěny (smazáno: ${deletedCount}).`);
    } else {
      showToast("Složka dočasných souborů je již prázdná.");
    }
  } catch (err) {
    console.error("Chyba při čištění dočasných souborů:", err);
    showToast("Nepodařilo se vyčistit dočasné soubory: " + err);
  }
}

function handleExportData() {
  const jsonStr = JSON.stringify(allItems, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fileName = `tracker-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Záloha "${fileName}" byla stažena do složky Downloads.`);
}

// ==========================================================================
// Vykreslování mřížky a Stránkování
// ==========================================================================

function updateCounts() {
  const films = allItems.filter((i) => i.item_type === "Film").length;
  const series = allItems.filter((i) => i.item_type === "Seriál").length;
  const games = allItems.filter((i) => i.item_type === "Hra").length;

  countAll.textContent = allItems.length;
  countFilms.textContent = films;
  countSeries.textContent = series;
  countGames.textContent = games;
}

function renderGrid() {
  // 1. Filtrování podle kategorie, stavu a hledaného textu
  let filtered = allItems.filter((item) => {
    const matchesCategory = activeFilter === "all" || item.item_type === activeFilter;
    if (!matchesCategory) return false;

    // Filtrování podle stavu položky (Watchlist / Backlog)
    if (currentStatusFilter !== "all") {
      const itemStatus = item.status || "completed";
      if (itemStatus !== currentStatusFilter) return false;
    }

    if (!searchQuery) return true;

    const fieldsToSearch = [
      item.title,
      item.description,
      item.tags,
      item.genre,
      item.director,
      item.writer,
      item.cast_members,
      item.developer,
      item.publisher,
      item.platforms,
      item.note,
    ];

    if (item.custom_metadata) {
      for (const [k, v] of Object.entries(item.custom_metadata)) {
        fieldsToSearch.push(k, v);
      }
    }

    return fieldsToSearch.some((f) => f && f.toLowerCase().includes(searchQuery));
  });

  // 2. Řazení
  filtered.sort((a, b) => {
    if (currentSort === "ratingDesc") {
      const rA = a.rating !== null && a.rating !== undefined && a.rating >= 0 ? a.rating : -1;
      const rB = b.rating !== null && b.rating !== undefined && b.rating >= 0 ? b.rating : -1;
      return rB - rA;
    } else if (currentSort === "ratingAsc") {
      const rA = a.rating !== null && a.rating !== undefined && a.rating >= 0 ? a.rating : 999;
      const rB = b.rating !== null && b.rating !== undefined && b.rating >= 0 ? b.rating : 999;
      return rA - rB;
    } else if (currentSort === "yearDesc") {
      return (b.release_year || 0) - (a.release_year || 0);
    } else if (currentSort === "titleAsc") {
      return a.title.localeCompare(b.title, "cs");
    } else {
      return b.id - a.id;
    }
  });

  mediaGrid.innerHTML = "";

  if (filtered.length === 0) {
    if (listHeader) listHeader.classList.add("hidden");
    emptyState.classList.remove("hidden");
    paginationBar.classList.add("hidden");
    const emptyText = document.getElementById("emptyStateText");
    if (searchQuery) {
      emptyText.textContent = `Hledanému výrazu "${searchQuery}" neodpovídá žádný záznam.`;
    } else {
      emptyText.textContent = "Zatím zde nemáte žádné záznamy. Klikněte na tlačítko níže a přidejte svůj první film, seriál nebo hru.";
    }
    return;
  }

  emptyState.classList.add("hidden");
  if (listHeader) {
    listHeader.classList.toggle("hidden", currentView !== "list");
  }

  // 3. Stránkování
  let itemsToRender = filtered;
  if (itemsPerPage !== "all") {
    const perPage = parseInt(itemsPerPage, 10);
    const totalPages = Math.ceil(filtered.length / perPage);

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, filtered.length);
    itemsToRender = filtered.slice(startIdx, endIdx);

    renderPagination(filtered.length, startIdx, endIdx, totalPages);
  } else {
    paginationBar.classList.add("hidden");
  }

  // 4. Vykreslení karet podle zvoleného rozvržení
  setupGridImageObserver();
  const isInfinite = itemsPerPage === "all";

  itemsToRender.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const typeIcon = item.item_type === "Film" ? SVG_ICONS.film : item.item_type === "Seriál" ? SVG_ICONS.series : SVG_ICONS.game;

    // Plakát
    let posterHtml = "";
    const coverSrc = getCoverUrl(item.image_data);
    if (coverSrc) {
      const shouldLazy = isInfinite && index >= 24;

      if (shouldLazy) {
        posterHtml = `<img data-src="${coverSrc}" alt="${escapeHtml(item.title)}" decoding="async" draggable="false" onload="handlePosterLoad(this)" onerror="handlePosterError(this)">`;
      } else {
        posterHtml = `<img src="${coverSrc}" alt="${escapeHtml(item.title)}" decoding="async" draggable="false" onload="handlePosterLoad(this)" onerror="handlePosterError(this)">`;
      }
    } else {
      posterHtml = `
        <div class="poster-placeholder">
          <div class="placeholder-eye-off">${SVG_ICONS.eyeOff}</div>
        </div>
      `;
    }

    if (currentView === "list") {
      // Rozvržení: Detailní seznam / Tabulka (Kompaktní a zarovnaná)
      const creatorInfo = item.director ? `Režie: ${escapeHtml(item.director)}` : item.developer ? `Studio: ${escapeHtml(item.developer)}` : "—";
      
      card.innerHTML = `
        <div class="card-poster">${posterHtml}</div>
        <div class="card-content">
          <div class="list-col-main">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <span class="card-year">${item.release_year || "—"}</span>
          </div>

          <div class="list-col-type">
            <span class="card-type-badge type-${escapeHtml(item.item_type)}">${typeIcon} ${escapeHtml(item.item_type)}</span>
          </div>

          <div class="list-col-genre">
            ${item.genre ? `<span class="genre-tag">${escapeHtml(item.genre)}</span>` : `<span class="text-dim">—</span>`}
          </div>

          <div class="list-col-creator" title="${creatorInfo}">
            ${creatorInfo}
          </div>

          <div class="list-col-ratings">
            ${item.rating !== null && item.rating !== undefined && item.rating >= 0 ? `<span class="card-rating-badge">${SVG_ICONS.star} ${item.rating}</span>` : ""}
            ${item.api_rating !== null && item.api_rating !== undefined ? `<span class="card-api-badge">${SVG_ICONS.api} ${item.api_rating}</span>` : ""}
          </div>

          <div class="list-col-action">
            <button type="button" class="btn-list-view">Detail</button>
          </div>
        </div>
      `;
    } else {
      // Rozvržení: Dlaždice (Grid) nebo Kompaktní (Compact)
      card.innerHTML = `
        <div class="card-poster">
          ${posterHtml}
          <div class="card-top-badges">
            <span class="card-type-badge type-${escapeHtml(item.item_type)}" title="${escapeHtml(item.item_type)}">${typeIcon}<span class="card-type-label">${escapeHtml(item.item_type)}</span></span>
            ${(item.rating !== null && item.rating !== undefined && item.rating >= 0) || (item.api_rating !== null && item.api_rating !== undefined) ? `
              <div class="card-rating-badges-wrap">
                ${item.rating !== null && item.rating !== undefined && item.rating >= 0 ? `<span class="card-rating-badge">${SVG_ICONS.star} ${item.rating}</span>` : ""}
                ${item.api_rating !== null && item.api_rating !== undefined ? `<span class="card-api-badge">${SVG_ICONS.api} ${item.api_rating}</span>` : ""}
              </div>
            ` : ""}
          </div>

          <!-- Nápověda po najetí: Pouze přechod do detailu (žádné mazání z hlavní mřížky) -->
          <div class="card-detail-hint">
            ${SVG_ICONS.eye}
            <span>Zobrazit detail</span>
          </div>
        </div>

        <div class="card-content">
          <h3 class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
          ${item.release_year ? `<span class="card-year">${item.release_year}</span>` : ""}
        </div>
      `;
    }

    // Kliknutí na kartu otevře VŽDY přímo Detail dané položky
    card.addEventListener("click", () => {
      openDetailModal(item);
    });

    mediaGrid.appendChild(card);
  });

  if (gridImageObserver) {
    mediaGrid.querySelectorAll("img[data-src]").forEach((img) => {
      gridImageObserver.observe(img);
    });
  }

  // Zajištění plynulého rozsvícení pro obrázky načtené okamžitě z mezipaměti
  requestAnimationFrame(() => {
    mediaGrid.querySelectorAll(".card-poster img:not(.loaded)").forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add("loaded");
      }
    });
  });

  // Bezpečnostní pojistka: žádný obrázek nezůstane neviditelný
  setTimeout(() => {
    mediaGrid.querySelectorAll(".card-poster img:not(.loaded)").forEach((img) => {
      if (!img.dataset.src) {
        img.classList.add("loaded");
      }
    });
  }, 600);
}

// Vykreslení ovládací lišty stránkování
function renderPagination(totalCount, startIdx, endIdx, totalPages) {
  paginationBar.classList.remove("hidden");
  paginationInfo.textContent = `Zobrazeno ${startIdx + 1}–${endIdx} z ${totalCount} záznamů`;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;

  pageNumbers.innerHTML = "";

  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7) {
      if (p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
        if (p === 2 || p === totalPages - 1) {
          const dots = document.createElement("span");
          dots.className = "page-btn";
          dots.textContent = "…";
          dots.style.pointerEvents = "none";
          pageNumbers.appendChild(dots);
        }
        continue;
      }
    }

    const btn = document.createElement("button");
    btn.className = `page-btn ${p === currentPage ? "active" : ""}`;
    btn.textContent = p;
    btn.addEventListener("click", () => {
      currentPage = p;
      renderGrid();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    pageNumbers.appendChild(btn);
  }
}

// ==========================================================================
// Logika pro TMDB API Import a vyhledávání
// ==========================================================================

function getCleanTmdbKey() {
  let key = (tmdbApiKeyInput?.value || localStorage.getItem("tracker_tmdb_api_key") || "").trim();
  key = key.replace(/^["']|["']$/g, "").trim();
  if (key.toLowerCase().startsWith("bearer ")) {
    key = key.substring(7).trim();
  }
  return key;
}

function getCleanRawgKey() {
  let key = (rawgApiKeyInput?.value || localStorage.getItem("tracker_rawg_api_key") || "").trim();
  return key.replace(/^["']|["']$/g, "").trim();
}

function openTmdbModal(defaultProvider = null) {
  const savedKey = localStorage.getItem("tracker_tmdb_api_key") || "";
  if (tmdbApiKeyInput) tmdbApiKeyInput.value = savedKey;
  updateTmdbKeyBadge();

  const savedRawgKey = localStorage.getItem("tracker_rawg_api_key") || "";
  if (rawgApiKeyInput) rawgApiKeyInput.value = savedRawgKey;
  updateRawgKeyBadge();

  // Pokud je v editaci či formuláři zvolena Hra, nebo je explicitně vyžádáno rawg
  const currentFormType = document.querySelector('input[name="itemType"]:checked')?.value;
  const preferRawg = defaultProvider === "rawg" || (!defaultProvider && currentFormType === "Hra");

  if (preferRawg && apiSwitchRawg && rawgSectionWrapper) {
    apiSwitchRawg.classList.add("active");
    apiSwitchTmdb?.classList.remove("active");
    rawgSectionWrapper.classList.remove("hidden");
    tmdbSectionWrapper?.classList.add("hidden");
    const titleEl = document.getElementById("apiModalHeaderTitle");
    if (titleEl) titleEl.textContent = "Přidat pomocí online API (RAWG.io)";
    setTimeout(() => {
      if (savedRawgKey) rawgQueryInput?.focus();
      else rawgApiKeyInput?.focus();
    }, 60);
  } else {
    apiSwitchTmdb?.classList.add("active");
    apiSwitchRawg?.classList.remove("active");
    tmdbSectionWrapper?.classList.remove("hidden");
    rawgSectionWrapper?.classList.add("hidden");
    const titleEl = document.getElementById("apiModalHeaderTitle");
    if (titleEl) titleEl.textContent = "Přidat pomocí online API (TMDB)";
    setTimeout(() => {
      if (savedKey) tmdbQueryInput?.focus();
      else tmdbApiKeyInput?.focus();
    }, 60);
  }

  tmdbModal.classList.remove("hidden");
  updateModalBodyLock();
}

function closeTmdbModal() {
  tmdbModal.classList.add("hidden");
  updateModalBodyLock();
}

function updateTmdbKeyBadge() {
  if (!tmdbKeyBadge) return;
  const key = getCleanTmdbKey();
  if (key) {
    tmdbKeyBadge.textContent = "✓ Klíč uložen";
    tmdbKeyBadge.className = "tmdb-key-badge badge-saved";
  } else {
    tmdbKeyBadge.textContent = "Klíč nezadán";
    tmdbKeyBadge.className = "tmdb-key-badge badge-missing";
  }
}

async function executeTmdbSearch() {
  const key = getCleanTmdbKey();
  if (!key) {
    showToast("Nejprve prosím vložte váš TMDB API klíč.");
    tmdbApiKeyInput?.focus();
    return;
  }

  // Automaticky klíč uložíme do úložiště a zosynchronizujeme
  localStorage.setItem("tracker_tmdb_api_key", key);
  if (tmdbApiKeyInput) tmdbApiKeyInput.value = key;
  if (settingsTmdbApiKey) settingsTmdbApiKey.value = key;
  updateTmdbKeyBadge();

  const query = tmdbQueryInput ? tmdbQueryInput.value.trim() : "";
  if (!query) {
    showToast("Zadejte název díla pro vyhledání.");
    tmdbQueryInput?.focus();
    return;
  }

  const selectedType = document.querySelector('input[name="tmdbSearchType"]:checked')?.value || "multi";

  tmdbResultsArea.innerHTML = `
    <div class="tmdb-spinner-wrap">
      <div class="tmdb-spinner"></div>
      <p style="font-size: 13.5px; color: var(--text-muted); font-weight: 500;">Vyhledávám "${escapeHtml(query)}" v TMDB databázi...</p>
    </div>
  `;

  try {
    let endpoint = "";
    if (selectedType === "movie") {
      endpoint = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=cs-CZ&include_adult=false`;
    } else if (selectedType === "tv") {
      endpoint = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=cs-CZ&include_adult=false`;
    } else {
      endpoint = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=cs-CZ&include_adult=false`;
    }

    const isJwt = key.startsWith("eyJ");
    const headers = isJwt
      ? { Authorization: `Bearer ${key}`, Accept: "application/json" }
      : { Accept: "application/json" };

    if (!isJwt) {
      endpoint += `&api_key=${encodeURIComponent(key)}`;
    }

    const res = await fetch(endpoint, { headers });

    if (res.status === 401) {
      tmdbResultsArea.innerHTML = `
        <div class="tmdb-alert-card tmdb-alert-error">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong>Neplatný TMDB API klíč (Chyba 401)</strong>
            <p style="margin-top: 4px;">Zadaný klíč nebyl serverem TMDB ověřen. Zkontrolujte prosím svůj klíč na themoviedb.org v Nastavení -> API.</p>
          </div>
        </div>
      `;
      return;
    }

    if (!res.ok) {
      throw new Error(`Chyba serveru TMDB: HTTP ${res.status}`);
    }

    const data = await res.json();
    const results = (data.results || []).filter((item) => {
      if (selectedType === "movie") return true;
      if (selectedType === "tv") return true;
      return item.media_type === "movie" || item.media_type === "tv";
    });

    if (results.length === 0) {
      tmdbResultsArea.innerHTML = `
        <div class="tmdb-placeholder-state">
          <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p class="tmdb-placeholder-title">Nebyly nalezeny žádné výsledky</p>
          <p class="tmdb-placeholder-sub">Pro dotaz "${escapeHtml(query)}" nebyly nalezeny žádné tituly. Zkuste jiný výraz nebo přepnout filtr typu.</p>
        </div>
      `;
      return;
    }

    renderTmdbResults(results);
  } catch (err) {
    console.error("Chyba vyhledávání TMDB:", err);
    tmdbResultsArea.innerHTML = `
      <div class="tmdb-alert-card tmdb-alert-error">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div>
          <strong>Chyba při komunikaci s TMDB</strong>
          <p style="margin-top: 4px;">${escapeHtml(err.message || String(err))}</p>
        </div>
      </div>
    `;
  }
}

function renderTmdbResults(results) {
  let html = `<div class="tmdb-results-count">Nalezeno celkem <strong>${results.length}</strong> výsledků:</div>`;

  results.forEach((item) => {
    const isTv = item.media_type === "tv" || (!item.title && !!item.name);
    const title = item.title || item.name || "Bez názvu";
    const originalTitle = item.original_title || item.original_name || "";
    const releaseDate = item.release_date || item.first_air_date || "";
    const year = releaseDate ? releaseDate.substring(0, 4) : "—";
    const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null;
    const overview = item.overview ? item.overview : "Popis není v češtině k dispozici.";

    const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : null;
    const posterHtml = posterUrl
      ? `<img class="tmdb-result-poster" src="${posterUrl}" alt="${escapeHtml(title)}" draggable="false">`
      : `<div class="tmdb-result-poster-placeholder">${SVG_ICONS.eyeOff}</div>`;

    const subTitleHtml = originalTitle && originalTitle !== title
      ? `<div class="tmdb-result-sub" title="Původní název: ${escapeHtml(originalTitle)}">Pův.: ${escapeHtml(originalTitle)}</div>`
      : "";

    html += `
      <div class="tmdb-result-card" data-tmdb-id="${item.id}" data-media-type="${isTv ? "tv" : "movie"}">
        ${posterHtml}
        <div class="tmdb-result-info">
          <div class="tmdb-result-top">
            <div class="tmdb-result-badges">
              <span class="tmdb-pill-badge ${isTv ? "tmdb-pill-tv" : ""}">${isTv ? "Seriál" : "Film"}</span>
              <span class="tmdb-result-year">${year}</span>
            </div>
            ${rating !== null ? `<div class="tmdb-result-score">${SVG_ICONS.star} ${rating}</div>` : ""}
          </div>
          <div class="tmdb-result-title">${escapeHtml(title)}</div>
          ${subTitleHtml}
          <div class="tmdb-result-overview">${escapeHtml(overview)}</div>
          <div class="tmdb-result-actions">
            <button type="button" class="btn btn-primary tmdb-select-btn">
              <span>Vybrat a předvyplnit</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  tmdbResultsArea.innerHTML = html;

  const cards = tmdbResultsArea.querySelectorAll(".tmdb-result-card");
  cards.forEach((card) => {
    const id = parseInt(card.dataset.tmdbId, 10);
    const mediaType = card.dataset.mediaType;
    const rawItem = results.find((r) => r.id === id);

    const btn = card.querySelector(".tmdb-select-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      importTmdbItemDetails(rawItem || { id, mediaType }, btn);
    });

    card.addEventListener("click", () => {
      importTmdbItemDetails(rawItem || { id, mediaType }, btn);
    });
  });
}

async function importTmdbItemDetails(item, btn) {
  const originalBtnText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="tmdb-spinner-small"></span> Načítám...`;
  }

  const key = getCleanTmdbKey();
  const isTv = item.media_type === "tv" || (!item.title && !!item.name);
  const mediaType = isTv ? "tv" : "movie";

  try {
    let detailsUrl = `https://api.themoviedb.org/3/${mediaType}/${item.id}?append_to_response=credits,videos,external_ids&language=cs-CZ`;
    const isJwt = key.startsWith("eyJ");
    const headers = isJwt
      ? { Authorization: `Bearer ${key}`, Accept: "application/json" }
      : { Accept: "application/json" };

    if (!isJwt) {
      detailsUrl += `&api_key=${encodeURIComponent(key)}`;
    }

    const res = await fetch(detailsUrl, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} při načítání podrobností`);

    const data = await res.json();

    // Fallback popisu v angličtině, pokud je český prázdný
    let overview = (data.overview || item.overview || "").trim();
    if (!overview) {
      try {
        let enUrl = `https://api.themoviedb.org/3/${mediaType}/${item.id}?language=en-US`;
        if (!isJwt) enUrl += `&api_key=${encodeURIComponent(key)}`;
        const enRes = await fetch(enUrl, { headers });
        if (enRes.ok) {
          const enData = await enRes.json();
          if (enData.overview) overview = enData.overview.trim();
        }
      } catch (e) {
        console.warn("Anglický fallback popisu selhal:", e);
      }
    }

    // Vyhledání YouTube traileru (v CZ nebo v EN)
    let trailerUrl = "";
    const czVideos = data.videos?.results || [];
    let trailer = czVideos.find((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));

    if (!trailer) {
      try {
        let enVidUrl = `https://api.themoviedb.org/3/${mediaType}/${item.id}/videos?language=en-US`;
        if (!isJwt) enVidUrl += `&api_key=${encodeURIComponent(key)}`;
        const enVidRes = await fetch(enVidUrl, { headers });
        if (enVidRes.ok) {
          const enVidData = await enVidRes.json();
          const enVideos = enVidData.results || [];
          trailer = enVideos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
                    enVideos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
                    enVideos.find((v) => v.site === "YouTube");
        }
      } catch (vidErr) {
        console.warn("Chyba při načítání traileru z TMDB:", vidErr);
      }
    }

    if (trailer && trailer.key) {
      trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    }

    // IMDb ID a TMDB ID do custom_metadata
    const imdbId = data.external_ids?.imdb_id || data.imdb_id || "";
    const customMetadata = {
      "TMDB ID": String(item.id),
    };
    if (imdbId) {
      customMetadata["IMDb ID"] = imdbId;
    }

    const title = data.title || data.name || item.title || item.name || "";
    const releaseDate = data.release_date || data.first_air_date || item.release_date || item.first_air_date || "";
    const releaseYear = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : null;
    const genres = (data.genres || []).map((g) => g.name).join(", ");
    const ratingVal = data.vote_average ? Math.round(data.vote_average * 10) / 10 : 8;

    let director = "";
    let writer = "";
    let castMembers = "";
    let production = "";
    let duration = "";
    let seasonEpisodes = "";

    if (data.credits) {
      if (Array.isArray(data.credits.crew)) {
        const dirObj = data.credits.crew.find((c) => c.job === "Director");
        if (dirObj) director = dirObj.name;

        const writers = data.credits.crew
          .filter((c) => ["Screenplay", "Writer", "Author", "Story"].includes(c.job))
          .map((c) => c.name);
        if (writers.length > 0) {
          writer = [...new Set(writers)].slice(0, 3).join(", ");
        }
      }
      if (Array.isArray(data.credits.cast)) {
        castMembers = data.credits.cast.slice(0, 6).map((c) => c.name).join(", ");
      }
    }

    if (isTv) {
      if (!director && data.created_by && data.created_by.length > 0) {
        director = data.created_by.map((c) => c.name).join(", ");
      }
      if (data.networks && data.networks.length > 0) {
        production = data.networks.map((n) => n.name).slice(0, 3).join(", ");
      } else if (data.production_companies && data.production_companies.length > 0) {
        production = data.production_companies.map((p) => p.name).slice(0, 3).join(", ");
      }

      const seasons = data.number_of_seasons || 1;
      const episodes = data.number_of_episodes || "";
      const seasonWord = seasons === 1 ? "série" : seasons < 5 ? "série" : "sérií";
      seasonEpisodes = `${seasons} ${seasonWord}${episodes ? ` (${episodes} epizod)` : ""}`;

      if (data.episode_run_time && data.episode_run_time.length > 0) {
        duration = `${data.episode_run_time[0]} min / epizoda`;
      }
    } else {
      if (data.production_companies && data.production_companies.length > 0) {
        production = data.production_companies.map((p) => p.name).slice(0, 3).join(", ");
      }
      if (data.runtime) {
        duration = `${data.runtime} min`;
      }
    }

    let noteLines = [];
    const orig = data.original_title || data.original_name;
    if (orig && orig !== title) {
      noteLines.push(`Původní název: ${orig}`);
    }
    if (data.tagline) {
      noteLines.push(`Motto: "${data.tagline}"`);
    }
    const note = noteLines.join("\n");

    // Stáhnout obrázek (plakát)
    let savedImagePath = null;
    let base64ImageData = null;
    const posterPath = data.poster_path || item.poster_path;

    if (posterPath) {
      if (btn) btn.innerHTML = `<span class="tmdb-spinner-small"></span> Stahuji obálku...`;
      const fullPosterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
      try {
        const res = await tauriInvoke("download_and_save_image", { url: fullPosterUrl });
        if (res && res.image_path) {
          savedImagePath = res.image_path;
          base64ImageData = res.base64_data;
        }
      } catch (rustErr) {
        console.warn("Stažení plakátu přes Rust selhalo, zkouším přímý fetch:", rustErr);
        try {
          const imgRes = await fetch(fullPosterUrl);
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            base64ImageData = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            savedImagePath = await tauriInvoke("save_image_from_base64", {
              base64Data: base64ImageData,
              ext: "jpg",
            });
          }
        } catch (fetchErr) {
          console.warn("Stažení plakátu přes fetch selhalo:", fetchErr);
        }
      }

      if (!base64ImageData && fullPosterUrl) {
        base64ImageData = fullPosterUrl;
        savedImagePath = fullPosterUrl;
      }
    }

    closeTmdbModal();

    openFormModal(null, {
      itemType: isTv ? "Seriál" : "Film",
      title: title,
      releaseYear: releaseYear,
      genre: genres,
      tags: genres,
      description: overview,
      director: director,
      writer: writer,
      production: production,
      duration: duration,
      seasonEpisodes: seasonEpisodes,
      castMembers: castMembers,
      rating: ratingVal,
      apiRating: ratingVal,
      note: note,
      trailerUrl: trailerUrl,
      customMetadata: customMetadata,
      imagePath: savedImagePath,
      imageData: base64ImageData,
    });

    showToast(`Údaje pro "${title}" byly úspěšně předvyplněny z TMDB!`);
  } catch (err) {
    console.error("Chyba při importu detailů z TMDB:", err);
    showToast("Nepodařilo se načíst podrobnosti: " + (err.message || String(err)));
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnText;
    }
  }
}

// ==========================================================================
// Logika pro RAWG.io Herní API (Videohry)
// ==========================================================================

function updateRawgKeyBadge() {
  if (!rawgKeyBadge) return;
  const key = getCleanRawgKey();
  if (key) {
    rawgKeyBadge.textContent = "✓ Klíč uložen";
    rawgKeyBadge.className = "tmdb-key-badge badge-saved";
  } else {
    rawgKeyBadge.textContent = "Klíč nezadán";
    rawgKeyBadge.className = "tmdb-key-badge badge-missing";
  }
}

async function executeRawgSearch() {
  const key = getCleanRawgKey();
  if (!key) {
    showToast("Nejprve prosím vložte váš RAWG API klíč.");
    rawgApiKeyInput?.focus();
    return;
  }

  localStorage.setItem("tracker_rawg_api_key", key);
  if (rawgApiKeyInput) rawgApiKeyInput.value = key;
  if (settingsRawgApiKey) settingsRawgApiKey.value = key;
  updateRawgKeyBadge();

  const query = rawgQueryInput ? rawgQueryInput.value.trim() : "";
  if (!query) {
    showToast("Zadejte název hry pro vyhledání.");
    rawgQueryInput?.focus();
    return;
  }

  rawgResultsArea.innerHTML = `
    <div class="tmdb-spinner-wrap">
      <div class="tmdb-spinner"></div>
      <p style="font-size: 13.5px; color: var(--text-muted); font-weight: 500;">Vyhledávám "${escapeHtml(query)}" v databázi RAWG.io...</p>
    </div>
  `;

  try {
    const endpoint = `https://api.rawg.io/api/games?key=${encodeURIComponent(key)}&search=${encodeURIComponent(query)}&search_precise=true&page_size=15`;
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });

    if (res.status === 401 || res.status === 403) {
      rawgResultsArea.innerHTML = `
        <div class="tmdb-alert-card tmdb-alert-error">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
            <strong>Neplatný RAWG API klíč (Chyba ${res.status})</strong>
            <p style="margin-top: 4px;">Zkontrolujte prosím svůj klíč z účtu na rawg.io/apidocs.</p>
          </div>
        </div>
      `;
      return;
    }

    if (!res.ok) {
      throw new Error(`Chyba RAWG serveru: HTTP ${res.status}`);
    }

    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) {
      rawgResultsArea.innerHTML = `
        <div class="tmdb-placeholder-state">
          <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p class="tmdb-placeholder-title">Nebyly nalezeny žádné hry</p>
          <p class="tmdb-placeholder-sub">Pro dotaz "${escapeHtml(query)}" nebyly nalezeny žádné tituly. Zkuste upřesnit název hry.</p>
        </div>
      `;
      return;
    }

    renderRawgResults(results);
  } catch (err) {
    console.error("Chyba vyhledávání RAWG:", err);
    rawgResultsArea.innerHTML = `
      <div class="tmdb-alert-card tmdb-alert-error">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div>
          <strong>Chyba při komunikaci s RAWG.io</strong>
          <p style="margin-top: 4px;">${escapeHtml(err.message || String(err))}</p>
        </div>
      </div>
    `;
  }
}

function renderRawgResults(results) {
  let html = `<div class="tmdb-results-count">Nalezeno celkem <strong>${results.length}</strong> her:</div>`;

  results.forEach((game) => {
    const title = game.name || "Bez názvu";
    const year = game.released ? game.released.substring(0, 4) : "—";
    const rating10 = game.rating ? Math.round(game.rating * 2 * 10) / 10 : null;
    const metaScore = game.metacritic || null;

    const posterUrl = game.background_image || null;
    const posterHtml = posterUrl
      ? `<img class="tmdb-result-poster" src="${posterUrl}" alt="${escapeHtml(title)}" draggable="false">`
      : `<div class="tmdb-result-poster-placeholder">${SVG_ICONS.eyeOff}</div>`;

    const platforms = (game.platforms || [])
      .map((p) => p.platform?.name)
      .filter(Boolean)
      .slice(0, 4);

    const platformPills = platforms
      .map((p) => `<span class="platform-pill">${escapeHtml(p)}</span>`)
      .join(" ");

    const genres = (game.genres || []).map((g) => g.name).slice(0, 3).join(", ");

    html += `
      <div class="tmdb-result-card" data-rawg-id="${game.id}">
        ${posterHtml}
        <div class="tmdb-result-info">
          <div class="tmdb-result-top">
            <div class="tmdb-result-badges">
              <span class="tmdb-pill-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">Hra</span>
              <span class="tmdb-result-year">${year}</span>
              ${metaScore ? `<span class="platform-pill" style="background: rgba(59, 130, 246, 0.18); color: #60a5fa;" title="Metacritic skóre">MC: ${metaScore}</span>` : ""}
            </div>
            ${rating10 !== null ? `<div class="tmdb-result-score">${SVG_ICONS.star} ${rating10}</div>` : ""}
          </div>
          <div class="tmdb-result-title">${escapeHtml(title)}</div>
          <div class="rawg-platforms-list" style="margin-bottom: 6px;">
            ${platformPills}
          </div>
          <div class="tmdb-result-overview">${genres ? `Žánry: ${escapeHtml(genres)}` : "Žánry neuvedeny."}</div>
          <div class="tmdb-result-actions">
            <button type="button" class="btn btn-primary rawg-select-btn">
              <span>Vybrat a předvyplnit</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  rawgResultsArea.innerHTML = html;

  const cards = rawgResultsArea.querySelectorAll(".tmdb-result-card");
  cards.forEach((card) => {
    const id = parseInt(card.dataset.rawgId, 10);
    const rawGame = results.find((r) => r.id === id);
    const btn = card.querySelector(".rawg-select-btn");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      importRawgGameDetails(rawGame || { id }, btn);
    });

    card.addEventListener("click", () => {
      importRawgGameDetails(rawGame || { id }, btn);
    });
  });
}

async function importRawgGameDetails(gameSummary, btn) {
  const originalBtnText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="tmdb-spinner-small"></span> Načítám...`;
  }

  const key = getCleanRawgKey();

  try {
    const detailsUrl = `https://api.rawg.io/api/games/${gameSummary.id}?key=${encodeURIComponent(key)}`;
    const res = await fetch(detailsUrl, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} při načítání podrobností hry`);

    const data = await res.json();

    const title = data.name || gameSummary.name || "";
    const releaseDate = data.released || gameSummary.released || "";
    const releaseYear = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : null;
    const genres = (data.genres || []).map((g) => g.name).join(", ");
    const tags = (data.tags || []).slice(0, 6).map((t) => t.name).join(", ");
    const description = (data.description_raw || data.description || "").replace(/<[^>]+>/g, "").trim();

    const developer = (data.developers || []).map((d) => d.name).join(", ");
    const publisher = (data.publishers || []).map((p) => p.name).join(", ");
    const platforms = (data.platforms || []).map((p) => p.platform?.name).filter(Boolean).join(", ");
    
    // Škála RAWG hodnocení je 0-5 -> převedeme na 0-10
    const ratingVal = data.rating ? Math.round(data.rating * 2 * 10) / 10 : 8;
    const apiRatingVal = data.metacritic ? Math.round(data.metacritic / 10 * 10) / 10 : ratingVal;

    // Hledání traileru / gameplay ukázky v RAWG movies
    let trailerUrl = "";
    try {
      const moviesUrl = `https://api.rawg.io/api/games/${gameSummary.id}/movies?key=${encodeURIComponent(key)}`;
      const mRes = await fetch(moviesUrl, { headers: { Accept: "application/json" } });
      if (mRes.ok) {
        const mData = await mRes.json();
        const movies = mData.results || [];
        if (movies.length > 0) {
          trailerUrl = movies[0].data?.max || movies[0].data?.[480] || "";
        }
      }
    } catch (mErr) {
      console.warn("Chyba při načítání traileru hry z RAWG:", mErr);
    }

    if (!trailerUrl && data.clip?.clip) {
      trailerUrl = data.clip.clip;
    }

    // Poznámka
    let noteLines = [];
    if (data.website) {
      noteLines.push(`Oficiální web: ${data.website}`);
    }
    if (data.metacritic) {
      noteLines.push(`Metacritic: ${data.metacritic} / 100`);
    }
    if (data.playtime) {
      noteLines.push(`Průměrný herní čas: ~${data.playtime} hodin`);
    }
    const note = noteLines.join("\n");

    const customMetadata = {
      "RAWG ID": String(data.id),
    };
    if (data.slug) {
      customMetadata["RAWG Slug"] = data.slug;
    }
    if (data.reddit_url) {
      customMetadata["Reddit"] = data.reddit_url;
    }

    // Stáhnout obrázek (obálku/screenshot)
    let savedImagePath = null;
    let base64ImageData = null;
    const imageUrl = data.background_image || gameSummary.background_image;

    if (imageUrl) {
      if (btn) btn.innerHTML = `<span class="tmdb-spinner-small"></span> Stahuji obal...`;
      try {
        // 1. Primární spolehlivá metoda přes Rust backend (obejde CORS, Cloudflare i 307 přesměrování)
        const res = await tauriInvoke("download_and_save_image", { url: imageUrl });
        if (res && res.image_path) {
          savedImagePath = res.image_path;
          base64ImageData = res.base64_data;
        }
      } catch (rustErr) {
        console.warn("Stažení obalu přes Rust selhalo, zkouším přímý fetch:", rustErr);
        // 2. Sekundární fallback přes fetch
        try {
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            base64ImageData = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            savedImagePath = await tauriInvoke("save_image_from_base64", {
              base64Data: base64ImageData,
              ext: "jpg",
            });
          }
        } catch (fetchErr) {
          console.warn("Stažení obalu přes fetch selhalo:", fetchErr);
        }
      }

      // 3. Bezpečnostní pojistka: pokud by soubor z disku nešel stáhnout, použijeme online URL pro náhled v dialogu
      if (!base64ImageData && imageUrl) {
        base64ImageData = imageUrl;
        savedImagePath = imageUrl;
      }
    }

    closeTmdbModal();

    openFormModal(null, {
      itemType: "Hra",
      title: title,
      releaseYear: releaseYear,
      genre: genres,
      tags: tags,
      description: description,
      developer: developer,
      publisher: publisher,
      platforms: platforms,
      rating: ratingVal,
      apiRating: apiRatingVal,
      note: note,
      trailerUrl: trailerUrl,
      customMetadata: customMetadata,
      imagePath: savedImagePath,
      imageData: base64ImageData,
    });

    showToast(`Údaje pro hru "${title}" byly úspěšně předvyplněny z RAWG!`);
  } catch (err) {
    console.error("Chyba při importu detailů z RAWG:", err);
    showToast("Nepodařilo se načíst podrobnosti hry: " + (err.message || String(err)));
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnText;
    }
  }
}

// ==========================================================================
// Pomocné funkce
// ==========================================================================

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.remove("hidden");

  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
