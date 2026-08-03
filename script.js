let sentenceIndex = 0;
const savedLeague = localStorage.getItem("speechdeb_league") || "MMSSL";
const guestMode = localStorage.getItem("speechdeb_guest") === "1";
const textBox = document.getElementById("textBox");
const textBoxEl = document.getElementById("textBox");
let windowSpeechData = [];
let isOwnerGlobal = false;
let speechesAlreadyLoaded = false;

window.categorySets = {
  MSDL: [
    { name: "Children’s Literature", original: false },
    { name: "Declamation", original: false },
    { name: "Dramatic Performance", original: false },
    { name: "Duo Interpretation", original: false },
    { name: "Group Discussion", original: false },
    { name: "Informative Speaking", original: false },
    { name: "Multiple Reading", original: false },
    { name: "Original Oratory", original: true },
    { name: "Play Reading", original: false },
    { name: "Poetry Reading", original: false },
    { name: "Program Oral Interpretation", original: true },
    { name: "Prose Reading", original: false },
  ],
  MMSSL: [
    { name: "Children’s Literature", original: false },
    { name: "Declamation", original: false },
    { name: "Demonstration", original: false },
    { name: "Dramatic Performance", original: false },
    { name: "Duo Interpretation", original: false },
    { name: "Free Verse/Poetry", original: false },
    { name: "Original Literature", original: true },
    { name: "Original Oratory", original: true },
    { name: "Prose", original: false },
    { name: "Storytelling", original: false }
  ]
};

window.descriptions = {};
(window.categorySets[savedLeague] || []).forEach(name => {
  window.descriptions[name] = name;
});

function isOriginalCategory(categoryName) {
  const league = localStorage.getItem("speechdeb_league") || "MMSSL";
  const categories = window.categorySets[league] || [];
  const cat = categories.find(c => c.name === categoryName);
  return cat ? cat.original : false;
}

const payload = localStorage.getItem("speechdeb_editor_payload");

// === Navigation (fixed: real Supabase session instead of email/userId flags) ===
function goBackToMenu() {
  try {
    localStorage.removeItem("speechdeb_editor_payload");
  } catch (e) {
    console.warn("Could not clear editor payload:", e);
  }

  const isGuest = localStorage.getItem("speechdeb_guest") === "1";

  if (isGuest) {
    window.location.href = "user.html?guest=1";
    return;
  }

  // Supabase tracks the session itself — no need to check email/userId manually
  window.location.href = "user.html";
}

function toggleSettings() {
    window.location.href = "./settings.html";
}

// Replaces the two duplicate "user.php?action=get&id=..." lookups that used
// to live inline in initScript() and showMenuView().
async function getProfileAndLoadSpeeches() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileIdParam = urlParams.get("id");

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData?.session?.user;

  if (profileIdParam) {
    const { data: profile, error } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", profileIdParam)
      .single();

    if (error || !profile) {
      window.location.href = "404.html";
      return;
    }

    const isOwner = !!(currentUser && profile.id === currentUser.id);
    loadSpeechesFromServer(profile.id, isOwner);
  } else if (currentUser) {
    loadSpeechesFromServer(currentUser.id, true);
  } else if (guestMode) {
    loadSpeechesFromServer(null, true);
  }
}

window.initScript = function initScript() {
const copyLinkBtn = document.getElementById("copyLinkBtn");
if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", () => {
    const id = currentSpeechId || "";
    if (!id) {
      showMessage("⚠️ Save the speech first to get a link.", "warning");
      return;
    }
const link = `${window.location.origin}/editor.html?speechId=${id}`;
    navigator.clipboard.writeText(link)
      .then(() => showMessage("✅ Link copied to clipboard!", "success"))
      .catch(() => showMessage("❌ Failed to copy link.", "error"));
  });
}

    const menuBtn = document.getElementById("menuBtn");
if (menuBtn) {
  menuBtn.addEventListener("click", goBackToMenu);
}

  // Initialize menu view
  const menuView = document.getElementById("menuView");
  if (menuView) {
    getProfileAndLoadSpeeches();
  }

  // Restore editor if payload exists
const editorView = document.getElementById("editorView");
if (editorView) {
    if (!payload) {
  createCategorySection(); // ensure it shows up for new speeches too
}

  const waitForDOM = () => {
    const ready =
  document.getElementById("speechTitle") &&
  document.getElementById("textBox") &&
  document.getElementById("editorView") &&
  document.getElementById("editorTopControls"); // ✅ critical
        
    if (!ready) return setTimeout(waitForDOM, 50);

    if (!document.getElementById("categorySection") &&
        !document.getElementById("categorySelect")) {
      createCategorySection();  // <-- ensure always created
    }

    if (payload) {
      const speech = JSON.parse(payload);
      loadSpeechIntoEditorServer(speech);
    }
  };

  waitForDOM();
}

  // Apply saved user settings
  const leagueSelector = document.getElementById("leagueSelector");
  if (leagueSelector) {
    if (savedLeague) leagueSelector.value = savedLeague;
  }

  const format = localStorage.getItem("speechdeb_exportFormat") || "txt";
  const formatInput = document.querySelector(`input[name="exportFormat"][value="${format}"]`);
  if (formatInput) formatInput.checked = true;

  const overwrite = localStorage.getItem("speechdeb_overwriteZip") === "true";
  const overwriteCheckbox = document.getElementById("overwriteZipCheckbox");
  if (overwriteCheckbox) overwriteCheckbox.checked = overwrite;

  // Preferences & navigation buttons
const prefsBtn = document.getElementById("prefs");
if (prefsBtn) prefsBtn.addEventListener("click", toggleSettings);

        if (menuBtn) menuBtn.addEventListener("click", goBackToMenu);

        updateWordCount();
}

     function showMessage(text, type = "info", duration = 5000) {
        const box = document.getElementById("globalAlert");
        if (!box) return;

        if (!text || typeof text !== "string") {
            text = "⚠️ An unexpected error occurred.";
        }

        box.innerHTML = text;
        box.style.display = "block";
        box.style.opacity = "1";

        switch (type) {
            case "success":
            box.style.backgroundColor = "#e6ffe6";
            box.style.color = "#006600";
            box.style.borderBottom = "3px solid #00aa00";
            break;
            case "error":
            box.style.backgroundColor = "#ffe6e6";
            box.style.color = "#990000";
            box.style.borderBottom = "3px solid #cc0000";
            break;
            case "warning":
            box.style.backgroundColor = "#fff5e6";
            box.style.color = "#995c00";
            box.style.borderBottom = "3px solid #cc9900";
            break;
            default:
            box.style.backgroundColor = "#f0f0f0";
            box.style.color = "#333";
            box.style.borderBottom = "3px solid #ccc";
        }

        clearTimeout(messageTimeout);
        messageTimeout = setTimeout(() => {
            box.style.opacity = "0";
            setTimeout(() => {
            box.style.display = "none";
            }, 500);
        }, duration);
    }

