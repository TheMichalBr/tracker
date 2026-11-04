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

  // Pokud selhalo načtení plakátu v modálu detailu, deaktivujeme ambientní vrstvu
  if (img.closest("#detailPosterWrap")) {
    const detailModalCard = document.querySelector(".modal-card.modal-detail");
    const detailAmbientLayer = document.getElementById("detailAmbientLayer");
    const detailAmbientImg = document.getElementById("detailAmbientImg");
    if (detailModalCard) detailModalCard.classList.remove("has-ambient");
    if (detailAmbientLayer) detailAmbientLayer.classList.add("hidden");
    if (detailAmbientImg) detailAmbientImg.removeAttribute("src");
  }

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

/**
 * Zpracuje a zoptimalizuje jakýkoliv obrázek (z lokálního disku, API nebo Base64):
 * 1. Vyřízne střed (center-crop) na filmový/herní poměr stran 2:3.
 *    - Pokud je obrázek široký (16:9, 2K/4K tapety z her), vyřízne středový výřez a ořízne boky.
 *    - Pokud je příliš vysoký, vyřízne střed a ořízne vršek a spodek.
 * 2. Zmenší rozlišení na optimální zlatý střed 500 × 750 px s vysoce kvalitním vyhlazením.
 * 3. Zkomprimuje a převede do moderního formátu WebP (kvalita 0.88, velikost cca 40–60 kB).
 * 4. Uloží přes Tauri do dočasné složky jako .webp a vrátí cestu i dataUrl.
 */
function processAndOptimizeImageToWebP(imageSourceUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        const origW = img.naturalWidth;
        const origH = img.naturalHeight;

        if (!origW || !origH) {
          throw new Error("Neplatné rozměry obrázku.");
        }

        // Cílový poměr stran 2:3 (standardní plakát)
        const targetRatio = 2 / 3;
        const currentRatio = origW / origH;

        let cropX = 0;
        let cropY = 0;
        let cropW = origW;
        let cropH = origH;

        if (currentRatio > targetRatio) {
          // Obrázek je širší (např. 16:9, 2K nebo 4K tapeta ze hry) -> ořízneme boky a vezmeme přesný střed
          cropW = Math.round(origH * targetRatio);
          cropX = Math.round((origW - cropW) / 2);
        } else if (currentRatio < targetRatio) {
          // Obrázek je vyšší než 2:3 -> ořízneme vršek a spodek a vezmeme střed
          cropH = Math.round(origW / targetRatio);
          cropY = Math.round((origH - cropH) / 2);
        }

        // Cílové rozlišení: zlatý střed 500 × 750 px
        // Pokud je původní obrázek menší, nezvětšujeme ho uměle (aby neztratil ostrost)
        const finalW = Math.min(500, cropW);
        const finalH = Math.round(finalW / targetRatio);

        const canvas = document.createElement("canvas");
        canvas.width = finalW;
        canvas.height = finalH;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Vykreslíme oříznutý střed zmenšený do 500x750
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, finalW, finalH);

        // Získání uživatelsky nastavené kvality z Nastavení (výchozí 88 %)
        const qualityPercent = parseInt(localStorage.getItem("tracker_webp_quality") || "88", 10);
        const webpQuality = Math.max(0.6, Math.min(1.0, (isNaN(qualityPercent) ? 88 : qualityPercent) / 100));

        // Export do WebP (dle uživatelského nastavení)
        const webpDataUrl = canvas.toDataURL("image/webp", webpQuality);

        const savedPath = await tauriInvoke("save_image_from_base64", {
          base64Data: webpDataUrl,
          ext: "webp",
        });

        resolve({
          filePath: savedPath,
          dataUrl: webpDataUrl,
        });
      } catch (err) {
        console.error("Chyba při zpracování obrázku do WebP:", err);
        reject(err);
      }
    };

    img.onerror = (err) => {
      console.error("Nepodařilo se načíst obrázek pro optimalizaci:", err);
      reject(err);
    };

    img.src = imageSourceUrl;
  });
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

// Verze aplikace a repozitář pro aktualizace
let APP_VERSION = "1.1.2";
const GITHUB_REPO_API = "https://api.github.com/repos/TheMichalBr/tracker/releases/latest";
let latestReleaseData = null;
let isCheckingUpdate = false;

// Globální stav
let allItems = [];
let activeFilter = "all";
let searchQuery = "";
let searchDebounceTimer = null;
let currentSort = "newest";

// Bezpečná filtrace a omezení vyhledávacího pole (max. 50 znaků, odstranění potenciálně zneužitelných speciálních znaků)
function sanitizeSearchQuery(inputStr) {
  if (!inputStr || typeof inputStr !== "string") return "";
  let str = inputStr.slice(0, 50);
  return str.replace(/[<>\\`{}[\]^~$|;="\x00-\x1F\x7F]/g, "");
}

// Bezpečná filtrace pro API klíče (max. 60 znaků, povoleno pouze bezpečné alfanumerické znaky a token separátory, bez mezer a injekcí)
function sanitizeApiKey(inputStr) {
  if (!inputStr || typeof inputStr !== "string") return "";
  let str = inputStr.trim().replace(/^["']|["']$/g, "").trim();
  if (str.toLowerCase().startsWith("bearer ")) {
    str = str.substring(7).trim();
  }
  str = str.slice(0, 60);
  return str.replace(/[^a-zA-Z0-9_\-\.]/g, "");
}

// Bezpečná filtrace pro vyhledávací pole v API formulářích (max. 50 znaků, ochrana proti injektáži a zneužití speciálních znaků)
function sanitizeApiQuery(inputStr) {
  if (!inputStr || typeof inputStr !== "string") return "";
  let str = inputStr.slice(0, 50);
  return str.replace(/[<>\\`{}[\]^~$|;="\x00-\x1F\x7F]/g, "");
}

// Bezpečná filtrace textových polí formuláře (odstranění řídicích znaků, nebezpečných tagů <> a omezení délky)
function sanitizeFormFieldText(inputStr, maxLen = 60, allowMultiline = false) {
  if (!inputStr || typeof inputStr !== "string") return "";
  let str = inputStr.slice(0, maxLen);
  if (allowMultiline) {
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").replace(/[<>]/g, "");
  }
  return str.replace(/[\x00-\x1F\x7F]/g, "").replace(/[<>]/g, "");
}

// Bezpečná filtrace roku vydání (max. 4 číslice, limit 0 až 5000)
function sanitizeYearInput(inputStr) {
  if (!inputStr && inputStr !== 0) return "";
  let str = String(inputStr).replace(/\D/g, "").slice(0, 4);
  if (!str) return "";
  let num = parseInt(str, 10);
  if (num > 5000) {
    str = "5000";
  }
  return str;
}

// Bezpečná filtrace veřejného / API hodnocení (0 až 100, celá čísla i desetiny s tečkou i čárkou)
function sanitizeApiRatingInput(inputStr) {
  if (!inputStr && inputStr !== 0) return "";
  let str = String(inputStr).trim().slice(0, 6);
  // Povolíme pouze číslice, tečku a čárku
  str = str.replace(/[^0-9.,]/g, "");
  let separatorFound = false;
  let clean = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "." || ch === ",") {
      if (!separatorFound && clean.length > 0) {
        clean += ch;
        separatorFound = true;
      }
    } else {
      clean += ch;
    }
  }
  const numCheck = parseFloat(clean.replace(",", "."));
  if (!isNaN(numCheck) && numCheck > 100) {
    return "100";
  }
  return clean;
}

// Bezpečná filtrace odkazu na trailer (max. 300 znaků, odstranění mezer, uvozovek a řídicích znaků)
function sanitizeTrailerUrl(inputStr) {
  if (!inputStr || typeof inputStr !== "string") return "";
  let str = inputStr.trim().slice(0, 300);
  return str.replace(/[<>"'`\s\x00-\x1F\x7F]/g, "");
}
let currentStatusFilter = "all"; // 'all', 'backlog', 'in_progress', 'completed', 'dropped'
let currentTrailerUrl = "";

// Nastavení rozvržení a stránkování (při spuštění se vždy použije výchozí nastavení ze Settings)
let currentView = localStorage.getItem("tracker_default_view_mode") || "grid"; // 'grid', 'compact', 'list'
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
    const val = parseFloat(itemRating.value || 1);
    const progress = active ? 0 : Math.min(100, Math.max(0, (val / 10) * 100));
    itemRating.style.setProperty("--rating-progress", `${progress}%`);
  }
  if (itemRatingInput) {
    itemRatingInput.disabled = active;
    if (active) {
      if (itemRatingInput.value !== "—") {
        itemRatingInput.dataset.savedVal = itemRatingInput.value;
      }
      itemRatingInput.value = "—";
    } else {
      if (itemRatingInput.value === "—") {
        const restored = itemRatingInput.dataset.savedVal || itemRating?.value || "1";
        itemRatingInput.value = restored;
        const num = parseFloat(restored);
        if (!isNaN(num) && itemRating) itemRating.value = num;
      }
      itemRatingInput.dataset.savedVal = itemRatingInput.value;
      updateRatingInputWidth();
    }
  }
}

