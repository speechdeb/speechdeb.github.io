// === Maintenance mode overlay ===
// NOT real security — this is a client-side JS file in a public repo, so
// the password is trivially visible to anyone who views source or opens
// dev tools. This only deters casual visitors, nothing more.
(function () {
  const STAFF_PASSWORD = "Speechdeb";
  const UNLOCK_KEY = "speechdeb_maintenance_unlocked";

  if (localStorage.getItem(UNLOCK_KEY) === "true") return;

  function showMaintenanceOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "maintenanceOverlay";
    overlay.style.cssText = `
      position: fixed; top:0; left:0; width:100vw; height:100vh;
      background:#ffffff; z-index:999999;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      font-family:inherit; text-align:center; padding:20px; box-sizing:border-box;
    `;
    overlay.innerHTML = `
      <h1 style="font-size:28px; margin-bottom:10px;">The Speechdeb Editor site is currently undergoing maintenance.</h1><br>
      <h2 style="font-size:17px; margin-bottom:10px;">We apologize for any inconvenience and will be back up soon. If you need access to your speeches immediately, please text 617-454-4303. Thank you.</h2>
      <br>
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center;">
        <p style="margin:0;">Staff entry:</p>
        <input type="password" id="staffPasswordInput" placeholder="Staff password"
               style="padding:8px 12px; font-size:16px; border:1px solid #ccc; border-radius:6px; width:220px;" />
        <button id="staffPasswordSubmit" style="padding:8px 16px; font-size:16px; border-radius:6px; border:none; background:#007acc; color:white; cursor:pointer;">Enter</button>
      </div>
      <p id="staffPasswordError" style="color:#c00; margin-top:10px; height:16px;"></p>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById("staffPasswordInput");
    const btn = document.getElementById("staffPasswordSubmit");
    const errorEl = document.getElementById("staffPasswordError");

    function tryUnlock() {
      if (input.value === STAFF_PASSWORD) {
        localStorage.setItem(UNLOCK_KEY, "true");
        overlay.remove();
      } else {
        errorEl.textContent = "Incorrect password.";
      }
    }

    btn.addEventListener("click", tryUnlock);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryUnlock();
    });
  }

  if (document.body) {
    showMaintenanceOverlay();
  } else {
    document.addEventListener("DOMContentLoaded", showMaintenanceOverlay);
  }
})();

const APP_VERSION = "v1.02";
  const CURRENT_YEAR = new Date().getFullYear();

  // 🔹 Supabase setup — shared across every page that loads common.js.
  // If a page already defined its own supabaseClient (like user.html does),
  // this reuses it instead of creating a duplicate.
  function ensureSupabaseClient() {
    return new Promise((resolve) => {
      if (window.supabaseClient) {
        resolve(window.supabaseClient);
        return;
      }
      function createClientOnceLoaded() {
        const SUPABASE_URL = "https://tdaykujyicpvokrkryea.supabase.co";
        const SUPABASE_KEY = "sb_publishable_m_eAW0KQTU_GYz0KhsLIbw_ltdhysCv";
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        resolve(window.supabaseClient);
      }
      if (window.supabase) {
        createClientOnceLoaded();
      } else {
        const cdnScript = document.createElement("script");
        cdnScript.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
        cdnScript.onload = createClientOnceLoaded;
        document.head.appendChild(cdnScript);
      }
    });
  }

  const html = `
    <!-- ✅ VERSION BANNER -->
    <div id="versionBannerMenu">
      <div id="menuHeading">
        <a style="color: white;" href="https://speechdeb.infy.uk/index.html">Speechdeb Editor <span id="menuVersion"></span></a>
      </div>
      <br>
      <div id="subtitle">
        <a style="color: #bbbbbb;" href="https://speechdeb.infy.uk/index.html">The first text editor for the National Speech & Debate Association!</a>
      </div>
    </div>

    <!-- ✅ USER PANEL -->
    <div id="userPanel" style="display: none;">
      <div id="toggleUserMenu">
<img id="userAvatarDisplay" src="" alt="Profile" style="width: 28px; height: 28px; object-fit: cover; margin-right: 8px; vertical-align: middle; border-radius: 4px;">
<span id="userEmailDisplay"></span>
        <span id="userDropdownArrow">▼</span>
      </div>
      <div id="userMenuItems">
        <div id="profile">Speeches</div>
        <div id="prefs">Preferences</div>
        <div id="resetPassword">Reset Password</div>
        <div id="deleteAccount">Delete Account</div>
        <div id="support">Support</div>
        <div id="logout">Logout</div>
      </div>
    </div>

        <!-- Alert Bar -->
    <div id="globalAlert"></div>

    <!-- Custom Alert -->
    <div id="customAlertBox" style="display: none;">
      <div class="customAlertHeader">
        <h3 id="alertBoxHeading">Alert</h3>
        <button class="closeBtn" onclick="closeCustomAlert()">✖</button>
      </div>
      <hr />
      <p id="alertBoxMessage" style="margin: 12px 0;"></p>
      <div class="customAlertButtons">
        <button id="alertBoxCancelBtn">Cancel</button>
        <button id="alertBoxOkBtn">OK</button>
      </div>
    </div>
  </div>

    <!-- ✅ FOOTER -->
    <div id="footer">
    <hr>
      Speechdeb Editor <span id="footerVersion"></span> ® 2025-${CURRENT_YEAR} Speechdeb Software •
      <a href="contact.html">Contact Support</a> •
      <a href="blog/blog.html">Blog</a> •
      <a href="https://linkedin.com/company/speechdeb">LinkedIn</a>
      <hr>
      <p>
        Speechdeb Software is not affiliated with, or endorsed by, the <a href="https://mmssl.weebly.com">MMSSL</a>,
        the <a href="https://msdlonline.org">MSDL</a>, the <a href="https://bostondebate.org">BDL</a>, the <a href="https://speechanddebate.org">NSDA</a>, or any such organization.
      </p>
    </div>
  `;

  // Wait for DOM to load then inject components
window.addEventListener("DOMContentLoaded", async () => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const banner = wrapper.querySelector("#versionBannerMenu");
  const userPanel = wrapper.querySelector("#userPanel");
  const footer = wrapper.querySelector("#footer");
  const alertBar = wrapper.querySelector("#globalAlert");
  const customAlert = wrapper.querySelector("#customAlertBox");

  if (banner) document.body.prepend(banner);
  if (userPanel) document.body.prepend(userPanel);
  if (alertBar) document.body.appendChild(alertBar);
  if (customAlert) document.body.appendChild(customAlert);
  if (footer) document.body.appendChild(footer);

  // Apply version text
  document.querySelectorAll("#menuVersion, #footerVersion").forEach(el => {
    el.textContent = APP_VERSION;
  });

  // 🔹 Figure out guest mode from URL *or* localStorage
  const urlParams    = new URLSearchParams(window.location.search);
  const guestFromUrl = urlParams.get("guest") === "1";

  if (guestFromUrl) {
    // Sticky guest mode once you've entered via ?guest=1
    localStorage.setItem("speechdeb_guest", "1");
  }

  const guestMode = guestFromUrl || localStorage.getItem("speechdeb_guest") === "1";

  // 🔹 Make sure Supabase is ready before checking session
  const supabaseClient = await ensureSupabaseClient();

  // 🔹 Real Supabase session check (replaces the old loggedIn/email flags)
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const currentUser = sessionData?.session?.user || null;

  // 🔹 USER PANEL: Guest first, then logged-in user
  const userPanelEl   = document.getElementById("userPanel");
  const emailDisplay  = document.getElementById("userEmailDisplay");
  const avatarImg     = document.getElementById("userAvatarDisplay");

  if (guestMode) {
    // ✅ Guest navbar: default pic + "Guest"
    if (userPanelEl && emailDisplay) {
      userPanelEl.style.display = "block";
      emailDisplay.textContent  = "Guest";
    }
    if (avatarImg) {
      avatarImg.src = "favicon.png";
    }
  } else if (currentUser) {
    // ✅ Normal logged-in user navbar — real Supabase profile fetch
    const { data: profile, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    const nameToShow = (profile && profile.name) || currentUser.email;
    if (userPanelEl && emailDisplay) {
      userPanelEl.style.display = "block";
      emailDisplay.textContent  = nameToShow;
    }

    if (avatarImg) {
      const src = (profile && profile.profile_picture_url) || "favicon.png";
      avatarImg.src = src + (src.includes("?") ? "&" : "?") + "t=" + Date.now(); // cache-bust
    }

    if (error) {
      console.error("❌ Failed to fetch user profile:", error);
    }
  } else {
    // ❌ Not guest and not logged in → navbar stays hidden
    if (userPanelEl) {
      userPanelEl.style.display = "none";
    }
  }

  // ✅ Click handlers for navbar items
  const prefs      = document.getElementById("prefs");
  const reset      = document.getElementById("resetPassword");
  const del        = document.getElementById("deleteAccount");
  const support    = document.getElementById("support");
  const logoutBtn  = document.getElementById("logout");

  // 🔹 Guest mode: hide Reset Password & Delete Account
  if (guestMode) {
    if (reset) reset.style.display = "none";
    if (del)   del.style.display   = "none";
  } else if (currentUser) {
    // 🔹 Logged-in: wire up reset + delete
    if (reset) {
      reset.onclick = () => window.location.href = "reset.html";
    }
    if (del) {
      del.onclick = () => {
        if (typeof window.confirmAccountDeletion === "function") {
          window.confirmAccountDeletion();
        }
      };
    }
  }

  // These are fine for both guest + logged-in
  if (prefs)   prefs.onclick   = () => window.location.href = "https://speechdeb.infy.uk/settings.html";
  if (support) support.onclick = () => window.location.href = "http://speechdeb.infy.uk/contact.html";

  // 🔹 Logout: real Supabase signOut + clear local guest flags
  async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem("speechdeb_guest");
    window.location.href = "login.html"; // fixed from login.php
  }
  window.logout = logout;
  if (logoutBtn) logoutBtn.onclick = logout;

  // ✅ Dropdown toggle
  const toggle = document.getElementById("toggleUserMenu");
  const arrow  = document.getElementById("userDropdownArrow");
  const menu   = document.getElementById("userMenuItems");

  if (toggle && arrow && menu) {
    toggle.addEventListener("click", () => {
      const visible = menu.classList.contains("visible");
      menu.classList.toggle("visible", !visible);
      arrow.textContent = visible ? "▼" : "▲";
    });
  }

  // ✅ Make toggleUserMenu accessible globally
  window.toggleUserMenu = () => {
    const menu  = document.getElementById("userMenuItems");
    const arrow = document.getElementById("userDropdownArrow");
    if (!menu || !arrow) return;
    const isVisible = menu.classList.contains("visible");
    menu.classList.toggle("visible", !isVisible);
    arrow.textContent = isVisible ? "▼" : "▲";
  };

  // ✅ Small-screen overlay
  function checkScreenSize() {
    const minWidth = 810;
    const overlayId = "screenTooSmallOverlay";
    let overlay = document.getElementById(overlayId);

    if (window.innerWidth < minWidth) {
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = overlayId;
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(255, 255, 255, 1)";
        overlay.style.zIndex = "99999";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontFamily = "inherit";
        overlay.style.fontSize = "24px";
        overlay.style.color = "#333";
        overlay.style.textAlign = "center";
        overlay.innerHTML = `
          <div>
            <p style="font-size: 28px; font-weight: bold;">Screen too small</p>
            <p style="margin-top: 12px;">Your display is too small.</p>
          </div>
        `;
        document.body.appendChild(overlay);
      }
    } else {
      if (overlay) overlay.remove();
    }
  }

  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});

// ✅ Make it accessible to inline HTML

  // Inject styles.css if not already present
  if (!document.querySelector('link[href="styles.css"]')) {
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = "styles.css";
    document.head.appendChild(styleLink);
  }

// Inject favicon if not already present
if (!document.querySelector('link[rel="icon"]')) {
  const faviconLink = document.createElement("link");
  faviconLink.rel = "icon";
  faviconLink.type = "image/png";
  faviconLink.href = "/favicon.png";
  document.head.appendChild(faviconLink);
}

// Inject script.js if not already present
function loadScriptAndInit() {
  const script = document.createElement("script");
  script.src = "script.js";
  script.onload = () => {
    if (typeof initScript === "function") {
      initScript();
    }
  };
  document.head.appendChild(script);
}

// ✅ Only load script.js on editor/menu pages, NOT on pure auth / public pages
// IMPORTANT: this waits for supabaseClient to actually be ready before
// loading script.js — previously this ran as an independent listener that
// could fire before window.supabaseClient existed, causing script.js's
// saveSpeech()/getProfileAndLoadSpeeches() etc. to silently fail with
// "supabaseClient is not defined" and nothing would save.
document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

  const isNonEditorPage =
    path.includes("login.html")   ||
    path.includes("signup.html")  ||
    path.includes("reset.html")  ||
    path.includes("contact.html") ||
    path.includes("/blog/") ||
    path.includes("404.html");

  if (isNonEditorPage) {
    // These pages use their own inline JS
    return;
  }

  await ensureSupabaseClient(); // wait until window.supabaseClient definitely exists
  loadScriptAndInit();
});