function applyWarningStyles(box, message) {
  box.style.cssText = `
    display: block;
    background-color: #fff5e5;
    border: 2px solid #cc0000;
    color: #cc0000;
    border-radius: 8px;
    padding: 12px 20px;
    margin-top: 20px;
    font-size: 16px;
    font-family: inherit;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    max-width: 90%;
    margin-inline: auto;
  `;
  box.innerHTML = message;
}

function applySavedStyles(box, message) {
  box.style.cssText = `
    display: block;
    background-color: #e6ffe6;
    border: 2px solid #00aa00;
    color: #004400;
    border-radius: 8px;
    padding: 12px 20px;
    margin-top: 20px;
    font-size: 16px;
    font-family: inherit;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    max-width: 90%;
    margin-inline: auto;
  `;
  box.innerHTML = message;
}

// NOTE: handleSignup(), handleLogin(), toggleAuthMode(), showPasswordReset(),
// showReset(), showAuthView() were removed here — they referenced #loginForm,
// #signupForm, #authBox, #passwordResetForm etc. which don't exist anywhere
// in editor.html. Auth now lives entirely on login.html/signup.html, wired
// to Supabase directly, so this dead code (which posted to register.php /
// login.php) has been deleted rather than converted.

function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = Math.max(0, now - new Date(timestamp).getTime());
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    const months = Math.floor(weeks / 4);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
    }

        // === Timer Setup ===
        const BASE_TIME_SEC = 450; // 450 = 7:30 in seconds, 150 = 2:30 in seconds (minimum for testing)
        const TIME_MULTIPLIER = 1;

        // Globals to define (some are unrelated to timer)
        let timerInterval = null;
        let startTime = BASE_TIME_SEC;
        let currentTime = startTime;
        let overtime = false;
        let startTimestamp = null;
        let memorizeMode = false;
        let tourIsRunning = false;
        let attempts = 0;
        let detachedManually = false;
        let overtimeStartTimestamp = null;
        let resetAttempts = [];
        let cooldownTimeout = null;
        const flashTimers = {};
        let totalElapsedSeconds = 0;
        let messageTimeout;
        let categoryLocked = false;
        let currentSpeechId = null;
    let currentSpeechTitle = null;
    let currentSpeechCategory = null;
    const uploadInput = document.getElementById("uploadFile");

        const timerDisplay = document.getElementById("timerDisplay");
        const miniTime = document.getElementById("miniTime");
        const miniDot = document.getElementById("miniDot");
        const stopSummary = document.getElementById("stopSummary");
        const lightHighlightToggle = document.getElementById("lightHighlightToggle");
        let doneSentences = [];
        const settingsBox = document.getElementById("settingsBox");

        const markerFlashes = {
        150: "label2",
        90: "label1",
        60: "label30"
        };

        let timerRunning = false;

        let lastUpdate = 0;
        const UPDATE_INTERVAL = 100;

        let lastSecond = BASE_TIME_SEC;

        function formatTime(seconds, omitTenths = false) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        const tenths = Math.floor((seconds * 10) % 10);
        return omitTenths ? `${pad(min)}:${pad(sec)}` : `${pad(min)}:${pad(sec)}.${tenths}`;
        }

        function pad(n) {
        return n < 10 ? '0' + n : n;
        }

        const flashedMarkers = {};

        function handleFlashes(nowSec, prevSec, elapsedScaled) {
        Object.entries(markerFlashes).forEach(([targetStr, id]) => {
            const target = Number(targetStr);
            if (currentTime <= target && !flashedMarkers[id]) {
            startFlash(id, 5000);
            flashedMarkers[id] = true;
            }
        });

        const graceEl = document.getElementById("labelOVT");

        if (graceEl && currentTime <= 30 && !flashedMarkers["GRACE"]) {
            startFlash("labelOVT", 5000);
            flashedMarkers["GRACE"] = true;
        }

        if (graceEl && currentTime <= 0) {
            graceEl.textContent = "⚫ OVT";
        }
        }

        function startFlash(id, duration = 5000) {
        const el = document.getElementById(id);
        if (!el) return;

        const originalText = el.textContent.replace(/^[^\w\d]+/, "").trim();
        let startTimestamp = performance.now();
        let flashing = true;
        let flashFrameId = null;

        function flashLoop(now) {
            if (!flashing) {
            el.textContent = "⚫ " + originalText;
            miniDot.textContent = "⚫";
            cancelAnimationFrame(flashFrameId);
            return;
            }

            const elapsed = now - startTimestamp;
            const phase = Math.floor(elapsed / 500) % 2 === 0;

            el.textContent = (phase ? "🔴 " : "⚫ ") + originalText;
            miniDot.textContent = phase ? "🔴" : "⚫";

            flashFrameId = requestAnimationFrame(flashLoop);
        }

        flashTimers[id] = { stop: () => { flashing = false; } };
        flashFrameId = requestAnimationFrame(flashLoop);

        setTimeout(() => {
            if (flashTimers[id]) {
            flashTimers[id].stop();
            delete flashTimers[id];
            }
        }, duration);
        }

        function stopAllFlashes() {
        for (let id in flashTimers) {
            if (flashTimers[id]) {
            flashTimers[id].stop();
            }
            const el = document.getElementById(id);
            if (el) {
            const cleanText = el.textContent.replace(/^[^\w\d]+/, "").trim();
            el.textContent = "⚫ " + cleanText;
            }
        }
        Object.keys(flashTimers).forEach(id => delete flashTimers[id]);
        miniDot.textContent = "⚫";

        const graceEl = document.getElementById("labelOVT");
        if (graceEl) {
            graceEl.textContent = "⚫ GRACE";
        }
    }

        // === Dropdown & Category Lock ===
        const titleInput = document.getElementById("speechTitle");
        const menuView = document.getElementById("menuView");
        const editorView = document.getElementById("editorView");

        let currentSpeechKey = null;
        let currentSpeechMetaKey = null;

        // === Save & Autosave Logic (rewritten for Supabase) ===
    function formatDateTime(date) {
        const pad = (n) => (n < 10 ? '0' + n : n);
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const yyyy = date.getFullYear();
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        const sec = pad(date.getSeconds());

        return `${mm}/${dd}/${yyyy} at ${hh}:${min}:${sec}`;
    }