// Pomocná funkce pro aktualizaci grafické dráhy posuvníku hodnocení
function updateRatingInputWidth() {
  if (itemRating) {
    const val = parseFloat(itemRating.value);
    const progress = !isNaN(val) && !isNoRatingActive ? Math.min(100, Math.max(0, (val / 10) * 100)) : 0;
    itemRating.style.setProperty("--rating-progress", `${progress}%`);
  }
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
const detailBody = detailModal ? detailModal.querySelector(".detail-body") : null;
const itemDetailScrollPositions = new Map();
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
const detailInfoWrap = document.getElementById("detailInfoWrap");
const detailInfoGrid = document.getElementById("detailInfoGrid");
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
const settingsAppLang = document.getElementById("settingsAppLang");
const settingsDefaultView = document.getElementById("settingsDefaultView");
const settingsItemsPerPage = document.getElementById("settingsItemsPerPage");
const settingsItemCount = document.getElementById("settingsItemCount");
const settingsTempCount = document.getElementById("settingsTempCount");
const openDataFolderBtn = document.getElementById("openDataFolderBtn");
const clearTempBtn = document.getElementById("clearTempBtn");
const optimizeCoversBtn = document.getElementById("optimizeCoversBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const reportBugBtn = document.getElementById("reportBugBtn");
const settingsWebpQuality = document.getElementById("settingsWebpQuality");
const settingsWebpQualityVal = document.getElementById("settingsWebpQualityVal");
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

  // Synchronizace aktuální verze aplikace z Cargo.toml
  syncAppVersion();

  // Aplikace jazyka na celou aplikaci
  if (window.i18n) {
    window.i18n.applyTranslations();
  }

  // Okamžitá reakce na změnu jazyka
  window.addEventListener("tracker:languageChanged", () => {
    if (window.i18n) {
      window.i18n.applyTranslations();
      updateDropdownLabels();
      renderGrid();
      if (currentItemDetail && detailModal && !detailModal.classList.contains("hidden")) {
        openDetailModal(currentItemDetail);
      }
      if (settingsModal && !settingsModal.classList.contains("hidden")) {
        const curLang = window.i18n.getLanguage();
        updateSettingsDropdownUI(
          settingsDefaultView?.value || "grid",
          settingsItemsPerPage?.value || "24",
          curLang
        );
        refreshSettingsStorageInfo();
        const badgeStatus = document.getElementById("updateBadgeStatus");
        if (badgeStatus && !badgeStatus.classList.contains("hidden")) {
          const isEn = curLang === "en";
          if (badgeStatus.classList.contains("up-to-date")) {
            badgeStatus.textContent = isEn ? "✓ Latest" : "✓ Aktuální";
            const statusText = document.getElementById("updateStatusText");
            if (statusText) {
              statusText.textContent = window.i18n.t("settings.upToDateStatus", { version: `v${APP_VERSION}` });
            }
          } else if (badgeStatus.classList.contains("error")) {
            badgeStatus.textContent = isEn ? "Offline" : "Chyba";
          }
        }
        const changelogEmpty = document.querySelector("#updateChangelogList .settings-changelog-empty");
        if (changelogEmpty) {
          changelogEmpty.textContent = window.i18n.t("settings.changelogEmpty");
        }
      }
      const currentTypeRadio = document.querySelector('input[name="itemType"]:checked');
      if (currentTypeRadio) {
        updateDynamicFormSections(currentTypeRadio.value);
      }
      updateTmdbKeyBadge();
      updateRawgKeyBadge();
    }
  });

  setupViewMode(currentView);
  setupEventListeners();
  updateDropdownLabels();
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
          if (textSpan) {
            statusCurrentLabel.textContent = textSpan.textContent;
            if (textSpan.dataset.i18n) {
              statusCurrentLabel.setAttribute("data-i18n", textSpan.dataset.i18n);
            }
          }
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
    emptyAddBtn.addEventListener("click", () => {
      if (searchQuery) {
        // Pokud jsme ve stavu hledání, tlačítko slouží pro vymazání hledání
        if (searchDebounceTimer) {
          clearTimeout(searchDebounceTimer);
        }
        searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.classList.add("hidden");
        currentPage = 1;
        renderGrid();
        searchInput.focus();
      } else {
        openFormModal(null);
      }
    });
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
      if (titleEl) {
        const baseTitle = window.i18n ? window.i18n.t("apiModal.headerTitle") : "Přidat pomocí online API";
        titleEl.textContent = `${baseTitle} (TMDB)`;
      }
    });

    apiSwitchRawg.addEventListener("click", () => {
      apiSwitchRawg.classList.add("active");
      apiSwitchTmdb.classList.remove("active");
      rawgSectionWrapper?.classList.remove("hidden");
      tmdbSectionWrapper?.classList.add("hidden");
      const titleEl = document.getElementById("apiModalHeaderTitle");
      if (titleEl) {
        const baseTitle = window.i18n ? window.i18n.t("apiModal.headerTitle") : "Přidat pomocí online API";
        titleEl.textContent = `${baseTitle} (RAWG.io)`;
      }
      updateRawgKeyBadge();
    });
  }

  // TMDB Modál zavření a ovládání
  if (closeTmdbModalBtn) closeTmdbModalBtn.addEventListener("click", closeTmdbModal);
  if (cancelTmdbModalBtn) cancelTmdbModalBtn.addEventListener("click", closeTmdbModal);

  if (saveTmdbKeyBtn) {
    saveTmdbKeyBtn.addEventListener("click", () => {
      let key = sanitizeApiKey(tmdbApiKeyInput ? tmdbApiKeyInput.value : "");
      if (tmdbApiKeyInput) tmdbApiKeyInput.value = key;
      localStorage.setItem("tracker_tmdb_api_key", key);
      if (settingsTmdbApiKey) settingsTmdbApiKey.value = key;
      updateTmdbKeyBadge();
      showToast(key ? "TMDB API klíč byl úspěšně uložen." : "TMDB API klíč byl vymazán.");
    });
  }

  if (tmdbApiKeyInput) {
    tmdbApiKeyInput.addEventListener("input", (e) => {
      let val = e.target.value;
      if (val.toLowerCase().startsWith("bearer ")) val = val.substring(7);
      const sanitized = sanitizeApiKey(val);
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
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
      const sanitized = sanitizeApiQuery(e.target.value);
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
      if (clearTmdbQueryBtn) {
        clearTmdbQueryBtn.classList.toggle("hidden", sanitized.trim() === "");
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
      let key = sanitizeApiKey(rawgApiKeyInput ? rawgApiKeyInput.value : "");
      if (rawgApiKeyInput) rawgApiKeyInput.value = key;
      localStorage.setItem("tracker_rawg_api_key", key);
      if (settingsRawgApiKey) settingsRawgApiKey.value = key;
      updateRawgKeyBadge();
      showToast(key ? "RAWG API klíč byl úspěšně uložen." : "RAWG API klíč byl vymazán.");
    });
  }

  if (rawgApiKeyInput) {
    rawgApiKeyInput.addEventListener("input", (e) => {
      const sanitized = sanitizeApiKey(e.target.value);
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
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
      const sanitized = sanitizeApiQuery(e.target.value);
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
      if (clearRawgQueryBtn) {
        clearRawgQueryBtn.classList.toggle("hidden", sanitized.trim() === "");
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
      if (detailBody) {
        itemDetailScrollPositions.set(currentItemDetail.id, detailBody.scrollTop);
      }
      detailModalItemBeforeEdit = currentItemDetail;
      const itemToEdit = currentItemDetail;
      detailModal.classList.add("hidden");
      currentItemDetail = null;
      openFormModal(itemToEdit);
    }
  });

  if (detailBody) {
    detailBody.addEventListener("scroll", () => {
      if (currentItemDetail && currentItemDetail.id) {
        itemDetailScrollPositions.set(currentItemDetail.id, detailBody.scrollTop);
      }
    }, { passive: true });
  }

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

  if (settingsTmdbApiKey) {
    settingsTmdbApiKey.addEventListener("input", (e) => {
      let val = e.target.value;
      if (val.toLowerCase().startsWith("bearer ")) val = val.substring(7);
      const sanitized = sanitizeApiKey(val);
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
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

  if (settingsRawgApiKey) {
    settingsRawgApiKey.addEventListener("input", (e) => {
      const sanitized = sanitizeApiKey(e.target.value);
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
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
  if (optimizeCoversBtn) optimizeCoversBtn.addEventListener("click", handleOptimizeExistingCovers);
  if (settingsWebpQuality && settingsWebpQualityVal) {
    settingsWebpQuality.addEventListener("input", (e) => {
      settingsWebpQualityVal.textContent = `${e.target.value} %`;
      updateWebpQualityProgress(e.target.value);
    });
    updateWebpQualityProgress(settingsWebpQuality.value || 88);
  }
  setupSettingsDropdowns();
  exportDataBtn.addEventListener("click", handleExportData);
  if (reportBugBtn) {
    reportBugBtn.addEventListener("click", () => {
      openExternalUrl("https://github.com/TheMichalBr/tracker/issues?q=sort%3Aupdated-desc+is%3Aissue+state%3Aopen+");
    });
  }
  const checkUpdateBtn = document.getElementById("checkUpdateBtn");
  if (checkUpdateBtn) {
    checkUpdateBtn.addEventListener("click", () => handleCheckForUpdates(true));
  }
  const downloadUpdateBtn = document.getElementById("downloadUpdateBtn");
  if (downloadUpdateBtn) {
    downloadUpdateBtn.addEventListener("click", handleDownloadUpdate);
  }
  const viewReleaseNotesBtn = document.getElementById("viewReleaseNotesBtn");
  if (viewReleaseNotesBtn) {
    viewReleaseNotesBtn.addEventListener("click", () => {
      if (latestReleaseData && latestReleaseData.html_url) {
        openExternalUrl(latestReleaseData.html_url);
      }
    });
  }
  const openTmdbApiWebBtn = document.getElementById("openTmdbApiWebBtn");
  if (openTmdbApiWebBtn) {
    openTmdbApiWebBtn.addEventListener("click", () => {
      openExternalUrl("https://www.themoviedb.org/settings/api");
    });
  }
  const openRawgApiWebBtn = document.getElementById("openRawgApiWebBtn");
  if (openRawgApiWebBtn) {
    openRawgApiWebBtn.addEventListener("click", () => {
      openExternalUrl("https://rawg.io/apidocs");
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
      itemRatingInput.dataset.savedVal = e.target.value;
      updateRatingInputWidth();
    });

    itemRatingInput.addEventListener("input", (e) => {
      updateRatingInputWidth();
      const cleanVal = e.target.value.replace(",", ".");
      const num = parseFloat(cleanVal);
      if (!isNaN(num) && num >= 0 && num <= 10) {
        if (isNoRatingActive) setNoRatingState(false);
        itemRating.value = num;
        itemRatingInput.dataset.savedVal = String(num);
      }
    });

    itemRatingInput.addEventListener("focus", () => {
      if (!isNoRatingActive) {
        itemRatingInput.select();
      }
    });

    const ratingBadgeEl = document.querySelector(".rating-input-badge");
    if (ratingBadgeEl) {
      ratingBadgeEl.addEventListener("click", (e) => {
        if (e.target !== itemRatingInput && !isNoRatingActive) {
          itemRatingInput.focus();
          itemRatingInput.select();
        }
      });
    }

    itemRatingInput.addEventListener("blur", (e) => {
      if (isNoRatingActive) return;
      const cleanVal = e.target.value.replace(",", ".");
      let num = parseFloat(cleanVal);
      if (isNaN(num)) {
        num = parseFloat(itemRating.value) || 1;
      } else {
        num = Math.min(10, Math.max(0, num));
      }
      num = Math.round(num * 100) / 100;
      itemRatingInput.value = num;
      itemRating.value = num;
      itemRatingInput.dataset.savedVal = String(num);
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

  // Inicializace zabezpečení a limitů vstupních polí formuláře
  setupFormInputSanitizers();

  // Vyhledávání v reálném čase s debounce (140 ms) pro plynulý chod bez problikávání
  searchInput.addEventListener("input", (e) => {
    const raw = e.target.value;
    const sanitized = sanitizeSearchQuery(raw);
    if (raw !== sanitized) {
      e.target.value = sanitized;
    }

    const val = sanitized.trim().toLowerCase();
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
      const sanitized = sanitizeSearchQuery(searchInput.value);
      searchInput.value = sanitized;
      searchQuery = sanitized.trim().toLowerCase();
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
          if (textSpan) {
            sortCurrentLabel.textContent = textSpan.textContent;
            if (textSpan.dataset.i18n) {
              sortCurrentLabel.setAttribute("data-i18n", textSpan.dataset.i18n);
            }
          }
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
        if (textSpan) {
          sortCurrentLabel.textContent = textSpan.textContent;
          if (textSpan.dataset.i18n) {
            sortCurrentLabel.setAttribute("data-i18n", textSpan.dataset.i18n);
          }
        }
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
  title = null,
  message = null,
  confirmText = null,
  cancelText = null,
  danger = true,
} = {}) {
  const finalTitle = title || (window.i18n ? window.i18n.t("confirm.defaultTitle", {}, "Potvrzení") : "Potvrzení");
  const finalMessage = message || (window.i18n ? window.i18n.t("confirm.defaultMessage", {}, "Opravdu chcete tuto akci provést?") : "Opravdu chcete tuto akci provést?");
  const finalConfirmText = confirmText || (window.i18n ? (danger ? window.i18n.t("confirm.deleteOk", {}, "Ano, smazat") : window.i18n.t("confirm.defaultOk", {}, "Potvrdit")) : (danger ? "Ano, smazat" : "Potvrdit"));
  const finalCancelText = cancelText || (window.i18n ? window.i18n.t("confirm.defaultCancel", {}, "Zrušit") : "Zrušit");

  return new Promise((resolve) => {
    confirmTitle.textContent = finalTitle;
    confirmMessage.textContent = finalMessage;
    confirmOkBtn.textContent = finalConfirmText;
    confirmCancelBtn.textContent = finalCancelText;

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

  if (statusLabelBacklog) {
    statusLabelBacklog.textContent = isGame
      ? (window.i18n ? window.i18n.t("form.statusBacklogGame") : "Chci hrát")
      : (window.i18n ? window.i18n.t("form.statusBacklogMovie") : "Chci vidět");
  }
  if (statusLabelProgress) {
    statusLabelProgress.textContent = isGame
      ? (window.i18n ? window.i18n.t("form.statusProgressGame") : "Právě hraji")
      : (window.i18n ? window.i18n.t("form.statusProgressMovie") : "Právě sleduji");
  }
  if (statusLabelCompleted) {
    statusLabelCompleted.textContent = isGame
      ? (window.i18n ? window.i18n.t("form.statusCompletedGame") : "Dohráno")
      : (window.i18n ? window.i18n.t("form.statusCompletedMovie") : "Zhlédnuto");
  }
  if (statusLabelDropped) {
    statusLabelDropped.textContent = window.i18n ? window.i18n.t("form.statusDropped") : "Odloženo";
  }

  const formImportTmdbBtn = document.getElementById("formImportTmdbBtn");
  if (formImportTmdbBtn) {
    const importSpan = formImportTmdbBtn.querySelector("span");
    if (importSpan) {
      importSpan.textContent = isGame
        ? (window.i18n ? window.i18n.t("form.importRawgBtnText") : "Načíst z RAWG")
        : (window.i18n ? window.i18n.t("form.importTmdbBtnText") : "Načíst z TMDB");
    }
    formImportTmdbBtn.title = isGame
      ? (window.i18n ? window.i18n.t("form.importRawgBtnTitle") : "Předvyplnit z herní databáze RAWG.io")
      : (window.i18n ? window.i18n.t("form.importTmdbBtnTitle") : "Předvyplnit z mezinárodní databáze TMDB");
  }
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

// Výběr obrázku přes nativní dialog s automatickou optimalizací do WebP (500×750 px)
async function handleSelectImage() {
  try {
    const filePath = await tauriInvoke("select_image");
    if (filePath) {
      const localUrl = getCoverUrl(filePath);

      // Zobrazíme dočasný náhled ihned
      imagePreviewContainer.classList.remove("hidden");
      imagePreviewImg.src = localUrl;
      selectedImagePathText.textContent = "Optimalizuji obrázek (500×750 WebP)...";

      try {
        const optimized = await processAndOptimizeImageToWebP(localUrl);
        selectedImagePath = optimized.filePath;
        removeImageFlag = false;
        selectedImagePathText.textContent = `${filePath} (optimalizováno na WebP)`;
        selectedImagePathText.title = filePath;
        imagePreviewImg.src = optimized.dataUrl || getCoverUrl(optimized.filePath);
        showToast("Obrázek byl vycentrován, zmenšen na 500×750 a převeden na WebP.");
      } catch (optErr) {
        console.warn("Optimalizace selhala, použiji původní soubor:", optErr);
        selectedImagePath = filePath;
        removeImageFlag = false;
        selectedImagePathText.textContent = filePath;
        selectedImagePathText.title = filePath;
        imagePreviewImg.src = localUrl;
      }
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

// Nastavení zabezpečení a limitů délky pro formulářová pole
function setupFormInputSanitizers() {
  const bindField = (el, maxLen, allowMultiline = false) => {
    if (!el) return;
    el.addEventListener("input", () => {
      const sanitized = sanitizeFormFieldText(el.value, maxLen, allowMultiline);
      if (el.value !== sanitized) {
        el.value = sanitized;
      }
    });
  };

  bindField(itemTitle, 60);
  bindField(itemGenre, 100);
  bindField(itemTags, 100);
  bindField(itemDescription, 2000, true);

  // Filmy / Seriály
  bindField(itemDirector, 60);
  bindField(itemWriter, 60);
  bindField(itemProduction, 60);
  bindField(itemDuration, 60);
  bindField(itemSeasonEpisodes, 60);
  bindField(itemCast, 200);

  // Hry
  bindField(itemDeveloper, 60);
  bindField(itemPublisher, 60);
  bindField(itemEngine, 60);
  bindField(itemGameMode, 100);
  bindField(itemPlatforms, 100);

  // Rok vydání (max 4 číslice, 0 - 5000)
  if (itemReleaseYear) {
    itemReleaseYear.addEventListener("input", () => {
      const sanitized = sanitizeYearInput(itemReleaseYear.value);
      if (itemReleaseYear.value !== sanitized) {
        itemReleaseYear.value = sanitized;
      }
    });
  }

  // Veřejné / API hodnocení (0 až 100, celá čísla i desetiny s tečkou i čárkou)
  if (itemApiRating) {
    itemApiRating.addEventListener("input", () => {
      const sanitized = sanitizeApiRatingInput(itemApiRating.value);
      if (itemApiRating.value !== sanitized) {
        itemApiRating.value = sanitized;
      }
    });
  }

  // Osobní poznámky (2000 znaků)
  bindField(itemNote, 2000, true);

  // Trailer (max 300 znaků)
  if (itemTrailerUrl) {
    itemTrailerUrl.addEventListener("input", () => {
      const sanitized = sanitizeTrailerUrl(itemTrailerUrl.value);
      if (itemTrailerUrl.value !== sanitized) {
        itemTrailerUrl.value = sanitized;
      }
    });
  }
}

// Přidání řádku pro vlastní metadata (klíč max. 60 znaků, hodnota max. 500 znaků)
function addCustomMetaRow(key = "", value = "") {
  const row = document.createElement("div");
  row.className = "custom-meta-row";
  const keyPh = window.i18n ? window.i18n.t("form.metaKeyPlaceholder") : "Název (např. Dabing)";
  const valPh = window.i18n ? window.i18n.t("form.metaValPlaceholder") : "Hodnota (např. CZ dabing)";
  const removeTitle = window.i18n ? window.i18n.t("form.removeParamBtnTitle") : "Odebrat parametr";
  row.innerHTML = `
    <input type="text" class="meta-key flex-1" maxlength="60" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-i18n-placeholder="form.metaKeyPlaceholder" placeholder="${escapeHtml(keyPh)}" value="${escapeHtml(key)}">
    <input type="text" class="meta-val flex-2" maxlength="500" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-i18n-placeholder="form.metaValPlaceholder" placeholder="${escapeHtml(valPh)}" value="${escapeHtml(value)}">
    <button type="button" class="btn-remove-meta" data-i18n-title="form.removeParamBtnTitle" title="${escapeHtml(removeTitle)}">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  const keyInput = row.querySelector(".meta-key");
  const valInput = row.querySelector(".meta-val");
  if (keyInput) {
    keyInput.addEventListener("input", () => {
      const sanitized = sanitizeFormFieldText(keyInput.value, 60);
      if (keyInput.value !== sanitized) keyInput.value = sanitized;
    });
  }
  if (valInput) {
    valInput.addEventListener("input", () => {
      const sanitized = sanitizeFormFieldText(valInput.value, 500);
      if (valInput.value !== sanitized) valInput.value = sanitized;
    });
  }

  row.querySelector(".btn-remove-meta").addEventListener("click", () => {
    row.remove();
  });

  customMetadataContainer.appendChild(row);
}

function collectCustomMetadata() {
  const meta = {};
  const rows = customMetadataContainer.querySelectorAll(".custom-meta-row");
  rows.forEach((row) => {
    const k = sanitizeFormFieldText(row.querySelector(".meta-key").value, 60).trim();
    const v = sanitizeFormFieldText(row.querySelector(".meta-val").value, 500).trim();
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

  const title = sanitizeFormFieldText(itemTitle.value, 60).trim();
  if (!title) {
    showToast("Zadejte prosím název položky (max. 60 znaků).");
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

  let releaseYearVal = null;
  if (itemReleaseYear && itemReleaseYear.value) {
    const sanitizedYear = sanitizeYearInput(itemReleaseYear.value);
    const parsedYear = parseInt(sanitizedYear, 10);
    if (!isNaN(parsedYear) && parsedYear >= 0 && parsedYear <= 5000) {
      releaseYearVal = parsedYear;
    } else if (sanitizedYear) {
      showToast("Rok vydání musí být číslo v rozmezí 0 až 5000.");
      return;
    }
  }

  let apiRatingVal = null;
  if (itemApiRating && itemApiRating.value.trim()) {
    const sanitizedApi = sanitizeApiRatingInput(itemApiRating.value);
    const parsedApi = parseFloat(sanitizedApi.replace(",", "."));
    if (isNaN(parsedApi) || parsedApi < 0 || parsedApi > 100) {
      showToast("Veřejné / API hodnocení musí být číslo v rozmezí 0 až 100 (např. 8.6 nebo 92).");
      return;
    }
    apiRatingVal = Math.round(parsedApi * 100) / 100;
  }

  let trailerUrlVal = "";
  if (itemTrailerUrl && itemTrailerUrl.value.trim()) {
    trailerUrlVal = sanitizeTrailerUrl(itemTrailerUrl.value);
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Ukládám...";

  try {
    const payload = {
      itemType: selectedType,
      title: title,
      description: sanitizeFormFieldText(itemDescription.value, 2000, true).trim(),
      tags: sanitizeFormFieldText(itemTags.value, 100).trim(),
      genre: sanitizeFormFieldText(itemGenre.value, 100).trim(),
      rating: rating,
      apiRating: apiRatingVal,
      note: sanitizeFormFieldText(itemNote.value, 2000, true).trim(),
      releaseYear: releaseYearVal,
      director: sanitizeFormFieldText(itemDirector.value, 60).trim(),
      writer: sanitizeFormFieldText(itemWriter.value, 60).trim(),
      castMembers: sanitizeFormFieldText(itemCast.value, 200).trim(),
      production: sanitizeFormFieldText(itemProduction.value, 60).trim(),
      duration: sanitizeFormFieldText(itemDuration.value, 60).trim(),
      seasonEpisodes: selectedType === "Seriál" ? sanitizeFormFieldText(itemSeasonEpisodes.value, 60).trim() : "",
      developer: sanitizeFormFieldText(itemDeveloper.value, 60).trim(),
      publisher: sanitizeFormFieldText(itemPublisher.value, 60).trim(),
      gameMode: sanitizeFormFieldText(itemGameMode.value, 100).trim(),
      platforms: sanitizeFormFieldText(itemPlatforms.value, 100).trim(),
      engine: sanitizeFormFieldText(itemEngine.value, 60).trim(),
      customMetadata: collectCustomMetadata(),
      status: document.querySelector('input[name="itemStatus"]:checked')?.value || "completed",
      trailerUrl: trailerUrlVal,
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
  const dlgTitle = window.i18n
    ? window.i18n.t("confirm.deleteTitle", {}, "Smazat záznam")
    : "Smazat záznam";
  const dlgMessage = window.i18n
    ? window.i18n.t("confirm.deleteMessage", { title }, `Opravdu si přejete smazat "${title}" ze své sbírky? Tato akce je nevratná a odstraní také uložený plakát z disku.`)
    : `Opravdu si přejete smazat "${title}" ze své sbírky? Tato akce je nevratná a odstraní také uložený plakát z disku.`;
  const confirmText = window.i18n
    ? window.i18n.t("confirm.deleteOk", {}, "Ano, smazat")
    : "Ano, smazat";
  const cancelText = window.i18n
    ? window.i18n.t("confirm.deleteCancel", {}, "Zrušit")
    : "Zrušit";

  const confirmed = await showConfirmDialog({
    title: dlgTitle,
    message: dlgMessage,
    confirmText,
    cancelText,
    danger: true,
  });

  if (!confirmed) return;

  try {
    await tauriInvoke("delete_item", { id });
    itemDetailScrollPositions.delete(id);
    allItems = allItems.filter((item) => item.id !== id);
    updateCounts();
    renderGrid();
    if (fromDetail) {
      closeDetailModal();
    }
    const toastMsg = window.i18n
      ? window.i18n.t("confirm.itemDeletedToast", { title }, `Položka "${title}" byla smazána.`)
      : `Položka "${title}" byla smazána.`;
    showToast(toastMsg);
  } catch (err) {
    console.error("Chyba při mazání:", err);
    const errMsg = window.i18n
      ? window.i18n.t("confirm.deleteErrorToast", { error: String(err) }, "Chyba při mazání: " + err)
      : "Chyba při mazání: " + err;
    showToast(errMsg);
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
  if (itemRatingInput) {
    delete itemRatingInput.dataset.savedVal;
  }

  if (!itemToEdit) {
    detailModalItemBeforeEdit = null;
  }

  if (itemToEdit) {
    editingItemId = itemToEdit.id;
    modalTitle.textContent = window.i18n
      ? window.i18n.t("form.modalTitleEditWithTitle", { title: itemToEdit.title })
      : `Upravit: ${itemToEdit.title}`;
    document.getElementById("saveFormBtn").textContent = window.i18n
      ? window.i18n.t("form.saveChangesBtn")
      : "Uložit změny";

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
    
    const hasRating = itemToEdit.rating !== undefined && itemToEdit.rating !== null && itemToEdit.rating !== "";
    if (hasRating) {
      const rNum = parseFloat(itemToEdit.rating);
      const safeRating = isNaN(rNum) ? 1 : rNum;
      itemRating.value = safeRating;
      if (itemRatingInput) {
        itemRatingInput.value = safeRating;
        itemRatingInput.dataset.savedVal = String(safeRating);
      }
      setNoRatingState(false);
      updateRatingInputWidth();
    } else {
      itemRating.value = 1;
      if (itemRatingInput) {
        itemRatingInput.value = 1;
        itemRatingInput.dataset.savedVal = "1";
      }
      setNoRatingState(true);
      updateRatingInputWidth();
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
      selectedImagePathText.textContent = itemToEdit.image_path || (window.i18n ? window.i18n.t("form.savedPoster") : "Uložený plakát");
    } else {
      imagePreviewContainer.classList.add("hidden");
      selectedImagePathText.textContent = window.i18n ? window.i18n.t("form.noPoster") : "Položka nemá plakát";
    }

    if (itemToEdit.custom_metadata) {
      for (const [k, v] of Object.entries(itemToEdit.custom_metadata)) {
        addCustomMetaRow(k, v);
      }
    }
  } else if (prefillData) {
    editingItemId = null;
    const fallbackSource = prefillData.itemType === "Hra" ? "z RAWG" : "z TMDB";
    modalTitle.textContent = window.i18n
      ? window.i18n.t("form.modalTitleAddWithTitle", { title: prefillData.title || fallbackSource })
      : `Přidat: ${prefillData.title || fallbackSource}`;
    document.getElementById("saveFormBtn").textContent = window.i18n
      ? window.i18n.t("form.saveBtn")
      : "Uložit položku";

    const targetType = prefillData.itemType || "Film";
    const typeRadio = document.querySelector(`input[name="itemType"][value="${targetType}"]`);
    if (typeRadio) typeRadio.checked = true;
    updateDynamicFormSections(targetType);

    const st = prefillData.status || "completed";
    const stRadio = document.querySelector(`input[name="itemStatus"][value="${st}"]`);
    if (stRadio) stRadio.checked = true;

    if (itemTrailerUrl) itemTrailerUrl.value = sanitizeTrailerUrl(prefillData.trailerUrl || "");

    itemTitle.value = sanitizeFormFieldText(prefillData.title || "", 60);
    itemReleaseYear.value = sanitizeYearInput(prefillData.releaseYear || "");
    itemGenre.value = sanitizeFormFieldText(prefillData.genre || "", 100);
    itemTags.value = sanitizeFormFieldText(prefillData.tags || "", 100);
    itemDescription.value = sanitizeFormFieldText(prefillData.description || "", 2000, true);

    const hasPrefRating = prefillData.rating !== undefined && prefillData.rating !== null && prefillData.rating !== "";
    const prefRating = hasPrefRating ? parseFloat(prefillData.rating) : 1;
    const safePrefRating = isNaN(prefRating) ? 1 : prefRating;
    itemRating.value = safePrefRating;
    if (itemRatingInput) {
      itemRatingInput.value = safePrefRating;
      itemRatingInput.dataset.savedVal = String(safePrefRating);
      updateRatingInputWidth();
    }
    setNoRatingState(!hasPrefRating);
    itemApiRating.value = prefillData.apiRating !== undefined && prefillData.apiRating !== null ? sanitizeApiRatingInput(prefillData.apiRating) : "";
    itemNote.value = sanitizeFormFieldText(prefillData.note || "", 2000, true);

    // Filmy / Seriály
    itemDirector.value = sanitizeFormFieldText(prefillData.director || "", 60);
    itemWriter.value = sanitizeFormFieldText(prefillData.writer || "", 60);
    itemProduction.value = sanitizeFormFieldText(prefillData.production || "", 60);
    itemDuration.value = sanitizeFormFieldText(prefillData.duration || "", 60);
    if (itemSeasonEpisodes) itemSeasonEpisodes.value = sanitizeFormFieldText(prefillData.seasonEpisodes || "", 60);
    itemCast.value = sanitizeFormFieldText(prefillData.castMembers || "", 200);

    // Hry
    itemDeveloper.value = sanitizeFormFieldText(prefillData.developer || "", 60);
    itemPublisher.value = sanitizeFormFieldText(prefillData.publisher || "", 60);
    itemGameMode.value = sanitizeFormFieldText(prefillData.gameMode || "", 100);
    itemPlatforms.value = sanitizeFormFieldText(prefillData.platforms || "", 100);
    itemEngine.value = sanitizeFormFieldText(prefillData.engine || "", 60);

    // Plakát
    if (prefillData.imageData || prefillData.imagePath) {
      selectedImagePath = prefillData.imagePath || "";
      existingImageData = prefillData.imageData || "";
      imagePreviewImg.src = getCoverUrl(prefillData.imageData || prefillData.imagePath);
      imagePreviewContainer.classList.remove("hidden");
      selectedImagePathText.textContent = window.i18n ? window.i18n.t("form.posterFromDatabase") : "Plakát načten z online databáze";
    } else {
      imagePreviewContainer.classList.add("hidden");
      selectedImagePathText.textContent = window.i18n ? window.i18n.t("form.noPosterFound") : "Žádný plakát nebyl nalezen";
    }

    if (prefillData.customMetadata) {
      for (const [k, v] of Object.entries(prefillData.customMetadata)) {
        addCustomMetaRow(sanitizeFormFieldText(k, 60), sanitizeFormFieldText(v, 500));
      }
    }
  } else {
    editingItemId = null;
    modalTitle.textContent = window.i18n ? window.i18n.t("form.modalTitleAdd") : "Přidat novou položku";
    document.getElementById("saveFormBtn").textContent = window.i18n ? window.i18n.t("form.saveBtn") : "Uložit položku";

    document.querySelector('input[name="itemType"][value="Film"]').checked = true;
    updateDynamicFormSections("Film");

    const defStRadio = document.querySelector('input[name="itemStatus"][value="completed"]');
    if (defStRadio) defStRadio.checked = true;
    if (itemTrailerUrl) itemTrailerUrl.value = "";

    itemRating.value = 1;
    if (itemRatingInput) {
      itemRatingInput.value = 1;
      itemRatingInput.dataset.savedVal = "1";
    }
    setNoRatingState(false);
    updateRatingInputWidth();
    imagePreviewContainer.classList.add("hidden");
    selectedImagePathText.textContent = window.i18n ? window.i18n.t("form.noImageSelected") : "Žádný nový soubor nevybrán";
  }

  formModal.classList.remove("hidden");
  updateModalBodyLock();
  itemTitle.focus();
}

function closeFormModal(wasSaved = false, updatedItem = null) {
  resetAllApiResultButtons();
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
// Pomocné lokalizační funkce
// ==========================================================================
function getItemTypeLabel(type) {
  if (!window.i18n) return type;
  if (type === "Film") return window.i18n.t("main.typeFilmBadge", {}, "Film");
  if (type === "Seriál") return window.i18n.t("main.typeSeriesBadge", {}, "Seriál");
  if (type === "Hra") return window.i18n.t("main.typeGameBadge", {}, "Hra");
  return type;
}

function updateDropdownLabels() {
  const sMenu = document.getElementById("statusDropdownMenu");
  const sLabel = document.getElementById("statusCurrentLabel");
  if (sMenu && sLabel) {
    const activeOpt = sMenu.querySelector(".status-option.active");
    if (activeOpt) {
      const spans = activeOpt.querySelectorAll("span");
      const textSpan = spans[spans.length - 1];
      if (textSpan) {
        sLabel.textContent = textSpan.textContent;
        if (textSpan.dataset.i18n) {
          sLabel.setAttribute("data-i18n", textSpan.dataset.i18n);
        }
      }
    }
  }
  const sortMenu = document.getElementById("sortDropdownMenu");
  const sortLabel = document.getElementById("sortCurrentLabel");
  if (sortMenu && sortLabel) {
    const activeOpt = sortMenu.querySelector(".sort-option.active");
    if (activeOpt) {
      const textSpan = activeOpt.querySelector("span");
      if (textSpan) {
        sortLabel.textContent = textSpan.textContent;
        if (textSpan.dataset.i18n) {
          sortLabel.setAttribute("data-i18n", textSpan.dataset.i18n);
        }
      }
    }
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
        label: window.i18n
          ? (isGame ? window.i18n.t("form.statusBacklogGame") : window.i18n.t("form.statusBacklogMovie"))
          : (isGame ? "Chci hrát" : "Chci vidět"),
        bulletClass: "bullet-backlog",
      };
    case "in_progress":
      return {
        key: "progress",
        label: window.i18n
          ? (isGame ? window.i18n.t("form.statusProgressGame") : window.i18n.t("form.statusProgressMovie"))
          : (isGame ? "Právě hraji" : "Právě sleduji"),
        bulletClass: "bullet-progress",
      };
    case "completed":
      return {
        key: "completed",
        label: window.i18n
          ? (isGame ? window.i18n.t("form.statusCompletedGame") : window.i18n.t("form.statusCompletedMovie"))
          : (isGame ? "Dohráno" : "Zhlédnuto"),
        bulletClass: "bullet-completed",
      };
    case "dropped":
      return {
        key: "dropped",
        label: window.i18n ? window.i18n.t("form.statusDropped") : "Odloženo",
        bulletClass: "bullet-dropped",
      };
    default:
      return {
        key: "completed",
        label: window.i18n
          ? (isGame ? window.i18n.t("form.statusCompletedGame") : window.i18n.t("form.statusCompletedMovie"))
          : (isGame ? "Dohráno" : "Zhlédnuto"),
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
    if (title) {
      trailerModalTitle.textContent = window.i18n
        ? window.i18n.t("trailer.modalTitleWithItem", { title }, `Trailer: ${title}`)
        : `Trailer: ${title}`;
    } else {
      trailerModalTitle.textContent = window.i18n
        ? window.i18n.t("trailer.modalTitle", {}, "Trailer")
        : "Trailer";
    }
  }
  if (trailerModalSubtitle) {
    trailerModalSubtitle.textContent = window.i18n
      ? window.i18n.t("trailer.modalSubtitle", {}, "Oficiální videoupoutávka")
      : "Oficiální videoupoutávka";
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
      const unsuppMsg = window.i18n
        ? window.i18n.t("trailer.unsupportedVideo", {}, "Váš prohlížeč nepodporuje přehrávání tohoto formátu videa.")
        : "Váš prohlížeč nepodporuje přehrávání tohoto formátu videa.";
      trailerPlayerWrap.innerHTML = `
        <video controls autoplay src="${escapeHtml(url)}" style="width: 100%; height: 100%;">
          ${escapeHtml(unsuppMsg)}
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

  if (backlogText) {
    backlogText.textContent = window.i18n
      ? (isGame ? window.i18n.t("detail.statusBacklogGame", {}, "Chci hrát") : window.i18n.t("detail.statusBacklogMovie", {}, "Chci vidět"))
      : (isGame ? "Chci hrát" : "Chci vidět");
  }
  if (progressText) {
    progressText.textContent = window.i18n
      ? (isGame ? window.i18n.t("detail.statusProgressGame", {}, "Hraji") : window.i18n.t("detail.statusProgressMovie", {}, "Sleduji"))
      : (isGame ? "Hraji" : "Sleduji");
  }
  if (completedText) {
    completedText.textContent = window.i18n
      ? (isGame ? window.i18n.t("detail.statusCompletedGame", {}, "Dohráno") : window.i18n.t("detail.statusCompletedMovie", {}, "Dokončeno"))
      : (isGame ? "Dohráno" : "Dokončeno");
  }
  if (droppedText) {
    droppedText.textContent = window.i18n
      ? window.i18n.t("detail.statusDropped", {}, "Odloženo")
      : "Odloženo";
  }

  const buttons = document.querySelectorAll(".detail-status-btn");
  buttons.forEach((btn) => {
    const s = btn.dataset.status;
    btn.classList.toggle("active", s === status);
    if (s === "backlog") btn.title = window.i18n ? window.i18n.t("detail.statusBacklogTitle", {}, "Chci vidět / hrát") : "Chci vidět / hrát";
    else if (s === "in_progress") btn.title = window.i18n ? window.i18n.t("detail.statusProgressTitle", {}, "Právě sleduji / hraji") : "Právě sleduji / hraji";
    else if (s === "completed") btn.title = window.i18n ? window.i18n.t("detail.statusCompletedTitle", {}, "Dokončeno / zhlédnuto") : "Dokončeno / zhlédnuto";
    else if (s === "dropped") btn.title = window.i18n ? window.i18n.t("detail.statusDroppedTitle", {}, "Odloženo / zrušeno") : "Odloženo / zrušeno";

    btn.onclick = async () => {
      const newStatus = btn.dataset.status;
      if (item.status === newStatus) return;

      try {
        await tauriInvoke("update_item_status", { id: item.id, status: newStatus });
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const nowFormatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        item.status = newStatus;
        item.updated_at = nowFormatted;
        item.status_changed_at = nowFormatted;
        if (newStatus === "completed") {
          item.completed_at = nowFormatted;
        } else {
          item.completed_at = null;
        }

        const idx = allItems.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
          allItems[idx].status = newStatus;
          allItems[idx].updated_at = nowFormatted;
          allItems[idx].status_changed_at = nowFormatted;
          allItems[idx].completed_at = item.completed_at;
        }

        updateDetailStatusView(item);
        renderDetailInfo(item);
        renderGrid();
        const updatedInfo = getStatusInfo(newStatus, item.item_type);
        const statusMsg = window.i18n
          ? window.i18n.t("detail.statusChangedToast", { label: updatedInfo.label }, `Stav byl změněn na: "${updatedInfo.label}".`)
          : `Stav byl změněn na: "${updatedInfo.label}".`;
        showToast(statusMsg);
      } catch (err) {
        console.error("Chyba při změně stavu:", err);
        const errMsg = window.i18n
          ? window.i18n.t("detail.statusChangeErrorToast", { error: String(err) }, "Nepodařilo se změnit stav: " + err)
          : "Nepodařilo se změnit stav: " + err;
        showToast(errMsg);
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
      hint: window.i18n ? window.i18n.t("detail.hintCsfd", {}, "Vyhledat na ČSFD.cz") : "Vyhledat na ČSFD.cz",
    });

    let imdbId = item.custom_metadata?.["IMDb ID"] || item.custom_metadata?.["imdb_id"];
    const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : `https://www.imdb.com/find/?q=${titleEnc}`;
    links.push({
      name: "IMDb",
      tag: "IMDb",
      tagClass: "tag-imdb",
      url: imdbUrl,
      hint: imdbId
        ? (window.i18n ? window.i18n.t("detail.hintImdbId", { id: imdbId }, `Přejít přímo na IMDb (${imdbId})`) : `Přejít přímo na IMDb (${imdbId})`)
        : (window.i18n ? window.i18n.t("detail.hintImdbSearch", {}, "Hledat na IMDb") : "Hledat na IMDb"),
    });

    let tmdbId = item.custom_metadata?.["TMDB ID"] || item.custom_metadata?.["tmdb_id"];
    const tmdbType = item.item_type === "Seriál" ? "tv" : "movie";
    const tmdbUrl = tmdbId ? `https://www.themoviedb.org/${tmdbType}/${tmdbId}` : `https://www.themoviedb.org/search?query=${titleEnc}`;
    links.push({
      name: "The Movie DB",
      tag: "TMDB",
      tagClass: "tag-tmdb",
      url: tmdbUrl,
      hint: window.i18n ? window.i18n.t("detail.hintTmdb", {}, "Zobrazit na TMDB") : "Zobrazit na TMDB",
    });
  } else if (item.item_type === "Hra") {
    links.push({
      name: "Steam Store",
      tag: "Steam",
      tagClass: "tag-steam",
      url: `https://store.steampowered.com/search/?term=${titleEnc}`,
      hint: window.i18n ? window.i18n.t("detail.hintSteam", {}, "Vyhledat na platformě Steam") : "Vyhledat na platformě Steam",
    });

    links.push({
      name: "Metacritic",
      tag: "MC",
      tagClass: "tag-metacritic",
      url: `https://www.metacritic.com/search/${titleEnc}/`,
      hint: window.i18n ? window.i18n.t("detail.hintMetacritic", {}, "Zobrazit recenze na Metacritic") : "Zobrazit recenze na Metacritic",
    });

    let rawgId = item.custom_metadata?.["RAWG ID"];
    const rawgUrl = rawgId ? `https://rawg.io/games/${rawgId}` : `https://rawg.io/search?query=${titleEnc}`;
    links.push({
      name: "RAWG.io",
      tag: "RAWG",
      tagClass: "tag-rawg",
      url: rawgUrl,
      hint: window.i18n ? window.i18n.t("detail.hintRawg", {}, "Zobrazit na herní databázi RAWG") : "Zobrazit na herní databázi RAWG",
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

  const tooltipText = window.i18n
    ? window.i18n.t("detail.ratingOutOfTen", { val: num }, `${num} z 10`)
    : `${num} z 10`;
  return `<div class="rating-stars-group" title="${escapeHtml(tooltipText)} (${Math.round(starScore * 10) / 10} / 5)">${starsHtml}</div>`;
}

// Zobrazení detailu položky
function openDetailModal(item) {
  currentItemDetail = item;

  // Nastavení ikony v hlavičce modálu
  const detailHeaderIcon = document.getElementById("detailHeaderIcon");
  const typeIcon = item.item_type === "Film" ? SVG_ICONS.film : item.item_type === "Seriál" ? SVG_ICONS.series : SVG_ICONS.game;
  if (detailHeaderIcon) {
    detailHeaderIcon.innerHTML = typeIcon;
    const svgEl = detailHeaderIcon.querySelector("svg");
    if (svgEl) {
      svgEl.classList.add("modal-svg");
    }
  }

  // Typ a Rok s SVG ikonou
  detailTypeBadge.className = `card-type-badge type-${escapeHtml(item.item_type)}`;
  detailTypeBadge.innerHTML = `${typeIcon} <span>${escapeHtml(getItemTypeLabel(item.item_type))}</span>`;

  if (item.release_year) {
    detailYearBadge.innerHTML = `${SVG_ICONS.calendar} <span>${item.release_year}</span>`;
    detailYearBadge.classList.remove("hidden");
  } else {
    detailYearBadge.classList.add("hidden");
  }

  // Plakát a Ambient Glow (v modálu se zobrazí ihned; ambientní vrstva a skleněný efekt se aktivují pouze při přítomnosti plakátu)
  detailPosterWrap.innerHTML = "";
  const detailCoverSrc = getCoverUrl(item.image_data);
  const detailModalCard = document.querySelector(".modal-card.modal-detail");
  const detailAmbientLayer = document.getElementById("detailAmbientLayer");
  const detailAmbientImg = document.getElementById("detailAmbientImg");

  if (detailCoverSrc) {
    if (detailAmbientImg) {
      detailAmbientImg.src = detailCoverSrc;
    }
    if (detailAmbientLayer) {
      detailAmbientLayer.classList.remove("hidden");
    }
    if (detailModalCard) {
      detailModalCard.classList.add("has-ambient");
    }
    detailPosterWrap.innerHTML = `<img src="${detailCoverSrc}" alt="${escapeHtml(item.title)}" draggable="false" onerror="handlePosterError(this)">`;
  } else {
    if (detailAmbientLayer) {
      detailAmbientLayer.classList.add("hidden");
    }
    if (detailAmbientImg) {
      detailAmbientImg.removeAttribute("src");
    }
    if (detailModalCard) {
      detailModalCard.classList.remove("has-ambient");
    }
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
      detailGenre.innerHTML += `<span class="genre-tag" title="${escapeHtml(g)}">${escapeHtml(g)}</span>`;
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
      detailTags.innerHTML += `<span class="tag-pill" title="#${escapeHtml(t)}">#${escapeHtml(t)}</span>`;
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
    if (item.director) {
      const lbl = window.i18n ? window.i18n.t("detail.director", {}, "Režie") : "Režie";
      addDetailMetaCell(detailMetaGrid, lbl, item.director);
    }
    if (item.writer) {
      const lbl = window.i18n ? window.i18n.t("detail.writer", {}, "Scénář") : "Scénář";
      addDetailMetaCell(detailMetaGrid, lbl, item.writer);
    }
    if (item.production) {
      const lbl = window.i18n ? window.i18n.t("detail.production", {}, "Produkce") : "Produkce";
      addDetailMetaCell(detailMetaGrid, lbl, item.production);
    }
    if (item.duration) {
      const lbl = window.i18n ? window.i18n.t("detail.duration", {}, "Délka") : "Délka";
      addDetailMetaCell(detailMetaGrid, lbl, item.duration);
    }
    if (item.item_type === "Seriál" && item.season_episodes) {
      const lbl = window.i18n ? window.i18n.t("detail.seasonEpisodes", {}, "Řada / Epizody") : "Řada / Epizody";
      addDetailMetaCell(detailMetaGrid, lbl, item.season_episodes);
    }
    if (item.cast_members) {
      const lbl = window.i18n ? window.i18n.t("detail.cast", {}, "Obsazení") : "Obsazení";
      addDetailMetaCell(detailMetaGrid, lbl, item.cast_members);
    }
  } else if (item.item_type === "Hra") {
    if (item.developer) {
      const lbl = window.i18n ? window.i18n.t("detail.developer", {}, "Vývojářské studio") : "Vývojářské studio";
      addDetailMetaCell(detailMetaGrid, lbl, item.developer);
    }
    if (item.publisher) {
      const lbl = window.i18n ? window.i18n.t("detail.publisher", {}, "Vydavatel") : "Vydavatel";
      addDetailMetaCell(detailMetaGrid, lbl, item.publisher);
    }
    if (item.engine) {
      const lbl = window.i18n ? window.i18n.t("detail.engine", {}, "Engine") : "Engine";
      addDetailMetaCell(detailMetaGrid, lbl, item.engine);
    }
    if (item.game_mode) {
      const lbl = window.i18n ? window.i18n.t("detail.gameMode", {}, "Herní režim") : "Herní režim";
      addDetailMetaCell(detailMetaGrid, lbl, item.game_mode);
    }
    if (item.platforms) {
      const lbl = window.i18n ? window.i18n.t("detail.platforms", {}, "Platformy") : "Platformy";
      addDetailMetaCell(detailMetaGrid, lbl, item.platforms);
    }
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

  // 4. Systémové informace a časové údaje (Vytvořeno, Upraveno, Změna stavu, Dokončení)
  renderDetailInfo(item);

  detailModal.classList.remove("hidden");
  updateModalBodyLock();

  if (detailBody) {
    const savedScroll = itemDetailScrollPositions.get(item.id) || 0;
    requestAnimationFrame(() => {
      detailBody.scrollTop = savedScroll;
      // Druhé znovunastavení po vykreslení obrázků / posteru
      setTimeout(() => {
        if (currentItemDetail && currentItemDetail.id === item.id) {
          detailBody.scrollTop = savedScroll;
        }
      }, 60);
    });
  }
}

function addDetailMetaCell(container, label, value) {
  const cell = document.createElement("div");
  const norm = String(label).toLowerCase().trim();
  const isWide = String(value).length > 32 ||
    norm.includes("obsazení") || norm.includes("cast") ||
    norm.includes("platform") || norm.includes("studio") || norm.includes("developer");
  cell.className = `detail-meta-cell${isWide ? " full-width" : ""}`;

  let iconHtml = "";
  if (norm.includes("režie") || norm.includes("director")) iconHtml = "🎬 ";
  else if (norm.includes("scénář") || norm.includes("writer") || norm.includes("screenplay")) iconHtml = "✍️ ";
  else if (norm.includes("produkce") || norm.includes("production")) iconHtml = "🏢 ";
  else if (norm.includes("délka") || norm.includes("duration")) iconHtml = "⏱️ ";
  else if (norm.includes("řada") || norm.includes("epizod") || norm.includes("season")) iconHtml = "📺 ";
  else if (norm.includes("obsazení") || norm.includes("cast")) iconHtml = "🎭 ";
  else if (norm.includes("vývojář") || norm.includes("developer")) iconHtml = "💻 ";
  else if (norm.includes("vydavatel") || norm.includes("publisher")) iconHtml = "📦 ";
  else if (norm.includes("engine")) iconHtml = "⚙️ ";
  else if (norm.includes("herní režim") || norm.includes("game mode")) iconHtml = "🕹️ ";
  else if (norm.includes("platform")) iconHtml = "🎮 ";
  else if (norm.includes("vytvoření") || norm.includes("creation")) iconHtml = "📅 ";
  else if (norm.includes("poslední změny") || norm.includes("modified")) iconHtml = "🔄 ";
  else if (norm.includes("změna stavu") || norm.includes("status changed")) iconHtml = "📌 ";
  else if (norm.includes("dokončení") || norm.includes("dohrání") || norm.includes("finished") || norm.includes("completion")) iconHtml = "🏆 ";
  else iconHtml = "";

  cell.innerHTML = `
    <span class="meta-cell-label">${iconHtml}${escapeHtml(label)}</span>
    <span class="meta-cell-value">${escapeHtml(value)}</span>
  `;
  container.appendChild(cell);
}

function formatDateTime(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "-";
  const trimmed = dateStr.trim();
  const isEn = window.i18n && window.i18n.getLanguage() === "en";
  if (!trimmed || trimmed === "Nyní" || trimmed === "Just now") {
    return isEn ? (window.i18n ? window.i18n.t("detail.nowTime", {}, "Just now") : "Just now") : (window.i18n ? window.i18n.t("detail.nowTime", {}, "Nyní") : "Nyní");
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    if (isEn) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monStr = monthNames[m - 1] || m;
      return `${monStr} ${d}, ${year}, ${hours}:${minutes}`;
    }
    return `${d}. ${m}. ${year}, ${hours}:${minutes}`;
  }

  const dateObj = new Date(trimmed);
  if (!isNaN(dateObj.getTime())) {
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1;
    const y = dateObj.getFullYear();
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const mm = String(dateObj.getMinutes()).padStart(2, "0");
    if (isEn) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monStr = monthNames[dateObj.getMonth()] || m;
      return `${monStr} ${d}, ${y}, ${hh}:${mm}`;
    }
    return `${d}. ${m}. ${y}, ${hh}:${mm}`;
  }

  return trimmed;
}

function renderDetailInfo(item) {
  if (!detailInfoGrid) return;
  detailInfoGrid.innerHTML = "";

  // 1. Datum vytvoření
  const createdAtVal = item.created_at ? formatDateTime(item.created_at) : "-";
  const createdLabel = window.i18n ? window.i18n.t("detail.createdAt", {}, "Datum vytvoření") : "Datum vytvoření";
  addDetailMetaCell(detailInfoGrid, createdLabel, createdAtVal);

  // 2. Datum poslední změny
  const updatedAtVal = item.updated_at ? formatDateTime(item.updated_at) : createdAtVal;
  const updatedLabel = window.i18n ? window.i18n.t("detail.updatedAt", {}, "Datum poslední změny") : "Datum poslední změny";
  addDetailMetaCell(detailInfoGrid, updatedLabel, updatedAtVal);

  // 3. Poslední změna stavu
  const statusChangedVal = item.status_changed_at ? formatDateTime(item.status_changed_at) : updatedAtVal;
  const statusChangedLabel = window.i18n ? window.i18n.t("detail.statusChangedAt", {}, "Poslední změna stavu") : "Poslední změna stavu";
  addDetailMetaCell(detailInfoGrid, statusChangedLabel, statusChangedVal);

  // 4. Datum dokončení / dohrání (pouze pokud je stav dokončeno/dohráno)
  if (item.status === "completed") {
    const isGame = item.item_type === "Hra";
    const completedLabel = window.i18n
      ? (isGame ? window.i18n.t("detail.completedAtGame", {}, "Datum dohrání") : window.i18n.t("detail.completedAtMovie", {}, "Datum dokončení"))
      : (isGame ? "Datum dohrání" : "Datum dokončení");
    const completedVal = item.completed_at ? formatDateTime(item.completed_at) : statusChangedVal;
    addDetailMetaCell(detailInfoGrid, completedLabel, completedVal);
  }

  if (detailInfoWrap) {
    detailInfoWrap.classList.remove("hidden");
  }
}

function closeDetailModal() {
  if (detailBody && currentItemDetail && currentItemDetail.id) {
    itemDetailScrollPositions.set(currentItemDetail.id, detailBody.scrollTop);
  }
  const detailModalCard = document.querySelector(".modal-card.modal-detail");
  const detailAmbientLayer = document.getElementById("detailAmbientLayer");
  const detailAmbientImg = document.getElementById("detailAmbientImg");
  if (detailModalCard) detailModalCard.classList.remove("has-ambient");
  if (detailAmbientLayer) detailAmbientLayer.classList.add("hidden");
  if (detailAmbientImg) detailAmbientImg.removeAttribute("src");

  detailModal.classList.add("hidden");
  currentItemDetail = null;
  detailModalItemBeforeEdit = null;
  updateModalBodyLock();
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function refreshSettingsStorageInfo() {
  if (settingsItemCount) {
    const count = allItems.length;
    const countStr = window.i18n ? window.i18n.formatItemCount(count) : `${count} položek`;
    try {
      const coversInfo = await tauriInvoke("get_covers_files_info");
      const sizeStr = formatFileSize(coversInfo?.total_size_bytes || 0);
      settingsItemCount.textContent = `${countStr} (${sizeStr})`;
    } catch (err) {
      settingsItemCount.textContent = countStr;
    }
  }

  if (settingsTempCount) {
    try {
      const info = await tauriInvoke("get_temp_files_info");
      if (info && typeof info.count === "number") {
        const countStr = window.i18n ? window.i18n.formatItemCount(info.count) : `${info.count} položek`;
        settingsTempCount.textContent = `${countStr} (${formatFileSize(info.total_size_bytes || 0)})`;
      } else {
        const zeroStr = window.i18n ? window.i18n.formatItemCount(0) : "0 položek";
        settingsTempCount.textContent = `${zeroStr} (0 B)`;
      }
    } catch (err) {
      const zeroStr = window.i18n ? window.i18n.formatItemCount(0) : "0 položek";
      settingsTempCount.textContent = zeroStr;
    }
  }
}

// ==========================================================================
// Nastavení: Vlastní zaoblené rozbalovací nabídky
// ==========================================================================
function updateSettingsDropdownUI(viewVal, perPageVal, langVal) {
  const currentLang = langVal || (window.i18n ? window.i18n.getLanguage() : "cs");

  const langMap = {
    cs: "Čeština",
    en: "English"
  };

  const viewMap = {
    grid: window.i18n ? window.i18n.t("settings.viewGrid", {}, "Dlaždice") : "Dlaždice",
    compact: window.i18n ? window.i18n.t("settings.viewCompact", {}, "Kompaktní mřížka") : "Kompaktní mřížka",
    list: window.i18n ? window.i18n.t("settings.viewList", {}, "Detailní seznam") : "Detailní seznam"
  };

  const perPageMap = {
    "12": window.i18n ? window.i18n.t("settings.perPage12", {}, "12 položek") : "12 položek",
    "24": window.i18n ? window.i18n.t("settings.perPage24", {}, "24 položek") : "24 položek",
    "48": window.i18n ? window.i18n.t("settings.perPage48", {}, "48 položek") : "48 položek",
    "96": window.i18n ? window.i18n.t("settings.perPage96", {}, "96 položek") : "96 položek",
    "all": window.i18n ? window.i18n.t("settings.perPageAll", {}, "Vše (Nekonečné rolování)") : "Vše (Nekonečné rolování)"
  };

  const langLabel = document.getElementById("settingsLangCurrentLabel");
  if (langLabel) langLabel.textContent = langMap[currentLang] || "Čeština";

  const viewLabel = document.getElementById("settingsViewCurrentLabel");
  if (viewLabel) viewLabel.textContent = viewMap[viewVal] || viewMap["grid"] || "Dlaždice";

  const perPageLabel = document.getElementById("settingsPerPageCurrentLabel");
  if (perPageLabel) perPageLabel.textContent = perPageMap[perPageVal] || perPageMap["24"] || "24 položek";

  const langMenu = document.getElementById("settingsLangDropdownMenu");
  if (langMenu) {
    langMenu.querySelectorAll(".sort-option").forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.value === currentLang);
    });
  }

  const viewMenu = document.getElementById("settingsViewDropdownMenu");
  if (viewMenu) {
    viewMenu.querySelectorAll(".sort-option").forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.value === viewVal);
    });
  }

  const perPageMenu = document.getElementById("settingsPerPageDropdownMenu");
  if (perPageMenu) {
    perPageMenu.querySelectorAll(".sort-option").forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.value === perPageVal);
    });
  }
}

function setupSettingsDropdowns() {
  const langBtn = document.getElementById("settingsLangDropdownBtn");
  const langMenu = document.getElementById("settingsLangDropdownMenu");
  const langWrap = document.getElementById("settingsLangDropdownWrapper");

  const viewBtn = document.getElementById("settingsViewDropdownBtn");
  const viewMenu = document.getElementById("settingsViewDropdownMenu");
  const viewWrap = document.getElementById("settingsViewDropdownWrapper");

  const perPageBtn = document.getElementById("settingsPerPageDropdownBtn");
  const perPageMenu = document.getElementById("settingsPerPageDropdownMenu");
  const perPageWrap = document.getElementById("settingsPerPageDropdownWrapper");

  function closeSettingsMenus() {
    langMenu?.classList.add("hidden");
    langWrap?.classList.remove("open");
    langBtn?.setAttribute("aria-expanded", "false");

    viewMenu?.classList.add("hidden");
    viewWrap?.classList.remove("open");
    viewBtn?.setAttribute("aria-expanded", "false");

    perPageMenu?.classList.add("hidden");
    perPageWrap?.classList.remove("open");
    perPageBtn?.setAttribute("aria-expanded", "false");
  }

  if (langBtn && langMenu) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = langMenu.classList.contains("hidden");
      closeSettingsMenus();
      if (isHidden) {
        langMenu.classList.remove("hidden");
        langWrap?.classList.add("open");
        langBtn.setAttribute("aria-expanded", "true");
      }
    });

    langMenu.querySelectorAll(".sort-option").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = opt.dataset.value;
        if (settingsAppLang) settingsAppLang.value = val;
        updateSettingsDropdownUI(
          settingsDefaultView?.value || "grid",
          settingsItemsPerPage?.value || "24",
          val
        );
        closeSettingsMenus();
      });
    });
  }

  if (viewBtn && viewMenu) {
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = viewMenu.classList.contains("hidden");
      closeSettingsMenus();
      if (isHidden) {
        viewMenu.classList.remove("hidden");
        viewWrap?.classList.add("open");
        viewBtn.setAttribute("aria-expanded", "true");
      }
    });

    viewMenu.querySelectorAll(".sort-option").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = opt.dataset.value;
        if (settingsDefaultView) settingsDefaultView.value = val;
        updateSettingsDropdownUI(
          val,
          settingsItemsPerPage?.value || "24",
          settingsAppLang?.value || "cs"
        );
        closeSettingsMenus();
      });
    });
  }

  if (perPageBtn && perPageMenu) {
    perPageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = perPageMenu.classList.contains("hidden");
      closeSettingsMenus();
      if (isHidden) {
        perPageMenu.classList.remove("hidden");
        perPageWrap?.classList.add("open");
        perPageBtn.setAttribute("aria-expanded", "true");
      }
    });

    perPageMenu.querySelectorAll(".sort-option").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = opt.dataset.value;
        if (settingsItemsPerPage) settingsItemsPerPage.value = val;
        updateSettingsDropdownUI(
          settingsDefaultView?.value || "grid",
          val,
          settingsAppLang?.value || "cs"
        );
        closeSettingsMenus();
      });
    });
  }

  document.addEventListener("click", (e) => {
    if (
      langWrap && !langWrap.contains(e.target) &&
      viewWrap && !viewWrap.contains(e.target) &&
      perPageWrap && !perPageWrap.contains(e.target)
    ) {
      closeSettingsMenus();
    }
  });
}