async function saveSpeech() {
  const titleEl = document.getElementById("speechTitle");
  const contentEl = document.getElementById("textBox");
  const categoryEl = document.getElementById("categorySelect");
  const shareEl = document.getElementById("shareStatus");
  const warningBox = document.getElementById("unsavedWarning");

  if (!titleEl || !contentEl || !categoryEl) {
    console.error("❌ Missing title, content, or category element.");
    return;
  }

  const title = titleEl.value.trim();
  const contentHTML = contentEl.innerHTML.trim();
  const plainText = contentHTML.replace(/<[^>]+>/g, "").trim();
  const category = categoryEl.value.trim();
  const memorized = memorizeMode ? true : false;
  const done = doneSentences || [];
  const shareStatus = shareEl?.value || "private";
  const id = currentSpeechId || null;

  if (!title || title.length < 3) {
    showMessage("⚠️ Please enter a valid title (min 3 characters).", "warning");
    return;
  }
  if (!category) {
    showMessage("⚠️ Please choose a category.", "warning");
    return;
  }
  if (!plainText) {
    showMessage("⚠️ Please add some content before saving.", "warning");
    return;
  }

  if (warningBox) applyWarningStyles(warningBox, "💾 Saving...");

  // Guest mode never hits the database — save locally instead
  if (guestMode) {
    saveGuestSpeechLocally({ id, title, content: contentHTML, category, shareStatus });
    updateLastSaved();
    return;
  }

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData?.session?.user;

  if (!currentUser) {
    showMessage("❌ You must be logged in to save.", "error");
    return;
  }

  const dbPayload = {
    user_id: currentUser.id,
    title,
    content: contentHTML,
    category,
    memorization_mode: memorized,
    done_sentences: done,
    share_status: shareStatus,
    updated_at: new Date().toISOString()
  };

  let result;
  if (id) {
    result = await supabaseClient
      .from("speeches")
      .update(dbPayload)
      .eq("id", id)
      .eq("user_id", currentUser.id)
      .select()
      .single();
  } else {
    result = await supabaseClient
      .from("speeches")
      .insert({ ...dbPayload, created_at: new Date().toISOString() })
      .select()
      .single();
  }

  const { data, error } = result;

  if (error) {
    console.error("❌ Save failed:", error);
    showMessage("❌ Could not save: " + error.message, "error");
    return;
  }

  currentSpeechId = data.id;
  updateLastSaved();

  const shareInput = document.getElementById("shareStatus");
  const shareDropdown = document.getElementById("shareDropdown");
  if (shareInput && shareDropdown) {
    shareDropdown.value = shareInput.value;
  }
}

// Minimal guest-mode save: updates the same localStorage array user.html reads from
function saveGuestSpeechLocally({ id, title, content, category, shareStatus }) {
  const GUEST_STORAGE_KEY = "speechdeb_guest_speeches";
  let speeches = [];
  try {
    speeches = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || "[]");
  } catch (e) {
    speeches = [];
  }

  const now = new Date().toISOString();
  const existingIndex = speeches.findIndex(s => s.id === id);

  if (existingIndex >= 0) {
    speeches[existingIndex] = { ...speeches[existingIndex], title, content, category, share_status: shareStatus, updated_at: now };
    currentSpeechId = id;
  } else {
    const newId = id || Date.now();
    speeches.push({ id: newId, title, content, category, share_status: shareStatus, created_at: now, updated_at: now });
    currentSpeechId = newId;
  }

  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(speeches));
}

        let lastSavedMessage = "";
        let warningActive = false;
        let warningTimeout = null;

const categorySelect = document.getElementById("categorySelect");

function updateLastSaved() {
  const now = new Date();
  const titleInputEl = document.getElementById("speechTitle");
  const categorySelect = document.getElementById("categorySelect");
  const box = document.getElementById("unsavedWarning");

  const title = titleInputEl ? titleInputEl.value.trim() : "";
  const category = categorySelect ? categorySelect.value.trim() : "";
  const content = textBoxEl ? textBoxEl.innerText.trim() : "";

  const allPresent = title.length > 0 && category.length > 0 && content.length > 0;

  if (!box) return;

  if (!allPresent) {
    warningActive = true;
    applyWarningStyles(box, "⚠️ Your speech is not saving! Category, title, and/or content are absent.");
  } else {
    warningActive = false;
    lastSavedMessage = `✅ Last saved at ${formatDateTime(now)}`;
    applySavedStyles(box, lastSavedMessage);
  }
}

        // === Download Handlers ===
        function downloadText() {
        const text = textBox.innerText;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "speech.txt";
        a.click();
        URL.revokeObjectURL(url);
        }

        function generatePDFBufferFromText(text) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const marginLeft = 10;
        const marginTop = 10;
        const lineHeight = 10;
        const pageHeight = pdf.internal.pageSize.height;
        const maxY = pageHeight - marginTop;
        let y = marginTop;

        const paragraphs = text.split(/\n{2,}/);
        paragraphs.forEach((para) => {
            const lines = pdf.splitTextToSize(para.trim(), 180);
            lines.forEach((line) => {
            if (y + lineHeight > maxY) {
                pdf.addPage();
                y = marginTop;
            }
            pdf.text(line, marginLeft, y);
            y += lineHeight;
            });
            y += lineHeight * 1.5;
        });

        return pdf.output("arraybuffer");
        }

        function downloadPDF() {
        const rawText = textBox.innerText || "";
        const cleanedText = rawText.replace(/\r?\n/g, "\n");

        const title = titleInput.value.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "speech";
        const pdfBuffer = generatePDFBufferFromText(cleanedText);

        const blob = new Blob([pdfBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        }

        // === Word Count and Timing Stats ===
function updateWordCount() {
  if (!textBox) return;

  const text = textBox.textContent || "";
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);

  const wordCountEl = document.getElementById("wordCount");
  if (wordCountEl) {
    wordCountEl.textContent = words.length;
  }

  updateTimingStats(totalElapsedSeconds || 0);
}

function updateTimingStats(totalSeconds) {
  const text = textBox.innerText || "";
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  const wpm = words > 0 && totalSeconds > 0 ? (words / (totalSeconds / 60)).toFixed(1) : "0.0";
  const spw = words > 0 && totalSeconds > 0 ? (totalSeconds / words).toFixed(2) : "–";

  const wpmValue = document.getElementById("wpmValue");
  const spwValue = document.getElementById("spwValue");
  if (wpmValue) wpmValue.textContent = wpm;
  if (spwValue) spwValue.textContent = spw;

  if (!timerRunning || totalSeconds <= 0) return;

  const maxWPM = 300;
  const cappedWPM = Math.min(maxWPM, parseFloat(wpm));
  const wpmNeedle = document.getElementById("wpmNeedle");
  const wpmAngle = 225 - (cappedWPM / maxWPM) * 270;
  if (wpmNeedle && !isNaN(wpmAngle)) {
    wpmNeedle.style.transform = `rotate(${wpmAngle}deg)`;
  }

  const maxSPW = 5;
  const cappedSPW = spw === "–" ? 0 : Math.min(maxSPW, parseFloat(spw));
  const spwNeedle = document.getElementById("spwNeedle");
  const spwAngle = 225 - (cappedSPW / maxSPW) * 270;
  if (spwNeedle && !isNaN(spwAngle)) {
    spwNeedle.style.transform = `rotate(${spwAngle}deg)`;
  }

  const odometer = document.getElementById("odometer");
  if (odometer) {
    odometer.innerHTML = words
      .toString()
      .padStart(4, "0")
      .split("")
      .map(d => `
        <div class="odometer-digit">
          <div class="odometer-wheel" style="transform: translateY(-${parseInt(d) * 30}px);">
            ${[...Array(10).keys()].map(n => `<div>${n}</div>`).join("")}
          </div>
        </div>
      `)
      .join("");
  }
}

function updateOdometer(value) {
  const odometer = document.getElementById("odometer");
  if (!odometer) return;

  const digits = value.toString().padStart(4, "0").split("");
  odometer.innerHTML = digits.map(d => `
    <div class="odometer-digit">
      <div class="odometer-wheel">
        ${[...Array(10).keys()].map(n => `<div>${n}</div>`).join("")}
      </div>
    </div>
  `).join("");

  const wheels = odometer.querySelectorAll(".odometer-wheel");
  digits.forEach((d, i) => {
    wheels[i].style.transform = `translateY(-${parseInt(d) * 10}%)`;
  });
}

        // === Input Event Handlers ===
        let saveTimeout;

if (textBox) {
  textBox.addEventListener("input", () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveSpeech, 500);
    updateWordCount();
  });

  textBox.addEventListener("paste", () => {
  setTimeout(updateWordCount, 50);
});

  textBox.addEventListener("blur", updateWordCount);
}