function updateWebpQualityProgress(val) {
  if (!settingsWebpQuality) return;
  const num = Number(val) || 88;
  const min = Number(settingsWebpQuality.min) || 70;
  const max = Number(settingsWebpQuality.max) || 98;
  const pct = Math.max(0, Math.min(100, ((num - min) / (max - min)) * 100));
  settingsWebpQuality.style.setProperty("--range-progress", `${pct.toFixed(1)}%`);
}

// ==========================================================================
// Modál: Nastavení aplikace
// ==========================================================================
function openSettingsModal() {
  const savedLang = (window.i18n && window.i18n.getLanguage()) || "cs";
  const savedView = localStorage.getItem("tracker_default_view_mode") || "grid";
  const savedPerPage = localStorage.getItem("tracker_items_per_page") || "24";

  if (settingsAppLang) settingsAppLang.value = savedLang;
  settingsDefaultView.value = savedView;
  settingsItemsPerPage.value = savedPerPage;

  if (window.i18n) {
    window.i18n.applyTranslations(settingsModal);
  }

  updateSettingsDropdownUI(savedView, savedPerPage, savedLang);
  refreshSettingsStorageInfo();
  if (settingsTmdbApiKey) {
    settingsTmdbApiKey.value = sanitizeApiKey(localStorage.getItem("tracker_tmdb_api_key") || "");
  }
  if (settingsRawgApiKey) {
    settingsRawgApiKey.value = sanitizeApiKey(localStorage.getItem("tracker_rawg_api_key") || "");
  }
  const savedQuality = localStorage.getItem("tracker_webp_quality") || "88";
  if (settingsWebpQuality) {
    settingsWebpQuality.value = savedQuality;
    updateWebpQualityProgress(savedQuality);
  }
  if (settingsWebpQualityVal) {
    settingsWebpQualityVal.textContent = `${savedQuality} %`;
  }

  settingsModal.classList.remove("hidden");
  updateModalBodyLock();
}

function closeSettingsModal() {
  settingsModal.classList.add("hidden");
  updateModalBodyLock();
}

function handleSaveSettings() {
  const newLang = settingsAppLang ? settingsAppLang.value : (window.i18n ? window.i18n.getLanguage() : "cs");
  const newView = settingsDefaultView.value;
  const newItemsPerPage = settingsItemsPerPage.value;

  if (window.i18n) {
    window.i18n.setLanguage(newLang);
  }

  localStorage.setItem("tracker_default_view_mode", newView);
  localStorage.setItem("tracker_items_per_page", newItemsPerPage);

  if (settingsWebpQuality) {
    localStorage.setItem("tracker_webp_quality", settingsWebpQuality.value);
  }

  if (settingsTmdbApiKey) {
    let key = sanitizeApiKey(settingsTmdbApiKey.value);
    settingsTmdbApiKey.value = key;
    localStorage.setItem("tracker_tmdb_api_key", key);
    if (tmdbApiKeyInput) tmdbApiKeyInput.value = key;
    updateTmdbKeyBadge();
  }

  if (settingsRawgApiKey) {
    let rawgKey = sanitizeApiKey(settingsRawgApiKey.value);
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
  showToast(window.i18n ? window.i18n.t("settings.savedToast") : "Nastavení bylo úspěšně uloženo.");
}

async function handleOpenDataFolder() {
  try {
    await tauriInvoke("open_data_folder");
    const msg = window.i18n ? window.i18n.t("settings.openDataFolderToast") : "Otevírám složku s daty aplikace v Průzkumníku...";
    showToast(msg);
  } catch (err) {
    console.error("Chyba při otevírání složky:", err);
    const prefix = window.i18n ? window.i18n.t("settings.openDataFolderErrorToast") : "Nepodařilo se otevřít složku: ";
    showToast(prefix + err);
  }
}

async function handleClearTempFiles() {
  try {
    const deletedCount = await tauriInvoke("clear_temp_files");
    if (deletedCount > 0) {
      const msg = window.i18n
        ? window.i18n.t("settings.tempClearedToast", { count: deletedCount })
        : `Dočasné soubory byly vyčištěny (smazáno: ${deletedCount}).`;
      showToast(msg);
    } else {
      const msg = window.i18n
        ? window.i18n.t("settings.tempAlreadyEmptyToast")
        : "Složka dočasných souborů je již prázdná.";
      showToast(msg);
    }
    await refreshSettingsStorageInfo();
  } catch (err) {
    console.error("Chyba při čištění dočasných souborů:", err);
    const prefix = window.i18n
      ? window.i18n.t("settings.tempClearErrorToast")
      : "Nepodařilo se vyčistit dočasné soubory: ";
    showToast(prefix + err);
  }
}

// Hromadná optimalizace stávající knihovny: převede všechny obrázky do WebP (500x750)
async function handleOptimizeExistingCovers() {
  const itemsToOptimize = allItems.filter(
    (item) => item.image_data && !item.image_data.toLowerCase().endsWith(".webp")
  );

  if (itemsToOptimize.length === 0) {
    showToast(window.i18n ? window.i18n.t("settings.allCoversWebpToast") : "Všechny vaše obálky již jsou v moderním formátu WebP (500×750 px).");
    return;
  }

  const title = window.i18n ? window.i18n.t("settings.optimizeConfirmTitle") : "Optimalizovat stávající obálky";
  const message = window.i18n
    ? window.i18n.t("settings.optimizeConfirmMsg", { count: itemsToOptimize.length })
    : `Nalezeno ${itemsToOptimize.length} obálek ke konverzi. Obrázky budou oříznuty na poměr 2:3, zmenšeny na zlatý střed 500×750 px a převedeny na WebP. Ušetří se místo na disku a zrychlí načítání. Chcete pokračovat?`;
  const confirmText = window.i18n ? window.i18n.t("settings.optimizeConfirmOk") : "Ano, optimalizovat";
  const cancelText = window.i18n ? window.i18n.t("settings.optimizeConfirmCancel") : "Zrušit";

  const confirmed = await showConfirmDialog({
    title,
    message,
    confirmText,
    cancelText,
  });

  if (!confirmed) return;

  if (optimizeCoversBtn) optimizeCoversBtn.disabled = true;
  showToast(window.i18n ? window.i18n.t("settings.optimizingToast", { count: itemsToOptimize.length }) : `Zahajuji optimalizaci ${itemsToOptimize.length} obálek...`);

  let successCount = 0;
  for (let i = 0; i < itemsToOptimize.length; i++) {
    const item = itemsToOptimize[i];
    try {
      const coverUrl = getCoverUrl(item.image_data);
      const optimized = await processAndOptimizeImageToWebP(coverUrl);

      const payload = {
        id: item.id,
        itemType: item.item_type,
        title: item.title,
        releaseYear: item.release_year,
        genre: item.genre || "",
        tags: item.tags || "",
        description: item.description || "",
        rating: item.rating,
        apiRating: item.api_rating,
        note: item.note || "",
        director: item.director || "",
        writer: item.writer || "",
        castMembers: item.cast_members || "",
        production: item.production || "",
        duration: item.duration || "",
        seasonEpisodes: item.season_episodes || "",
        developer: item.developer || "",
        publisher: item.publisher || "",
        gameMode: item.game_mode || "",
        platforms: item.platforms || "",
        engine: item.engine || "",
        customMetadata: item.custom_metadata || {},
        status: item.status || "completed",
        trailerUrl: item.trailer_url || "",
        imageSourcePath: optimized.filePath,
        removeImage: false,
      };

      const updated = await tauriInvoke("update_item", { item: payload });
      const idx = allItems.findIndex((it) => it.id === item.id);
      if (idx !== -1) {
        allItems[idx] = updated;
      }
      successCount++;
    } catch (err) {
      console.warn(`Optimalizace položky "${item.title}" selhala:`, err);
    }
  }

  if (optimizeCoversBtn) optimizeCoversBtn.disabled = false;
  renderGrid();
  await refreshSettingsStorageInfo();
  showToast(window.i18n ? window.i18n.t("settings.optimizedDoneToast", { success: successCount, total: itemsToOptimize.length }) : `Hotovo! Převedeno a zmenšeno ${successCount} z ${itemsToOptimize.length} obálek do WebP.`);
}

function handleExportData() {
  try {
    const jsonStr = JSON.stringify(allItems, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const isEn = window.i18n && window.i18n.getLanguage() === "en";
    const prefix = isEn ? "tracker-backup-" : "tracker-zaloha-";
    const fileName = `${prefix}${new Date().toISOString().slice(0, 10)}.json`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    const toastMsg = window.i18n
      ? window.i18n.t("settings.exportSuccessToast", { fileName })
      : `Záloha "${fileName}" byla stažena do složky Downloads.`;
    showToast(toastMsg);
  } catch (err) {
    console.error("Chyba při exportu dat:", err);
    const prefix = window.i18n
      ? window.i18n.t("settings.exportErrorToast")
      : "Nepodařilo se exportovat zálohu: ";
    showToast(prefix + err);
  }
}

// ==========================================================================
// Kontrola aktualizací z GitHub Releases API
// ==========================================================================
function compareSemver(v1, v2) {
  if (!v1 || !v2) return 0;
  const p1 = v1.toString().replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const p2 = v2.toString().replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

async function handleCheckForUpdates(manual = true) {
  if (isCheckingUpdate) return;
  isCheckingUpdate = true;

  const checkBtn = document.getElementById("checkUpdateBtn");
  const checkIcon = document.getElementById("checkUpdateIcon");
  const checkBtnText = document.getElementById("checkUpdateBtnText");
  const downloadBtn = document.getElementById("downloadUpdateBtn");
  const notesBtn = document.getElementById("viewReleaseNotesBtn");
  const statusText = document.getElementById("updateStatusText");
  const badgeStatus = document.getElementById("updateBadgeStatus");

  if (checkBtn) checkBtn.disabled = true;
  if (checkIcon) checkIcon.classList.add("spin-animation");
  if (checkBtnText) {
    checkBtnText.textContent = window.i18n ? window.i18n.t("settings.checkingUpdates") : "Ověřuji...";
  }
  if (statusText) {
    statusText.textContent = window.i18n
      ? (window.i18n.getLanguage() === "en" ? "Checking for updates on GitHub..." : "Zjišťuji dostupnost nové verze na GitHubu...")
      : "Zjišťuji dostupnost nové verze na GitHubu...";
  }

  try {
    let release = null;

    // 1. Primárně zkusíme spolehlivé volání přes Tauri backend (s User-Agent a webovým fallbackem bez rate limitu)
    try {
      const raw = await tauriInvoke("check_github_update_ipc");
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (parsed && parsed.tag_name) {
          release = parsed;
        }
      }
    } catch (ipcErr) {
      console.warn("Tauri check_github_update_ipc selhalo nebo není v aktuálním buildu:", ipcErr);
    }

    // 2. Přímý fetch přes GitHub REST API
    if (!release) {
      try {
        const res = await fetch(GITHUB_REPO_API, {
          headers: { Accept: "application/vnd.github.v3+json" },
          cache: "no-cache",
        });

        if (res.ok) {
          release = await res.json();
        } else if (res.status === 403 || res.status === 429) {
          console.warn("GitHub REST API rate limit vyčerpán (403/429), přepínám na CDN fallback...");
        }
      } catch (fetchErr) {
        console.warn("Přímý fetch na GitHub API selhal:", fetchErr);
      }
    }

    // 3. Spolehlivý CDN fallback přes raw.githubusercontent.com (má CORS * a nepodléhá limitu 60 req/hod)
    if (!release) {
      try {
        const rawRes = await fetch(
          "https://raw.githubusercontent.com/TheMichalBr/tracker/main/src-tauri/tauri.conf.json",
          { cache: "no-cache" }
        );
        if (rawRes.ok) {
          const conf = await rawRes.json();
          if (conf && conf.version) {
            const cleanVer = String(conf.version).trim().replace(/^v/i, "");
            const tag = `v${cleanVer}`;
            release = {
              tag_name: tag,
              name: `Tracker ${tag}`,
              html_url: `https://github.com/TheMichalBr/tracker/releases/tag/${tag}`,
              assets: [
                {
                  name: `Tracker_${cleanVer}_x64_en-US.msi`,
                  browser_download_url: `https://github.com/TheMichalBr/tracker/releases/download/${tag}/Tracker_${cleanVer}_x64_en-US.msi`,
                },
                {
                  name: `Tracker_${cleanVer}_x64-setup.exe`,
                  browser_download_url: `https://github.com/TheMichalBr/tracker/releases/download/${tag}/Tracker_${cleanVer}_x64-setup.exe`,
                },
              ],
            };
          }
        }
      } catch (cdnErr) {
        console.warn("CDN raw.githubusercontent.com fallback selhal:", cdnErr);
      }
    }

    if (!release || !release.tag_name) {
      throw new Error("UPDATE_CHECK_FAILED");
    }

    latestReleaseData = release;
    const latestTag = release.tag_name || "";
    const isNewer = compareSemver(latestTag, APP_VERSION) > 0;

    if (badgeStatus) {
      badgeStatus.classList.remove("hidden");
    }

    if (isNewer) {
      // Nová verze k dispozici
      const updateRow = document.getElementById("settingsUpdateRow");
      if (updateRow) updateRow.classList.add("has-update");

      if (badgeStatus) {
        badgeStatus.className = "update-status-pill new-available";
        badgeStatus.textContent = latestTag;
      }
      if (statusText) {
        statusText.innerHTML = window.i18n
          ? window.i18n.t("settings.updateAvailableStatus", { version: latestTag })
          : `Je k dispozici nová verze: <strong>${latestTag}</strong>!`;
      }
      if (downloadBtn) {
        downloadBtn.classList.remove("hidden");
      }
      if (notesBtn) {
        notesBtn.classList.remove("hidden");
      }
      // Načtení a zobrazení seznamu změn z commitů pro novou verzi
      fetchAndDisplayChangelog(latestTag);

      if (manual) {
        const toastMsg = window.i18n
          ? window.i18n.t("settings.newVersionToast", { version: latestTag })
          : `Byla nalezena nová verze aplikace Tracker (${latestTag})!`;
        showToast(toastMsg);
      }
    } else {
      // Aktuální verze
      const updateRow = document.getElementById("settingsUpdateRow");
      if (updateRow) updateRow.classList.remove("has-update");

      const changelogBox = document.getElementById("updateChangelogBox");
      if (changelogBox) changelogBox.classList.add("hidden");

      if (badgeStatus) {
        badgeStatus.className = "update-status-pill up-to-date";
        const isEn = window.i18n && window.i18n.getLanguage() === "en";
        badgeStatus.textContent = isEn ? "✓ Latest" : "✓ Aktuální";
      }
      if (statusText) {
        statusText.textContent = window.i18n
          ? window.i18n.t("settings.upToDateStatus", { version: `v${APP_VERSION}` })
          : `Máte nejnovější verzi aplikace (v${APP_VERSION}).`;
      }
      if (downloadBtn) {
        downloadBtn.classList.add("hidden");
      }
      if (notesBtn) {
        notesBtn.classList.add("hidden");
      }
      if (manual) {
        const toastMsg = window.i18n
          ? window.i18n.t("settings.upToDateToast", { version: `v${APP_VERSION}` })
          : `Používáte nejnovější verzi (v${APP_VERSION}).`;
        showToast(toastMsg);
      }
    }
  } catch (err) {
    console.warn("Chyba při kontrole aktualizací:", err);
    const updateRow = document.getElementById("settingsUpdateRow");
    if (updateRow) updateRow.classList.remove("has-update");

    const changelogBox = document.getElementById("updateChangelogBox");
    if (changelogBox) changelogBox.classList.add("hidden");

    const isRateLimit = String(err?.message || "").includes("RATE_LIMIT") || String(err || "").includes("403");
    const isEn = window.i18n && window.i18n.getLanguage() === "en";

    if (badgeStatus) {
      badgeStatus.className = "update-status-pill error";
      badgeStatus.textContent = isRateLimit ? (isEn ? "Rate limit" : "Limit API") : (isEn ? "Offline" : "Chyba");
      badgeStatus.classList.remove("hidden");
    }
    if (statusText) {
      if (isRateLimit) {
        statusText.textContent = window.i18n
          ? window.i18n.t("settings.rateLimitError")
          : "Byl dočasně vyčerpán limit GitHub API (60 dotazů/hod). Zkuste to prosím za chvíli.";
      } else {
        statusText.textContent = window.i18n
          ? window.i18n.t("settings.updateCheckError")
          : "Nepodařilo se ověřit aktualizace. Zkontrolujte připojení k internetu.";
      }
    }
    if (manual) {
      const errMsg = isRateLimit
        ? (window.i18n ? window.i18n.t("settings.rateLimitError") : "Byl dočasně vyčerpán limit GitHub API.")
        : (window.i18n ? window.i18n.t("settings.updateCheckError") : "Nepodařilo se ověřit aktualizace.");
      showToast(errMsg);
    }
  } finally {
    isCheckingUpdate = false;
    if (checkIcon) checkIcon.classList.remove("spin-animation");
    if (checkBtn) checkBtn.disabled = false;
    if (checkBtnText) {
      checkBtnText.textContent = window.i18n
        ? window.i18n.t("settings.checkAgainBtn")
        : "Zkontrolovat znovu";
    }
  }
}

function handleDownloadUpdate() {
  if (!latestReleaseData) return;
  // Pokusíme se najít přímý instalátor: prioritně .msi balíček, poté .exe jako fallback
  if (Array.isArray(latestReleaseData.assets) && latestReleaseData.assets.length > 0) {
    const setupAsset =
      latestReleaseData.assets.find((a) => a.name && (a.name.toLowerCase().endsWith(".msi") || a.name.toLowerCase().endsWith("-setup.msi"))) ||
      latestReleaseData.assets.find((a) => a.name && (a.name.toLowerCase().endsWith("-setup.exe") || a.name.toLowerCase().endsWith(".exe"))) ||
      latestReleaseData.assets[0];

    if (setupAsset && setupAsset.browser_download_url) {
      openExternalUrl(setupAsset.browser_download_url);
      return;
    }
  }

  // Fallback: otevření stránky vydání na GitHubu
  if (latestReleaseData.html_url) {
    openExternalUrl(latestReleaseData.html_url);
  }
}

/**
 * Načte a zobrazí seznam změn (commit zprávy / release notes) pro novou verzi
 */
async function fetchAndDisplayChangelog(latestTag) {
  const changelogBox = document.getElementById("updateChangelogBox");
  const changelogList = document.getElementById("updateChangelogList");
  if (!changelogBox || !changelogList) return;

  changelogBox.classList.remove("hidden");
  const loadingText = window.i18n ? window.i18n.t("settings.changelogLoading") : "Načítám přehled změn...";
  changelogList.innerHTML = `<li class="settings-changelog-empty">${escapeHtml(loadingText)}</li>`;

  const cleanCurrent = APP_VERSION.replace(/^v/i, "").trim();
  const cleanLatest = (latestTag || "").replace(/^v/i, "").trim();

  const commitMessages = [];

  // Pomocná funkce pro filtraci a očištění řádků poznámek k verzi
  function processNoteLines(lines) {
    if (!Array.isArray(lines) || lines.length === 0) return;
    // První řádek je obvykle hlavní summary/název verze (např. "v1.0.12 - Tracker"), samotné poznámky začínají od 2. řádku
    const noteLines = lines.length > 1 ? lines.slice(1) : lines;
    for (const line of noteLines) {
      if (/^merge (branch|pull request)/i.test(line)) continue;
      // Přeskočíme případné samostatné řádky s verzí
      if (/^v?\d+(\.\d+)+(\s*[-–—:]\s*tracker|\s*[-–—:]|\s*$)/i.test(line)) continue;
      const cleanLine = line.replace(/^[-*•#]\s*/, "").trim();
      if (cleanLine && !commitMessages.includes(cleanLine)) {
        commitMessages.push(cleanLine);
      }
    }
  }

  // 1. Zkusíme GitHub Compare API mezi aktuální a novou verzí
  try {
    const compareUrl = `https://api.github.com/repos/TheMichalBr/tracker/compare/v${cleanCurrent}...v${cleanLatest}`;
    const compRes = await fetch(compareUrl, {
      headers: { Accept: "application/vnd.github.v3+json" },
      cache: "no-cache",
    });

    if (compRes.ok) {
      const compData = await compRes.json();
      if (Array.isArray(compData.commits) && compData.commits.length > 0) {
        for (const c of compData.commits) {
          const rawMsg = c.commit?.message || "";
          if (!rawMsg) continue;
          const lines = rawMsg.split("\n").map((l) => l.trim()).filter(Boolean);
          processNoteLines(lines);
        }
      }
    }
  } catch (err) {
    console.warn("Chyba při stahování commitů z Compare API:", err);
  }

  // 2. Fallback: pokud Compare API nic nevrátilo, zkusíme Release body z GitHub Release
  if (commitMessages.length === 0 && latestReleaseData?.body) {
    const rawBody = latestReleaseData.body.trim();
    if (rawBody && !rawBody.includes("Automatically generated release of the Tracker app")) {
      const lines = rawBody.split("\n").map((l) => l.trim()).filter(Boolean);
      processNoteLines(lines);
    }
  }

  // 3. Vykreslení nalezených změn
  changelogList.innerHTML = "";
  if (commitMessages.length > 0) {
    const maxItems = commitMessages.slice(0, 12);
    maxItems.forEach((msg) => {
      const li = document.createElement("li");
      li.className = "settings-changelog-item";
      li.innerHTML = `<span class="settings-changelog-bullet">•</span><span>${escapeHtml(msg)}</span>`;
      changelogList.appendChild(li);
    });
  } else {
    const emptyText = window.i18n ? window.i18n.t("settings.changelogEmpty") : "Podrobnosti o změnách nebyly nalezeny.";
    changelogList.innerHTML = `<li class="settings-changelog-empty">${escapeHtml(emptyText)}</li>`;
  }
}

/**
 * Načte aktuální verzi aplikace z Rust backendu (Cargo.toml) a synchronizuje ji do celého UI
 */
async function syncAppVersion() {
  try {
    const v = await tauriInvoke("get_app_version");
    if (v && typeof v === "string") {
      const cleanVer = v.replace(/^v/i, "").trim();
      if (cleanVer) {
        APP_VERSION = cleanVer;

        const splashBadge = document.querySelector(".splash-badge");
        if (splashBadge && splashBadge.textContent !== `v${APP_VERSION}`) {
          splashBadge.textContent = `v${APP_VERSION}`;
        }

        document.querySelectorAll(".version-tag").forEach((el) => {
          if (el.textContent !== `v${APP_VERSION}`) el.textContent = `v${APP_VERSION}`;
        });

        const settingsVer = document.getElementById("settingsCurrentVersion");
        if (settingsVer && settingsVer.textContent !== `v${APP_VERSION}`) {
          settingsVer.textContent = `v${APP_VERSION}`;
        }
      }
    }
  } catch (err) {
    // Tichý fallback na výchozí verzi (např. při spuštění v čistém webovém prohlížeči)
  }
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

    const emptyIconBox = document.getElementById("emptyIconBox");
    const emptyTitle = document.getElementById("emptyStateTitle");
    const emptyText = document.getElementById("emptyStateText");
    const emptyBtnText = document.getElementById("emptyBtnText");
    const emptyBtnIcon = document.getElementById("emptyBtnIcon");
    const isEn = window.i18n && window.i18n.getLanguage() === "en";

    if (searchQuery) {
      // Stav 1: Hledání nenašlo žádné výsledky
      if (emptyIconBox) {
        emptyIconBox.innerHTML = `
          <svg class="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11" stroke-dasharray="2 2"></line>
          </svg>
        `;
      }
      if (emptyTitle) {
        emptyTitle.textContent = window.i18n
          ? window.i18n.t("main.emptyNoSearchMatchTitle")
          : (isEn ? "No matching results found" : "Nebyly nalezeny žádné výsledky");
      }
      if (emptyText) {
        emptyText.textContent = window.i18n
          ? window.i18n.t("main.emptyNoSearchMatch", { query: searchQuery })
          : (isEn
              ? `No records match search query "${searchQuery}". Check for typos or try a different term.`
              : `Hledanému výrazu „${searchQuery}“ neodpovídá žádný záznam. Zkontrolujte překlepy nebo zkuste obecnější výraz.`);
      }
      if (emptyBtnText) {
        emptyBtnText.textContent = window.i18n
          ? window.i18n.t("main.emptyClearSearchBtn")
          : (isEn ? "Clear search" : "Zrušit hledání");
      }
      if (emptyBtnIcon) {
        emptyBtnIcon.innerHTML = `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`;
      }
    } else if (allItems.length > 0) {
      // Stav 2: Filtr (např. kategorie nebo stav) nemá v databázi žádnou položku
      if (emptyIconBox) {
        emptyIconBox.innerHTML = `
          <svg class="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        `;
      }
      if (emptyTitle) {
        emptyTitle.textContent = window.i18n
          ? window.i18n.t("main.emptyFilterTitle")
          : (isEn ? "No items in this category" : "Žádné položky v této kategorii");
      }
      if (emptyText) {
        emptyText.textContent = window.i18n
          ? window.i18n.t("main.emptyFilterText")
          : (isEn
              ? "There are currently no items matching your selected filter."
              : "Ve vybraném filtru se momentálně nenachází žádný záznam.");
      }
      if (emptyBtnText) {
        emptyBtnText.textContent = window.i18n
          ? window.i18n.t("main.emptyAddNewBtn")
          : (isEn ? "Add new item" : "Přidat nový záznam");
      }
      if (emptyBtnIcon) {
        emptyBtnIcon.innerHTML = `<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>`;
      }
    } else {
      // Stav 3: Databáze je zcela prázdná
      if (emptyIconBox) {
        emptyIconBox.innerHTML = `
          <svg class="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="6" width="20" height="15" rx="3"></rect>
            <path d="M2 10.5h20"></path>
            <path d="m6 6 2.5 4.5"></path>
            <path d="m11 6 2.5 4.5"></path>
            <path d="m16 6 2.5 4.5"></path>
            <circle cx="12" cy="15.5" r="2.5" fill="currentColor" fill-opacity="0.25"></circle>
          </svg>
        `;
      }
      if (emptyTitle) {
        emptyTitle.textContent = window.i18n
          ? window.i18n.t("main.emptyInitialTitle")
          : (isEn ? "Your collection is currently empty" : "Vaše sbírka je zatím prázdná");
      }
      if (emptyText) {
        emptyText.textContent = window.i18n
          ? window.i18n.t("main.emptyInitialText")
          : (isEn
              ? "You haven't added any movies, series, or games yet. Start building your collection by clicking the button below."
              : "Zatím jste nepřidali žádný film, seriál ani hru. Začněte tvořit svou sbírku kliknutím na tlačítko níže.");
      }
      if (emptyBtnText) {
        emptyBtnText.textContent = window.i18n
          ? window.i18n.t("main.emptyAddFirstBtn")
          : (isEn ? "Add first item" : "Přidat první záznam");
      }
      if (emptyBtnIcon) {
        emptyBtnIcon.innerHTML = `<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>`;
      }
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
      const directorPrefix = window.i18n ? window.i18n.t("main.directorPrefix", {}, "Režie:") : "Režie:";
      const developerPrefix = window.i18n ? window.i18n.t("main.developerPrefix", {}, "Studio:") : "Studio:";

      const rawTitle = item.title || "";
      const truncatedTitleShort = rawTitle.length > 40 ? `${rawTitle.slice(0, 40)}...` : rawTitle;

      const rawCreator = item.director ? item.director : item.developer ? item.developer : "";
      const truncatedCreator = rawCreator.length > 30 ? `${rawCreator.slice(0, 30)}...` : rawCreator;
      const fullCreatorInfo = item.director
        ? `${directorPrefix} ${item.director}`
        : item.developer
        ? `${developerPrefix} ${item.developer}`
        : "—";
      const displayCreatorInfo = item.director
        ? `${directorPrefix} ${escapeHtml(truncatedCreator)}`
        : item.developer
        ? `${developerPrefix} ${escapeHtml(truncatedCreator)}`
        : "—";

      const rawGenre = item.genre || "";
      const truncatedGenre = rawGenre.length > 25 ? `${rawGenre.slice(0, 25)}...` : rawGenre;

      const typeLabel = getItemTypeLabel(item.item_type);
      const detailBtnText = window.i18n ? window.i18n.t("main.btnDetail", {}, "Detail") : "Detail";
      
      card.innerHTML = `
        <div class="card-poster">${posterHtml}</div>
        <div class="card-content">
          <div class="list-col-main">
            <h3 class="card-title" title="${escapeHtml(rawTitle)}">
              <span class="title-full">${escapeHtml(rawTitle)}</span>
              <span class="title-short">${escapeHtml(truncatedTitleShort)}</span>
            </h3>
            <span class="card-year">${item.release_year || "—"}</span>
          </div>

          <div class="list-col-type">
            <span class="card-type-badge type-${escapeHtml(item.item_type)}">${typeIcon} ${escapeHtml(typeLabel)}</span>
          </div>

          <div class="list-col-genre">
            ${rawGenre ? `<span class="genre-tag" title="${escapeHtml(rawGenre)}">${escapeHtml(truncatedGenre)}</span>` : `<span class="text-dim">—</span>`}
          </div>

          <div class="list-col-creator" title="${escapeHtml(fullCreatorInfo)}">
            ${displayCreatorInfo}
          </div>

          <div class="list-col-ratings">
            ${item.rating !== null && item.rating !== undefined && item.rating >= 0 ? `<span class="card-rating-badge">${SVG_ICONS.star} ${item.rating}</span>` : ""}
            ${item.api_rating !== null && item.api_rating !== undefined ? `<span class="card-api-badge">${SVG_ICONS.api} ${item.api_rating}</span>` : ""}
          </div>

          <div class="list-col-action">
            <button type="button" class="btn-list-view">${detailBtnText}</button>
          </div>
        </div>
      `;
    } else {
      // Rozvržení: Dlaždice (Grid) nebo Kompaktní (Compact)
      const typeLabel = getItemTypeLabel(item.item_type);
      const detailHintText = window.i18n ? window.i18n.t("main.viewDetailHint", {}, "Zobrazit detail") : "Zobrazit detail";

      card.innerHTML = `
        <div class="card-poster">
          ${posterHtml}
          <div class="card-top-badges">
            <span class="card-type-badge type-${escapeHtml(item.item_type)}" title="${escapeHtml(typeLabel)}">${typeIcon}<span class="card-type-label">${escapeHtml(typeLabel)}</span></span>
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
            <span>${detailHintText}</span>
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
  paginationInfo.textContent = window.i18n
    ? window.i18n.t("main.paginationInfo", { start: startIdx + 1, end: endIdx, total: totalCount })
    : `Zobrazeno ${startIdx + 1}–${endIdx} z ${totalCount} záznamů`;

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
  let key = tmdbApiKeyInput?.value || localStorage.getItem("tracker_tmdb_api_key") || "";
  return sanitizeApiKey(key);
}

function getCleanRawgKey() {
  let key = rawgApiKeyInput?.value || localStorage.getItem("tracker_rawg_api_key") || "";
  return sanitizeApiKey(key);
}

let currentImportAbortController = null;
let isImportInProgress = false;

function resetAllApiResultButtons() {
  const defaultBtnText = window.i18n ? window.i18n.t("apiModal.selectAndPrefillBtn") : "Vybrat a předvyplnit";
  document.querySelectorAll(".tmdb-select-btn, .rawg-select-btn").forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("btn-import-success");
    if (
      btn.innerHTML.includes("tmdb-spinner") ||
      btn.innerHTML.includes("✓") ||
      btn.innerText.includes("Stahuji") ||
      btn.innerText.includes("Načítám") ||
      btn.innerText.includes("Loading") ||
      btn.innerText.includes("Downloading")
    ) {
      btn.innerHTML = `<span>${escapeHtml(defaultBtnText)}</span>`;
    }
  });
  isImportInProgress = false;
}

function openTmdbModal(defaultProvider = null) {
  resetAllApiResultButtons();
  const savedKey = sanitizeApiKey(localStorage.getItem("tracker_tmdb_api_key") || "");
  if (tmdbApiKeyInput) tmdbApiKeyInput.value = savedKey;
  updateTmdbKeyBadge();

  const savedRawgKey = sanitizeApiKey(localStorage.getItem("tracker_rawg_api_key") || "");
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
    if (titleEl) {
      const baseTitle = window.i18n ? window.i18n.t("apiModal.headerTitle") : "Přidat pomocí online API";
      titleEl.textContent = `${baseTitle} (RAWG.io)`;
    }
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
    if (titleEl) {
      const baseTitle = window.i18n ? window.i18n.t("apiModal.headerTitle") : "Přidat pomocí online API";
      titleEl.textContent = `${baseTitle} (TMDB)`;
    }
    setTimeout(() => {
      if (savedKey) tmdbQueryInput?.focus();
      else tmdbApiKeyInput?.focus();
    }, 60);
  }

  tmdbModal.classList.remove("hidden");
  updateModalBodyLock();
}

function closeTmdbModal() {
  if (isImportInProgress && currentImportAbortController) {
    try {
      currentImportAbortController.abort();
    } catch (_) {}
    currentImportAbortController = null;
    isImportInProgress = false;
    showToast(window.i18n ? window.i18n.t("apiModal.downloadCancelled") : "Stahování z online databáze bylo zrušeno.");
  }
  resetAllApiResultButtons();
  tmdbModal.classList.add("hidden");
  updateModalBodyLock();
}

function updateTmdbKeyBadge() {
  if (!tmdbKeyBadge) return;
  const key = getCleanTmdbKey();
  if (key) {
    tmdbKeyBadge.textContent = window.i18n ? window.i18n.t("apiModal.keySaved") : "✓ Klíč uložen";
    tmdbKeyBadge.className = "tmdb-key-badge badge-saved";
  } else {
    tmdbKeyBadge.textContent = window.i18n ? window.i18n.t("apiModal.keyMissing") : "Klíč nezadán";
    tmdbKeyBadge.className = "tmdb-key-badge badge-missing";
  }
}

async function executeTmdbSearch() {
  const key = getCleanTmdbKey();
  if (!key) {
    showToast(window.i18n ? window.i18n.t("apiModal.promptEnterTmdbKey") : "Nejprve prosím vložte váš TMDB API klíč.");
    tmdbApiKeyInput?.focus();
    return;
  }

  // Automaticky klíč uložíme do úložiště a zosynchronizujeme
  localStorage.setItem("tracker_tmdb_api_key", key);
  if (tmdbApiKeyInput) tmdbApiKeyInput.value = key;
  if (settingsTmdbApiKey) settingsTmdbApiKey.value = key;
  updateTmdbKeyBadge();

  const query = sanitizeApiQuery(tmdbQueryInput ? tmdbQueryInput.value.trim() : "");
  if (tmdbQueryInput) tmdbQueryInput.value = query;
  if (!query) {
    showToast(window.i18n ? window.i18n.t("apiModal.promptEnterMovieQuery") : "Zadejte název díla pro vyhledání.");
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
      const noResTitle = window.i18n ? window.i18n.t("apiModal.noResultsFoundTitle") : "Nebyly nalezeny žádné výsledky";
      const noResSub = window.i18n ? window.i18n.t("apiModal.noMoviesFoundSub", { query }) : `Pro dotaz "${escapeHtml(query)}" nebyly nalezeny žádné tituly. Zkuste jiný výraz nebo přepnout filtr typu.`;
      tmdbResultsArea.innerHTML = `
        <div class="tmdb-placeholder-state">
          <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p class="tmdb-placeholder-title">${escapeHtml(noResTitle)}</p>
          <p class="tmdb-placeholder-sub">${escapeHtml(noResSub)}</p>
        </div>
      `;
      return;
    }

    renderTmdbResults(results);
  } catch (err) {
    console.error("Chyba vyhledávání TMDB:", err);
    const errTitle = window.i18n ? window.i18n.t("apiModal.tmdbErrorTitle") : "Chyba při komunikaci s TMDB";
    tmdbResultsArea.innerHTML = `
      <div class="tmdb-alert-card tmdb-alert-error">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div>
          <strong>${escapeHtml(errTitle)}</strong>
          <p style="margin-top: 4px;">${escapeHtml(err.message || String(err))}</p>
        </div>
      </div>
    `;
  }
}

function renderTmdbResults(results) {
  const countText = window.i18n
    ? window.i18n.t("apiModal.resultsCountMovies", { count: results.length })
    : `Nalezeno celkem <strong>${results.length}</strong> výsledků:`;
  let html = `<div class="tmdb-results-count">${countText}</div>`;

  results.forEach((item) => {
    const isTv = item.media_type === "tv" || (!item.title && !!item.name);
    const title = item.title || item.name || (window.i18n ? window.i18n.t("apiModal.untitled") : "Bez názvu");
    const originalTitle = item.original_title || item.original_name || "";
    const releaseDate = item.release_date || item.first_air_date || "";
    const year = releaseDate ? releaseDate.substring(0, 4) : "—";
    const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null;
    const overview = item.overview ? item.overview : (window.i18n ? window.i18n.t("apiModal.noOverview") : "Popis není k dispozici.");

    const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : null;
    const posterHtml = posterUrl
      ? `<img class="tmdb-result-poster" src="${posterUrl}" alt="${escapeHtml(title)}" draggable="false">`
      : `<div class="tmdb-result-poster-placeholder">${SVG_ICONS.eyeOff}</div>`;

    const origPrefix = window.i18n ? window.i18n.t("apiModal.origTitleLabel") : "Pův.:";
    const origFull = window.i18n ? window.i18n.t("apiModal.origTitleFull") : "Původní název:";
    const subTitleHtml = originalTitle && originalTitle !== title
      ? `<div class="tmdb-result-sub" title="${escapeHtml(origFull)} ${escapeHtml(originalTitle)}">${escapeHtml(origPrefix)} ${escapeHtml(originalTitle)}</div>`
      : "";

    const typeLabel = isTv
      ? (window.i18n ? window.i18n.t("form.typeSeries") : "Seriál")
      : (window.i18n ? window.i18n.t("form.typeFilm") : "Film");
    const selectBtnText = window.i18n ? window.i18n.t("apiModal.selectAndPrefillBtn") : "Vybrat a předvyplnit";

    html += `
      <div class="tmdb-result-card" data-tmdb-id="${item.id}" data-media-type="${isTv ? "tv" : "movie"}">
        ${posterHtml}
        <div class="tmdb-result-info">
          <div class="tmdb-result-top">
            <div class="tmdb-result-badges">
              <span class="tmdb-pill-badge ${isTv ? "tmdb-pill-tv" : ""}">${escapeHtml(typeLabel)}</span>
              <span class="tmdb-result-year">${year}</span>
            </div>
            ${rating !== null ? `<div class="tmdb-result-score">${SVG_ICONS.star} ${rating}</div>` : ""}
          </div>
          <div class="tmdb-result-title">${escapeHtml(title)}</div>
          ${subTitleHtml}
          <div class="tmdb-result-overview">${escapeHtml(overview)}</div>
          <div class="tmdb-result-actions">
            <button type="button" class="btn btn-primary tmdb-select-btn">
              <span>${escapeHtml(selectBtnText)}</span>
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
  if (currentImportAbortController) {
    try {
      currentImportAbortController.abort();
    } catch (_) {}
  }
  const abortCtrl = new AbortController();
  currentImportAbortController = abortCtrl;
  isImportInProgress = true;

  document.querySelectorAll(".tmdb-select-btn, .rawg-select-btn").forEach((b) => {
    b.disabled = true;
  });

  if (btn) {
    const loadingText = window.i18n ? window.i18n.t("apiModal.loadingDetails") : "Načítám...";
    btn.innerHTML = `<span class="tmdb-spinner-small"></span> ${escapeHtml(loadingText)}`;
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

    const res = await fetch(detailsUrl, { headers, signal: abortCtrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} při načítání podrobností`);

    const data = await res.json();
    if (abortCtrl.signal.aborted) return;

    // Fallback popisu v angličtině, pokud je český prázdný
    let overview = (data.overview || item.overview || "").trim();
    if (!overview && !abortCtrl.signal.aborted) {
      try {
        let enUrl = `https://api.themoviedb.org/3/${mediaType}/${item.id}?language=en-US`;
        if (!isJwt) enUrl += `&api_key=${encodeURIComponent(key)}`;
        const enRes = await fetch(enUrl, { headers, signal: abortCtrl.signal });
        if (enRes.ok) {
          const enData = await enRes.json();
          if (enData.overview) overview = enData.overview.trim();
        }
      } catch (e) {
        if (abortCtrl.signal.aborted) return;
        console.warn("Anglický fallback popisu selhal:", e);
      }
    }
    if (abortCtrl.signal.aborted) return;

    // Vyhledání YouTube traileru (v CZ nebo v EN)
    let trailerUrl = "";
    const czVideos = data.videos?.results || [];
    let trailer = czVideos.find((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));

    if (!trailer && !abortCtrl.signal.aborted) {
      try {
        let enVidUrl = `https://api.themoviedb.org/3/${mediaType}/${item.id}/videos?language=en-US`;
        if (!isJwt) enVidUrl += `&api_key=${encodeURIComponent(key)}`;
        const enVidRes = await fetch(enVidUrl, { headers, signal: abortCtrl.signal });
        if (enVidRes.ok) {
          const enVidData = await enVidRes.json();
          const enVideos = enVidData.results || [];
          trailer = enVideos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
                    enVideos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
                    enVideos.find((v) => v.site === "YouTube");
        }
      } catch (vidErr) {
        if (abortCtrl.signal.aborted) return;
        console.warn("Chyba při načítání traileru z TMDB:", vidErr);
      }
    }
    if (abortCtrl.signal.aborted) return;

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
    const ratingVal = data.vote_average ? Math.round(data.vote_average * 10) / 10 : 1;

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

    if (posterPath && !abortCtrl.signal.aborted) {
      if (btn) {
        const dlPosterText = window.i18n ? window.i18n.t("apiModal.downloadingPoster") : "Stahuji a optimalizuji obálku...";
        btn.innerHTML = `<span class="tmdb-spinner-small"></span> ${escapeHtml(dlPosterText)}`;
      }
      const fullPosterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
      try {
        const res = await tauriInvoke("download_and_save_image", { url: fullPosterUrl });
        if (abortCtrl.signal.aborted) return;
        if (res && res.image_path) {
          try {
            const optimized = await processAndOptimizeImageToWebP(getCoverUrl(res.image_path));
            if (abortCtrl.signal.aborted) return;
            savedImagePath = optimized.filePath;
            base64ImageData = optimized.dataUrl;
          } catch (optErr) {
            console.warn("Optimalizace TMDB plakátu selhala, použiji původní:", optErr);
            savedImagePath = res.image_path;
            base64ImageData = res.base64_data;
          }
        }
      } catch (rustErr) {
        if (abortCtrl.signal.aborted) return;
        console.warn("Stažení plakátu přes Rust selhalo, zkouším přímý fetch:", rustErr);
        try {
          const imgRes = await fetch(fullPosterUrl, { signal: abortCtrl.signal });
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            if (abortCtrl.signal.aborted) return;
            const blobUrl = URL.createObjectURL(blob);
            try {
              const optimized = await processAndOptimizeImageToWebP(blobUrl);
              if (abortCtrl.signal.aborted) return;
              savedImagePath = optimized.filePath;
              base64ImageData = optimized.dataUrl;
            } finally {
              URL.revokeObjectURL(blobUrl);
            }
          }
        } catch (fetchErr) {
          if (abortCtrl.signal.aborted) return;
          console.warn("Stažení plakátu přes fetch selhalo:", fetchErr);
        }
      }

      if (!base64ImageData && fullPosterUrl) {
        base64ImageData = fullPosterUrl;
        savedImagePath = fullPosterUrl;
      }
    }

    if (abortCtrl.signal.aborted) return;

    // UKONČENÍ / ÚSPĚŠNÉ DOKONČENÍ: Zobrazíme uživateli jasné potvrzení, že se vše úspěšně stáhlo
    if (btn) {
      btn.classList.add("btn-import-success");
      btn.innerHTML = window.i18n ? window.i18n.t("apiModal.allDownloaded") : "✓ Vše staženo!";
    }

    // Krátká prodleva, aby uživatel viděl potvrzení dokončení před otevřením formuláře
    await new Promise((r) => setTimeout(r, 450));
    if (abortCtrl.signal.aborted) return;

    isImportInProgress = false;
    currentImportAbortController = null;
    resetAllApiResultButtons();

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
    if (abortCtrl.signal.aborted) return;
    console.error("Chyba při importu detailů z TMDB:", err);
    showToast("Nepodařilo se načíst podrobnosti: " + (err.message || String(err)));
    resetAllApiResultButtons();
  } finally {
    if (currentImportAbortController === abortCtrl) {
      currentImportAbortController = null;
      isImportInProgress = false;
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
    rawgKeyBadge.textContent = window.i18n ? window.i18n.t("apiModal.keySaved") : "✓ Klíč uložen";
    rawgKeyBadge.className = "tmdb-key-badge badge-saved";
  } else {
    rawgKeyBadge.textContent = window.i18n ? window.i18n.t("apiModal.keyMissing") : "Klíč nezadán";
    rawgKeyBadge.className = "tmdb-key-badge badge-missing";
  }
}

async function executeRawgSearch() {
  const key = getCleanRawgKey();
  if (!key) {
    showToast(window.i18n ? window.i18n.t("apiModal.promptEnterRawgKey") : "Nejprve prosím vložte váš RAWG API klíč.");
    rawgApiKeyInput?.focus();
    return;
  }

  localStorage.setItem("tracker_rawg_api_key", key);
  if (rawgApiKeyInput) rawgApiKeyInput.value = key;
  if (settingsRawgApiKey) settingsRawgApiKey.value = key;
  updateRawgKeyBadge();

  const query = sanitizeApiQuery(rawgQueryInput ? rawgQueryInput.value.trim() : "");
  if (rawgQueryInput) rawgQueryInput.value = query;
  if (!query) {
    showToast(window.i18n ? window.i18n.t("apiModal.promptEnterGameQuery") : "Zadejte název hry pro vyhledání.");
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
      const noResTitle = window.i18n ? window.i18n.t("apiModal.noGamesFoundTitle") : "Nebyly nalezeny žádné hry";
      const noResSub = window.i18n ? window.i18n.t("apiModal.noGamesFoundSub", { query }) : `Pro dotaz "${escapeHtml(query)}" nebyly nalezeny žádné tituly. Zkuste upřesnit název hry.`;
      rawgResultsArea.innerHTML = `
        <div class="tmdb-placeholder-state">
          <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p class="tmdb-placeholder-title">${escapeHtml(noResTitle)}</p>
          <p class="tmdb-placeholder-sub">${escapeHtml(noResSub)}</p>
        </div>
      `;
      return;
    }

    renderRawgResults(results);
  } catch (err) {
    console.error("Chyba vyhledávání RAWG:", err);
    const errTitle = window.i18n ? window.i18n.t("apiModal.rawgErrorTitle") : "Chyba při komunikaci s RAWG.io";
    rawgResultsArea.innerHTML = `
      <div class="tmdb-alert-card tmdb-alert-error">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <div>
          <strong>${escapeHtml(errTitle)}</strong>
          <p style="margin-top: 4px;">${escapeHtml(err.message || String(err))}</p>
        </div>
      </div>
    `;
  }
}

function renderRawgResults(results) {
  const countText = window.i18n
    ? window.i18n.t("apiModal.resultsCountGames", { count: results.length })
    : `Nalezeno celkem <strong>${results.length}</strong> her:`;
  let html = `<div class="tmdb-results-count">${countText}</div>`;

  results.forEach((game) => {
    const title = game.name || (window.i18n ? window.i18n.t("apiModal.untitled") : "Bez názvu");
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
    const gameLabel = window.i18n ? window.i18n.t("form.typeGame") : "Hra";
    const metaScoreTitle = window.i18n ? window.i18n.t("apiModal.metacriticScore") : "Metacritic skóre";
    const genresLabel = window.i18n ? window.i18n.t("apiModal.genresLabel") : "Žánry";
    const noGenresText = window.i18n ? window.i18n.t("apiModal.noGenres") : "Žánry neuvedeny.";
    const genresOverview = genres ? `${escapeHtml(genresLabel)}: ${escapeHtml(genres)}` : escapeHtml(noGenresText);
    const selectBtnText = window.i18n ? window.i18n.t("apiModal.selectAndPrefillBtn") : "Vybrat a předvyplnit";

    html += `
      <div class="tmdb-result-card" data-rawg-id="${game.id}">
        ${posterHtml}
        <div class="tmdb-result-info">
          <div class="tmdb-result-top">
            <div class="tmdb-result-badges">
              <span class="tmdb-pill-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">${escapeHtml(gameLabel)}</span>
              <span class="tmdb-result-year">${year}</span>
              ${metaScore ? `<span class="platform-pill" style="background: rgba(59, 130, 246, 0.18); color: #60a5fa;" title="${escapeHtml(metaScoreTitle)}">MC: ${metaScore}</span>` : ""}
            </div>
            ${rating10 !== null ? `<div class="tmdb-result-score">${SVG_ICONS.star} ${rating10}</div>` : ""}
          </div>
          <div class="tmdb-result-title">${escapeHtml(title)}</div>
          <div class="rawg-platforms-list" style="margin-bottom: 6px;">
            ${platformPills}
          </div>
          <div class="tmdb-result-overview">${genresOverview}</div>
          <div class="tmdb-result-actions">
            <button type="button" class="btn btn-primary rawg-select-btn">
              <span>${escapeHtml(selectBtnText)}</span>
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
  if (currentImportAbortController) {
    try {
      currentImportAbortController.abort();
    } catch (_) {}
  }
  const abortCtrl = new AbortController();
  currentImportAbortController = abortCtrl;
  isImportInProgress = true;

  document.querySelectorAll(".tmdb-select-btn, .rawg-select-btn").forEach((b) => {
    b.disabled = true;
  });

  if (btn) {
    const loadingText = window.i18n ? window.i18n.t("apiModal.loadingDetails") : "Načítám...";
    btn.innerHTML = `<span class="tmdb-spinner-small"></span> ${escapeHtml(loadingText)}`;
  }

  const key = getCleanRawgKey();

  try {
    const detailsUrl = `https://api.rawg.io/api/games/${gameSummary.id}?key=${encodeURIComponent(key)}`;
    const res = await fetch(detailsUrl, {
      headers: { Accept: "application/json" },
      signal: abortCtrl.signal,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} při načítání podrobností hry`);

    const data = await res.json();
    if (abortCtrl.signal.aborted) return;

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
    const ratingVal = data.rating ? Math.round(data.rating * 2 * 10) / 10 : 1;
    const apiRatingVal = data.metacritic ? Math.round(data.metacritic / 10 * 10) / 10 : ratingVal;

    // Hledání traileru / gameplay ukázky v RAWG movies
    let trailerUrl = "";
    try {
      const moviesUrl = `https://api.rawg.io/api/games/${gameSummary.id}/movies?key=${encodeURIComponent(key)}`;
      const mRes = await fetch(moviesUrl, { headers: { Accept: "application/json" }, signal: abortCtrl.signal });
      if (mRes.ok) {
        const mData = await mRes.json();
        const movies = mData.results || [];
        if (movies.length > 0) {
          trailerUrl = movies[0].data?.max || movies[0].data?.[480] || "";
        }
      }
    } catch (mErr) {
      if (abortCtrl.signal.aborted) return;
      console.warn("Chyba při načítání traileru hry z RAWG:", mErr);
    }
    if (abortCtrl.signal.aborted) return;

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

    if (imageUrl && !abortCtrl.signal.aborted) {
      if (btn) {
        const dlCoverText = window.i18n ? window.i18n.t("apiModal.downloadingPoster") : "Stahuji a optimalizuji obálku...";
        btn.innerHTML = `<span class="tmdb-spinner-small"></span> ${escapeHtml(dlCoverText)}`;
      }
      try {
        // 1. Primární spolehlivá metoda přes Rust backend (obejde CORS, Cloudflare i 307 přesměrování)
        const res = await tauriInvoke("download_and_save_image", { url: imageUrl });
        if (abortCtrl.signal.aborted) return;
        if (res && res.image_path) {
          try {
            const optimized = await processAndOptimizeImageToWebP(getCoverUrl(res.image_path));
            if (abortCtrl.signal.aborted) return;
            savedImagePath = optimized.filePath;
            base64ImageData = optimized.dataUrl;
          } catch (optErr) {
            console.warn("Optimalizace RAWG obalu selhala, použiji původní:", optErr);
            savedImagePath = res.image_path;
            base64ImageData = res.base64_data;
          }
        }
      } catch (rustErr) {
        if (abortCtrl.signal.aborted) return;
        console.warn("Stažení obalu přes Rust selhalo, zkouším přímý fetch:", rustErr);
        // 2. Sekundární fallback přes fetch
        try {
          const imgRes = await fetch(imageUrl, { signal: abortCtrl.signal });
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            if (abortCtrl.signal.aborted) return;
            const blobUrl = URL.createObjectURL(blob);
            try {
              const optimized = await processAndOptimizeImageToWebP(blobUrl);
              if (abortCtrl.signal.aborted) return;
              savedImagePath = optimized.filePath;
              base64ImageData = optimized.dataUrl;
            } finally {
              URL.revokeObjectURL(blobUrl);
            }
          }
        } catch (fetchErr) {
          if (abortCtrl.signal.aborted) return;
          console.warn("Stažení obalu přes fetch selhalo:", fetchErr);
        }
      }

      // 3. Bezpečnostní pojistka: pokud by soubor z disku nešel stáhnout, použijeme online URL pro náhled v dialogu
      if (!base64ImageData && imageUrl) {
        base64ImageData = imageUrl;
        savedImagePath = imageUrl;
      }
    }

    if (abortCtrl.signal.aborted) return;

    // UKONČENÍ / ÚSPĚŠNÉ DOKONČENÍ: Zobrazíme uživateli jasné potvrzení, že se vše úspěšně stáhlo
    if (btn) {
      btn.classList.add("btn-import-success");
      btn.innerHTML = window.i18n ? window.i18n.t("apiModal.allDownloaded") : "✓ Vše staženo!";
    }

    // Krátká prodleva, aby uživatel viděl potvrzení dokončení před otevřením formuláře
    await new Promise((r) => setTimeout(r, 450));
    if (abortCtrl.signal.aborted) return;

    isImportInProgress = false;
    currentImportAbortController = null;
    resetAllApiResultButtons();

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
    if (abortCtrl.signal.aborted) return;
    console.error("Chyba při importu detailů z RAWG:", err);
    showToast("Nepodařilo se načíst podrobnosti hry: " + (err.message || String(err)));
    resetAllApiResultButtons();
  } finally {
    if (currentImportAbortController === abortCtrl) {
      currentImportAbortController = null;
      isImportInProgress = false;
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