if (titleInput) {
  titleInput.addEventListener("input", () => {
    document.title = titleInput.value || "Untitled Speech";
    updateLastSaved();
  });

  titleInput.addEventListener("input", () => {
    warningActive = false;
    updateLastSaved();
  });
}

if (titleInput) {
  titleInput.addEventListener("blur", saveSpeech);
}

const liveDropdown = document.getElementById("categorySelect");
if (liveDropdown) {
  liveDropdown.addEventListener("blur", saveSpeech);
  liveDropdown.addEventListener("change", () => {
    saveSpeech();
    updateLastSaved();
  });
}

        // === Load on Startup ===
const onEditorPage = !!document.getElementById("editorView");
const onMenuPage = location.pathname.includes("index.html") || location.pathname.includes("user.html");

if (onEditorPage) {
  updateWordCount();
}
                // === Memorization Mode ===
        memorizeMode = false;
        let sentences = [];
        let originalEditorHTML = "";
		
function splitTextIntoSentencePieces(text) {
  const pieces = [];
  const regex = /([^.!?]*[.!?]["')\]]*\s*|[^.!?]+$)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const part = match[0];
    if (part && part.trim().length > 0) {
      pieces.push(part);
    }
  }

  return pieces.length ? pieces : [text];
}

let sentenceSpans = [];

function buildMemorizeViewFromOriginalHTML() {
  if (!originalEditorHTML) {
    originalEditorHTML = textBox.innerHTML || "";
  }

  const temp = document.createElement("div");
  temp.innerHTML = originalEditorHTML;

  sentenceSpans = [];
  let indexCounter = 0;

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.textContent;
      if (!raw || !raw.trim()) return;

      const parts = splitTextIntoSentencePieces(raw);
      if (parts.length === 1) return;

      const frag = document.createDocumentFragment();

      parts.forEach(part => {
        if (!part) return;

        const span = document.createElement("span");
        span.textContent = part;
        span.className = "mem-sentence";
        span.dataset.index = indexCounter;

        sentenceSpans.push(span);
        indexCounter++;

        frag.appendChild(span);
      });

      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  Array.from(temp.childNodes).forEach(processNode);

  textBox.innerHTML = temp.innerHTML;

  sentences = sentenceSpans.map(span => span.textContent.trim()).filter(Boolean);
}

        const memorizeBtn = document.getElementById("memorizeBtn");
        const toggleVisibilityBtn = document.getElementById("toggleVisibilityBtn");
        const prevBtn = document.getElementById("prevSentenceBtn");
        const nextBtn = document.getElementById("nextSentenceBtn");

if (memorizeBtn && titleInput && textBox) {
  memorizeBtn.addEventListener("click", () => {
    const memNav = document.getElementById("memNav");
    const formatControls = document.getElementById("formatControls");
    const uploadFile = document.getElementById("uploadFile");
    const categorySection = document.getElementById("categorySection");
    const statsBox = document.getElementById("statsBox");

    if (!memorizeMode) {
      originalEditorHTML = textBox.innerHTML || "";
      memorizeMode = true;

      titleInput.disabled = true;
      textBox.contentEditable = false;

      buildMemorizeViewFromOriginalHTML();
      prepareSentences();
      sentenceIndex = 0;
      highlightSentence();
      updateSentenceCounter();

      if (memNav) memNav.style.display = "flex";
      if (formatControls) formatControls.style.display = "none";
      if (uploadFile) uploadFile.style.display = "none";
      if (categorySection) categorySection.style.display = "none";
      if (statsBox) statsBox.style.display = "none";

      memorizeBtn.textContent = "Unmemorize";
      memorizeBtn.classList.add("active");
    } else {
      memorizeMode = false;

      titleInput.disabled = false;
      textBox.contentEditable = true;

      if (originalEditorHTML) {
        textBox.innerHTML = originalEditorHTML;
      }

      sentenceSpans = [];
      sentences = [];
      sentenceIndex = 0;

      if (memNav) memNav.style.display = "none";
      if (formatControls) formatControls.style.display = "flex";
      if (uploadFile) uploadFile.style.display = "inline-block";
      if (categorySection) categorySection.style.display = "block";
      if (statsBox) statsBox.style.display = "block";

      memorizeBtn.textContent = "Memorize";
      memorizeBtn.classList.remove("active");

      updateWordCount();
      updateSentenceCounter();
      updateDonePercentage();
    }

    updateLastSaved();
    saveSpeech();
  });
}

// === Sentence Parsing & Highlighting ===
function prepareSentences() {
  if (!memorizeMode) return;

  if (!sentenceSpans || sentenceSpans.length === 0) {
    buildMemorizeViewFromOriginalHTML();
  }

  sentences = (sentenceSpans || [])
    .map(span => span.textContent.trim())
    .filter(Boolean);

  if (sentenceIndex >= sentences.length) {
    sentenceIndex = 0;
  }
}

function highlightSentence() {
  if (!memorizeMode) return;
  if (!sentenceSpans || sentenceSpans.length === 0) return;

  const isHidden = toggleVisibilityBtn?.dataset.hidden === "true";

  sentenceSpans.forEach((span, idx) => {
    const isCurrent = idx === sentenceIndex;
    const isDone = doneSentences.includes(idx);
    const shouldHighlight = isCurrent || isDone;

    span.style.backgroundColor = shouldHighlight ? "yellow" : "inherit";
    span.style.fontWeight = isCurrent ? "bold" : "normal";
    span.style.opacity = (isHidden && isCurrent) ? "0" : "1";
    span.style.transition = "opacity 0.3s ease";
    span.style.borderRadius = "3px";
    span.style.padding = shouldHighlight ? "0.05em 0.1em" : "0";
  });

  syncDoneCheckbox();
  updateDonePercentage();
}

        function updateSentenceCounter() {
        const counterEl = document.getElementById("sentenceCounter");
        if (!sentences || sentences.length === 0) {
            counterEl.textContent = "";
            return;
        }
        counterEl.textContent = `Sentence ${sentenceIndex + 1} of ${sentences.length}`;
        }

        // === Navigation Buttons ===
        toggleVisibilityBtn?.addEventListener("click", () => {
        const isHidden = toggleVisibilityBtn.dataset.hidden === "true";
        toggleVisibilityBtn.dataset.hidden = isHidden ? "false" : "true";
        toggleVisibilityBtn.textContent = isHidden ? "Hide" : "Show";
        toggleVisibilityBtn.style.backgroundColor = isHidden ? "yellow" : "white";
        highlightSentence();
        });

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    prepareSentences();
    sentenceIndex = Math.max(0, sentenceIndex - 1);
    highlightSentence();
    updateSentenceCounter();
    updateDonePercentage();
    syncDoneCheckbox();
    saveSpeech();
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    prepareSentences();
    sentenceIndex = Math.min(sentences.length - 1, sentenceIndex + 1);
    highlightSentence();
    updateSentenceCounter();
    updateDonePercentage();
    syncDoneCheckbox();
    saveSpeech();
  });
}

        lightHighlightToggle?.addEventListener("change", () => {
        if (lightHighlightToggle.checked) {
            if (!doneSentences.includes(sentenceIndex)) {
            doneSentences.push(sentenceIndex);
            }
        } else {
            doneSentences = doneSentences.filter(i => i !== sentenceIndex);
        }

        highlightSentence();
        updateDonePercentage();
        saveSpeech();
        });

        function syncDoneCheckbox() {
  if (!lightHighlightToggle) return;
  lightHighlightToggle.checked = doneSentences.includes(sentenceIndex);
}

        function updateDonePercentage() {
        if (!sentences || sentences.length === 0) {
            document.getElementById("donePercent").textContent = "";
            return;
        }

        const totalWords = sentences.reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0);
        const doneWords = doneSentences
            .map(i => sentences[i])
            .filter(Boolean)
            .reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0);

        const percent = totalWords > 0 ? ((doneWords / totalWords) * 100).toFixed(2) : "0.00";
        document.getElementById("donePercent").textContent = `(${percent}%)`;
        }

        // Export and import options
        function emailZip() {
            showMessage("📧 Emailing .ZIP is not yet implemented. You could use `mailto:` with an attachment handler.", "info");
        }

        async function downloadZip() {
        const format = document.querySelector('input[name="exportFormat"]:checked')?.value || "txt";
        const zip = new JSZip();
        let count = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key.startsWith("speech_")) continue;

            const [, meta] = key.split("speech_");
            const [category, name] = meta.split("::");
            const rawHtml = localStorage.getItem(key);

            const container = document.createElement("div");
            container.innerHTML = rawHtml;
            const textContent = Array.from(container.childNodes).map(node =>
            node.textContent.trim()
            ).join("\n\n");

            const filename = `${(window.categorySets?.[category]?.split(":")[0] || "Speech")}_${name}`
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "_");

            if (format === "txt") {
            zip.file(`${filename}.txt`, textContent);
            } else if (format === "pdf") {
        const cleanedText = textContent.replace(/\r?\n/g, "\n");

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const marginLeft = 10;
        const marginTop = 10;
        const lineHeight = 10;
        const pageHeight = pdf.internal.pageSize.height;
        const maxY = pageHeight - marginTop;
        let y = marginTop;

        const paragraphs = cleanedText.split(/\n{2,}/);

        paragraphs.forEach((para) => {
        const lines = pdf.splitTextToSize(para.trim(), 180);

        lines.forEach((line) => {
            if (y + lineHeight > maxY) {
            pdf.addPage();
            y = marginTop;
            }
            pdf.text(line, marginLeft, y);
            y += lineHeight;
        });

        y += lineHeight;
        });

        const pdfContent = generatePDFBufferFromText(cleanedText);
        zip.file(`${filename}.pdf`, pdfContent);
        }
            count++;
        }

        if (count === 0) {
        showMessage("⚠️ No speeches found to export.", "warning");    
        return;
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `speeches_export_${format.toUpperCase()}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        }

        // === Expand/Collapse Timer Logic ===
        const timerBox = document.getElementById("timerBox");

if (timerBox) {
  timerBox.addEventListener('click', function(event) {
    const rect = timerBox.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    if (offsetX > rect.width - 20 && offsetY < 20) {
      if (timerBox.classList.contains('small')) {
        expandTimer();
      } else {
        shrinkTimer();
      }
    }
  });
}

        function shrinkTimer() {
        timerBox.classList.remove('large');
        timerBox.classList.add('small');

        document.getElementById("timerContentMini").style.display = "flex";
        document.getElementById("timerContentFull").style.display = "none";

        timerBox.style.width = "120px";
        timerBox.style.maxWidth = "120px";
        timerBox.style.height = "120px";
        timerBox.style.minHeight = "120px";
        timerBox.style.padding = "6px";
        timerBox.style.borderRadius = "12px";
        timerBox.style.backgroundColor = "#007acc";
        timerBox.style.color = "white";
        }

        const detachBtn = document.getElementById("detachBtn");
        detachBtn?.addEventListener('click', () => {
        const detachWrapper = document.getElementById("detachWrapper");
        if (detachWrapper) detachWrapper.style.display = "none";
        });

        // ===== Expand and Collapse Timer =====
        const expandBtn = document.getElementById("expandBtn");
        const collapseBtn = document.getElementById("collapseBtn");
        const timerContentMini = document.getElementById("timerContentMini");
        const timerContentFull = document.getElementById("timerContentFull");

if (expandBtn && collapseBtn) {
  expandBtn.addEventListener("click", expandTimer);
  collapseBtn.addEventListener("click", collapseTimer);
}

        function expandTimer() {
        timerBox.classList.add("fullscreen");
        timerContentMini.style.display = "none";
        timerContentFull.style.display = "block";
        }

        function collapseTimer() {
        timerBox.classList.remove("fullscreen");
        timerContentMini.style.display = "flex";
        timerContentFull.style.display = "none";
        }

        function updateTimerDisplay() {
        const formatted = overtime ? `+${formatTime(currentTime)}` : formatTime(currentTime);
        document.getElementById("timerDisplay").textContent = formatted;
        document.getElementById("miniTime").textContent = formatted;
        }

        function startTimer() {
            timerRunning = true;
        stopTimer();
        startTimestamp = performance.now();
        overtime = false;
        currentTime = 450;
        totalElapsedSeconds = 0;
        timerInterval = requestAnimationFrame(updateTimer);
        }

        function updateTimer(now) {
        if (!startTimestamp) return;

        const elapsed = (now - startTimestamp) / 1000;

        if (!overtime) {
            currentTime = 450 - elapsed;
            if (currentTime <= 0) {
            overtime = true;
            startTimestamp = performance.now();
            currentTime = 0;
            }
        } else {
            const overtimeElapsed = (now - startTimestamp) / 1000;
            currentTime = overtimeElapsed;
        }

        updateTimerDisplay();
        handleFlashes(Math.floor(currentTime));
if (startTimestamp !== null && currentTime > 0) {
  const total = overtime ? currentTime : BASE_TIME_SEC - currentTime;
  updateTimingStats(total);
}

        timerInterval = requestAnimationFrame(updateTimer);
        }

        function stopTimer() {
            timerRunning = false;
        if (timerInterval) {
            cancelAnimationFrame(timerInterval);
            timerInterval = null;
        }

        if (startTimestamp !== null) {
            const now = performance.now();
            if (!overtime) {
            totalElapsedSeconds = (450 - currentTime);
            } else {
            totalElapsedSeconds = (now - startTimestamp) / 1000;
            }
        }

        updateTimingStats(totalElapsedSeconds);
        startTimestamp = null;
    }

const memNav = document.getElementById("memNav");

function createNewSpeech() {
  memorizeMode = false;
  doneSentences = [];
  sentenceIndex = 0;

  if (memorizeBtn) memorizeBtn.style.display = "inline-block";
  if (memNav) memNav.style.display = "none";
  if (titleInput) {
    titleInput.value = "";
    titleInput.disabled = false;
  }
  if (textBox) {
    textBox.innerText = "";
    textBox.contentEditable = true;
    updateWordCount();
    textBox.style.fontFamily = "Times New Roman, serif";
    textBox.style.fontSize = "18px";
  }

  const dropdown = document.getElementById("categorySelect");
  if (dropdown) {
    dropdown.disabled = false;
    dropdown.selectedIndex = 0;
  }

  const formatControls = document.getElementById("formatControls");
    const uploadFile = document.getElementById("uploadFile");
      const statsBox = document.getElementById("statsBox");

  if (formatControls) formatControls.style.display = "flex";
  if (uploadFile) uploadFile.style.display = "inline-block";
  if (statsBox) statsBox.style.display = "block";

  showEditorView({
    id: null,
    title: "",
    content: "",
    category: "",
    memorization_mode: false,
    done_sentences: [],
    is_owner: true
  });
}

// === Load speeches for the menu view (rewritten for Supabase) ===
async function loadSpeechesFromServer(profileId, isOwner) {
  if (speechesAlreadyLoaded) return;
  speechesAlreadyLoaded = true;

  const container = document.getElementById("menuView");
  if (!container) {
    console.error("❌ menuView container not found");
    return;
  }

  let speeches = [];

  if (guestMode) {
    try {
      speeches = JSON.parse(localStorage.getItem("speechdeb_guest_speeches") || "[]");
    } catch (e) {
      speeches = [];
    }
  } else {
    if (!profileId) return;
    const { data, error } = await supabaseClient
      .from("speeches")
      .select("*")
      .eq("user_id", profileId)
      .order("updated_at", { ascending: false });

    if (error) {
      showMessage("❌ Failed to load speeches: " + error.message, "error");
      return;
    }
    speeches = data;
  }

  windowSpeechData = speeches;
  isOwnerGlobal = isOwner;

  container.innerHTML = "";
  renderSpeechBoxes(speeches, isOwner);
  originalSpeechBoxes = Array.from(document.querySelectorAll('.speechBox'));
}

function renderSpeechBoxes(data, isOwner) {
  const container = document.getElementById("menuView");

  if (isOwner) {
    const newSpeechBtn = document.createElement("button");
    newSpeechBtn.id = "newSpeechBtn";
    newSpeechBtn.textContent = "New Speech";
    newSpeechBtn.addEventListener("click", createNewSpeech);

    container.appendChild(newSpeechBtn);
    container.appendChild(document.createElement("br"));
  }

  if (data.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.id = "noSpeechesMessage";
    emptyMsg.textContent = "No speeches found for this user.";
    emptyMsg.style = "margin-top: 20px; font-size: 20px; color: #666; text-align: center;";
    container.appendChild(emptyMsg);
  }

  data.forEach(speech => {
    const box = document.createElement("div");
    box.className = "speechBox";
    box.setAttribute("data-category", speech.category || "");
    box.setAttribute("data-title", speech.title || "");
    box.setAttribute("data-updated", speech.updated_at || speech.created_at || "");
    box.style = `
      background-color: #f9f9f9;
      border: 1px solid #ccc;
      border-radius: 10px;
      padding: 14px 20px;
      margin: 10px auto;
      max-width: 70%;
      cursor: pointer;
    `;

    const titleLine = `[${speech.category}] ${speech.title}`;
    const statusLine = isOwner
      ? (speech.memorization_mode
          ? `Finalized • Last viewed ${formatRelativeTime(speech.updated_at || speech.created_at)}`
          : `Last edited ${formatRelativeTime(speech.updated_at || speech.created_at)}`
        )
      : '';

    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: bold; font-size: 18px;">${titleLine}</div>
          ${statusLine ? `<div style="color: #666; font-size: 14px;">${statusLine}</div>` : ''}
        </div>
        ${isOwner
          ? `<button class="deleteBtn" style="margin-left: 20px; background-color: #cc0000; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Delete</button>`
          : ''}
      </div>
    `;

    if (isOwner) {
      const deleteBtn = box.querySelector(".deleteBtn");
      if (deleteBtn) {
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          showCustomAlert({
            heading: "Delete Speech?",
            message: `Are you sure you want to delete your ${speech.category} speech "${speech.title}"? This cannot be undone.`,
            onConfirm: async () => {
              if (guestMode) {
                let all = JSON.parse(localStorage.getItem("speechdeb_guest_speeches") || "[]");
                all = all.filter(s => s.id !== speech.id);
                localStorage.setItem("speechdeb_guest_speeches", JSON.stringify(all));
                showMessage("✅ Deleted successfully! Reloading...", "success");
                setTimeout(() => location.reload(), 1000);
                return;
              }
              const { error } = await supabaseClient.from("speeches").delete().eq("id", speech.id);
              if (error) {
                showMessage(error.message || "❌ Failed to delete speech.", "error");
              } else {
                showMessage("✅ Deleted successfully! Reloading...", "success");
                setTimeout(() => location.reload(), 1000);
              }
            }
          });
        };
      }
    }

    box.onclick = () => showEditorView(speech);
    container.appendChild(box);
  });

  const filtersBox = document.getElementById("filtersBox");
  if (filtersBox) {
    filtersBox.style.display = (data.length > 0) ? "block" : "none";
  }
}

function showEditorView(speech) {
  if (!speech || typeof speech !== "object") {
    console.error("❌ No speech object provided.");
    showMessage("Error: No speech data provided.", "error");
    return;
  }

  const { title, content, category } = speech;

  const isNewSpeech = (speech.id === null || speech.id === undefined);

  if (!isNewSpeech && (!speech.title || !speech.category)) {
    console.error("❌ Incomplete speech:", speech);
    showMessage("Error: Incomplete speech data (title/category missing).", "error");
    return;
  }

  try {
    localStorage.setItem("speechdeb_editor_payload", JSON.stringify(speech));
  } catch (e) {
    console.error("❌ Failed to store speech in localStorage:", e);
    showMessage("Error: Could not store speech data.", "error");
    return;
  }

  const isOriginal = isOriginalCategory(category);
  const copyLinkBtn = document.getElementById("copyLinkBtn");
  if (copyLinkBtn) copyLinkBtn.style.display = isOriginal ? "none" : "inline-block";
  const shareStatus = document.getElementById("shareStatus");
  if (shareStatus) shareStatus.parentElement.style.display = isOriginal ? "none" : "block";

  setTimeout(() => {
    window.location.href = "editor.html";
  }, 100);
}

window.loadSpeechIntoEditorServer = async function (speechFromServer) {
  const payload = localStorage.getItem("speechdeb_editor_payload");

  if (!payload) {
    showMessage("⚠️ No speech found to load.", "warning");
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    console.error("❌ Failed to parse payload:", e, payload);
    localStorage.removeItem("speechdeb_editor_payload");
    showMessage("❌ Corrupted speech data.", "error");
    return;
  }

  // Figure out ownership from the real Supabase session rather than an email match
  let isOwner = true;
if (!guestMode && parsed.user_id) {
  try {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const currentUser = sessionData?.session?.user;
    isOwner = !!(currentUser && parsed.user_id === currentUser.id);
  } catch (e) {
    console.error("Ownership check failed, defaulting to view-only:", e);
    isOwner = false; // fail safe: treat as view-only rather than crash
  }
}

  const speech = { ...parsed, is_owner: isOwner };

  if (speech.id !== null && !speech.title && !speech.is_owner) {
    showMessage("⚠️ Viewing a shared speech with no title.", "warning");
  }

  const editorView = document.getElementById("editorView");
  const menuView = document.getElementById("menuView");

  if (editorView) editorView.style.display = "block";
  if (menuView) menuView.style.display = "none";

  if (!document.getElementById("categorySection")) {
    createCategorySection();
  }

  const dropdown = document.getElementById("categorySelect");
  if (dropdown && speech.category) {
    dropdown.value = speech.category;
  }

  currentSpeechId = speech.id;
  currentSpeechTitle = speech.title || "";
  currentSpeechCategory = speech.category || null;
  memorizeMode = !!speech.memorization_mode;

  doneSentences = Array.isArray(speech.done_sentences) ? speech.done_sentences : [];

  const titleInput = document.getElementById("speechTitle");
  const shareDropdown = document.getElementById("shareStatus");
  const memNav = document.getElementById("memNav");
  const formatControls = document.getElementById("formatControls");
  const uploadInput = document.getElementById("uploadFile");
  const categorySection = document.getElementById("categorySection");
  const statsBox = document.getElementById("statsBox");
  const memorizeBtn = document.getElementById("memorizeBtn");

  if (titleInput) titleInput.value = speech.title || "";

  if (
    shareDropdown &&
    speech.share_status &&
    ["private", "public", "unlisted"].includes(speech.share_status)
  ) {
    shareDropdown.value = speech.share_status;
  }

  textBox.innerHTML = speech.content || "";
  updateWordCount();

  if (!isOwner) {
    memorizeMode = true;

    if (textBox) textBox.contentEditable = false;
    if (titleInput) titleInput.disabled = true;
    if (shareDropdown) shareDropdown.disabled = true;
    if (dropdown) dropdown.disabled = true;
    if (memorizeBtn) memorizeBtn.style.display = "none";

    if (uploadInput) uploadInput.style.display = "none";
    if (formatControls) formatControls.style.display = "none";
    if (categorySection) categorySection.style.display = "none";
    if (statsBox) statsBox.style.display = "none";
    if (memNav) memNav.style.display = "flex";

    originalEditorHTML = textBox.innerHTML || "";
    buildMemorizeViewFromOriginalHTML();
    prepareSentences();
    highlightSentence();
    updateSentenceCounter();

    updateLastSaved();
    return;
  }

  if (memorizeMode) {
    if (textBox) textBox.contentEditable = false;
    if (titleInput) titleInput.disabled = true;
    if (dropdown) dropdown.disabled = false;
    if (shareDropdown) shareDropdown.disabled = false;

    if (memNav) memNav.style.display = "flex";
    if (formatControls) formatControls.style.display = "none";
    if (uploadInput) uploadInput.style.display = "none";
    if (categorySection) categorySection.style.display = "none";
    if (statsBox) statsBox.style.display = "none";

    if (memorizeBtn) {
      memorizeBtn.style.display = "inline-block";
      memorizeBtn.textContent = "Unmemorize";
    }

    originalEditorHTML = textBox.innerHTML || "";
    buildMemorizeViewFromOriginalHTML();
    prepareSentences();
    highlightSentence();
    updateSentenceCounter();
  } else {
    if (textBox) {
      textBox.contentEditable = true;
    }
    if (titleInput) titleInput.disabled = false;
    if (dropdown) dropdown.disabled = false;
    if (shareDropdown) shareDropdown.disabled = false;

    if (memNav) memNav.style.display = "none";
    if (formatControls) formatControls.style.display = "flex";
    if (uploadInput) uploadInput.style.display = "inline-block";
    if (categorySection) categorySection.style.display = "block";
    if (statsBox) statsBox.style.display = "block";

    if (memorizeBtn) {
      memorizeBtn.style.display = "inline-block";
      memorizeBtn.disabled = false;
      memorizeBtn.textContent = "Memorize";
    }
  }

  updateWordCount();
  updateLastSaved();
};

function createCategorySection() {
  const savedLeague = localStorage.getItem("speechdeb_league") || "MMSSL";
  const existingDropdown = document.getElementById("categorySelect");
  if (existingDropdown) return;

  const dropdown = document.createElement("select");
  dropdown.id = "categorySelect";
  dropdown.style.cssText = `
    padding: 6px 10px;
    font-size: 16px;
    border-radius: 6px;
    height: 38px;
    margin-left: 10px;
    margin-right: 10px;
  `;

  dropdown.addEventListener("change", () => {
  saveSpeech();
  updateLastSaved();
});
dropdown.addEventListener("blur", saveSpeech);

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = "--Select Category--";
  dropdown.appendChild(defaultOption);

const currentLeague = localStorage.getItem("speechdeb_league") || "MMSSL";
(window.categorySets[currentLeague] || []).forEach(name => {
  const opt = document.createElement("option");
  opt.value = name.name;
  opt.textContent = name.name;
  dropdown.appendChild(opt);
});

const memorizeBtn = document.getElementById("memorizeBtn");
const container = document.querySelector(".titleRow");

if (container && memorizeBtn) {
  container.insertBefore(dropdown, memorizeBtn);
} else if (container) {
  container.appendChild(dropdown);
  console.warn("⚠️ #memorizeBtn not found — dropdown appended to container");
} else {
    const fallback = document.getElementById("editorView");
    if (fallback) {
      fallback.insertBefore(dropdown, fallback.firstChild);
      console.warn("⚠️ editorTopControls missing — dropdown inserted in #editorView");
    }
  }

  window.dropdown = dropdown;
}

if (uploadInput && textBox) {
  uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
  const paragraphs = e.target.result.split(/\n{2,}/);
  textBox.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join("");
  updateWordCount();
};
    reader.readAsText(file);
  });
}

// NOTE: showPasswordReset(), sendResetCode(), handlePasswordReset(), showReset()
// were removed — they referenced #resetEmail/#verificationCode/#newPassword/
// #verificationSection, which don't exist in editor.html. Send reset.html
// (the page login.html's "Forgot Password?" link points to) and I'll wire
// real Supabase password-reset logic there instead.

function showCustomAlert({ heading, message, onConfirm, onCancel = () => {} }) {
  if (confirm(`${heading}\n\n${message}`)) {
    onConfirm();
  } else {
    onCancel();
  }
}

function showConfirmBox(message, onConfirm, onCancel = () => {}) {
  if (typeof message === "object" && message.message) {
    message = message.message;
  }

  if (confirm(message)) {
    onConfirm();
  } else {
    onCancel();
  }
}

function showEditorPageLayout(speech) {
      const authBox = document.getElementById("authBox");
  const menuView = document.getElementById("menuView");
  const editorView = document.getElementById("editorView");
  const footer = document.getElementById("footer");
  const customAlertBox = document.getElementById("customAlertBox");
  const supportPopup = document.getElementById("supportPopup");
  const settingsBox = document.getElementById("settingsBox");
  const formatControls = document.getElementById("formatControls");
  const memorizeBtn = document.getElementById("memorizeBtn");
  const memNav = document.getElementById("memNav");
  const uploadInput = document.getElementById("uploadFile");
  const categorySection = document.getElementById("categorySection");
  const statsBox = document.getElementById("statsBox");
  const dropdown = document.getElementById("categorySelect");
  const titleInput = document.getElementById("speechTitle");
  const shareDropdown = document.getElementById("shareStatus");

  if (authBox) authBox.style.display = "none";
  if (menuView) menuView.style.display = "none";
  if (editorView) editorView.style.display = "block";
  if (footer) footer.style.display = "block";
  if (customAlertBox) customAlertBox.style.display = "none";
  if (supportPopup) supportPopup.style.display = "none";
  if (settingsBox) settingsBox.style.display = "none";

if (!speech.is_owner) {
  if (textBox) textBox.contentEditable = false;
  if (titleInput) {
    titleInput.value = speech.title || "";
    titleInput.disabled = true;
  }
  if (dropdown) {
    dropdown.value = speech.category || "";
    dropdown.disabled = true;
  }
  if (memorizeBtn) memorizeBtn.style.display = "none";
  if (uploadInput) uploadInput.style.display = "none";
  if (shareDropdown) shareDropdown.disabled = true;

  if (formatControls) formatControls.style.display = "none";
  if (memNav) memNav.style.display = "none";
  if (statsBox) statsBox.style.display = "none";
  if (categorySection) categorySection.style.display = "none";

} else if (memorizeMode) {
  if (textBox) textBox.contentEditable = false;
  if (titleInput) titleInput.disabled = true;
  if (dropdown) dropdown.disabled = true;
  if (shareDropdown) shareDropdown.disabled = false;

  if (memorizeBtn) {
    memorizeBtn.style.display = "inline-block";
    memorizeBtn.textContent = "Unmemorize";
  }

  if (formatControls) formatControls.style.display = "none";
  if (uploadInput) uploadInput.style.display = "none";
  if (categorySection) categorySection.style.display = "none";
  if (memNav) memNav.style.display = "flex";
  if (statsBox) statsBox.style.display = "none";

} else {
  if (textBox) {
    textBox.contentEditable = true;
    textBox.innerText = "";
  }
  if (titleInput) {
    titleInput.value = speech.title || "";
    titleInput.disabled = false;
  }
  if (dropdown) {
    dropdown.value = speech.category || "";
    dropdown.disabled = false;
  }
  if (shareDropdown) shareDropdown.disabled = false;

  if (formatControls) formatControls.style.display = "flex";
  if (memorizeBtn) {
    memorizeBtn.style.display = "inline-block";
    memorizeBtn.disabled = false;
    memorizeBtn.textContent = "Memorize";
  }
  if (uploadInput) uploadInput.style.display = "inline-block";
  if (categorySection) categorySection.style.display = "block";
  if (memNav) memNav.style.display = "none";
  if (statsBox) statsBox.style.display = "block";
}

  if (dropdown) {
    dropdown.disabled = false;
    dropdown.selectedIndex = 0;
  }

  doneSentences = [];
  sentenceIndex = 0;

  updateWordCount();
  updateLastSaved();
}

    function closeCustomAlert() {
    document.getElementById("customAlertBox").style.display = "none";
    }

    // === Account deletion (rewritten for Supabase) ===
    // This deletes the person's own data (profile row + all their speeches)
    // and signs them out — that part works with plain client-side Supabase
    // calls under RLS. Fully removing the underlying login/auth record still
    // needs a Supabase Edge Function running with elevated privileges, since
    // client-side code is intentionally not allowed to delete auth accounts.
    // The line below marks exactly where that function call would go once
    // that Edge Function exists.
    function confirmAccountDeletion() {
    showCustomAlert({
        heading: "Confirm Account Deletion",
        message: "This will permanently delete your account data and all speeches. Proceed?",
        onConfirm: async () => {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const currentUser = sessionData?.session?.user;

        if (!currentUser) {
            showMessage("You must be logged in to delete your account.", "error");
            return;
        }

        const { error: speechesError } = await supabaseClient
          .from("speeches")
          .delete()
          .eq("user_id", currentUser.id);

        const { error: profileError } = await supabaseClient
          .from("profiles")
          .delete()
          .eq("id", currentUser.id);

        if (speechesError || profileError) {
          showMessage(
            (speechesError || profileError).message || "❌ Failed to delete account data.",
            "error"
          );
          return;
        }

        // TODO: call a Supabase Edge Function here to fully delete
        // currentUser.id from auth.users using the service-role key.
        // e.g.: await fetch('https://<project>.functions.supabase.co/delete-user', {
        //   method: 'POST',
        //   headers: { Authorization: `Bearer ${sessionData.session.access_token}` }
        // });

        await supabaseClient.auth.signOut();
        localStorage.clear();
        showMessage("✅ Account data deleted. Redirecting...", "success");
        setTimeout(() => location.reload(), 1500);
        }
    });
    }

  function saveSettings() {
    const league = document.getElementById("leagueSelector").value;
    localStorage.setItem("speechdeb_league", league);

    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || "txt";
    localStorage.setItem("speechdeb_exportFormat", format);

    const overwriteZip = document.getElementById("overwriteZipCheckbox").checked;
    localStorage.setItem("speechdeb_overwriteZip", overwriteZip ? "true" : "false");

    alert("✅ Settings saved successfully.");
  }

function showMenuView() {
  const menu = document.getElementById("menuView");
  if (!menu) return;

  menu.innerHTML = "";
  speechesAlreadyLoaded = false;

  getProfileAndLoadSpeeches();

  const filtersBox = document.getElementById("filtersBox");
  if (filtersBox) {
    filtersBox.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", initScript);
