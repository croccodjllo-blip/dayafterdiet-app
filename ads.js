const ADS_SETTINGS_KEY = "dayafterdiet-ads-settings";
const AUTH_PAGES = new Set(["login", "register", "reset-password", "tutorial", "privacy"]);

function loadAdsUserSettings() {
  try {
    const raw = localStorage.getItem(ADS_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAdsUserSettings(settings) {
  localStorage.setItem(ADS_SETTINGS_KEY, JSON.stringify(settings));
}

function userSettingsToBanners(settings) {
  if (!settings?.enabled) return [];

  const banners = [];
  const allPages = ["*"];

  if (settings.top?.enabled) {
    if (settings.top.html?.trim()) {
      banners.push({
        id: "user-top-html",
        enabled: true,
        placement: "top",
        pages: allPages,
        type: "html",
        html: settings.top.html.trim(),
      });
    } else if (settings.top.imageUrl?.trim()) {
      banners.push({
        id: "user-top-image",
        enabled: true,
        placement: "top",
        pages: allPages,
        type: "image",
        imageUrl: settings.top.imageUrl.trim(),
        href: settings.top.href?.trim() || "",
        alt: settings.top.alt?.trim() || "",
      });
    }
  }

  if (settings.bottom?.enabled) {
    if (settings.bottom.html?.trim()) {
      banners.push({
        id: "user-bottom-html",
        enabled: true,
        placement: "bottom",
        pages: allPages,
        type: "html",
        html: settings.bottom.html.trim(),
      });
    } else if (settings.bottom.imageUrl?.trim()) {
      banners.push({
        id: "user-bottom-image",
        enabled: true,
        placement: "bottom",
        pages: allPages,
        type: "image",
        imageUrl: settings.bottom.imageUrl.trim(),
        href: settings.bottom.href?.trim() || "",
        alt: settings.bottom.alt?.trim() || "",
      });
    }
  }

  return banners;
}

function getEffectiveAdsConfig() {
  const base = typeof ADS_CONFIG !== "undefined" ? ADS_CONFIG : { enabled: false, banners: [] };
  const user = loadAdsUserSettings();
  const userBanners = userSettingsToBanners(user);
  const enabled = user?.enabled === true || (user?.enabled !== false && base.enabled);

  return {
    enabled,
    hideOnAuthPages: base.hideOnAuthPages !== false,
    hideInNativeApp: base.hideInNativeApp === true,
    banners: [...(base.banners || []), ...userBanners].filter((b) => b && b.enabled),
  };
}

function matchAdPages(pages, page) {
  if (!pages || pages.includes("*")) return true;
  return pages.includes(page);
}

function isNativeMobileApp() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

function ensureAdSense(client) {
  if (!client || document.querySelector("script[data-adsense-client]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.crossOrigin = "anonymous";
  script.dataset.adsenseClient = client;
  document.head.appendChild(script);
}

function adLabelText() {
  return typeof t === "function" ? t("ads.label") : "Pubblicità";
}

function clearAdBanners() {
  document.querySelectorAll(".ad-banner-mount").forEach((el) => el.remove());
}

function buildBannerElement(banner) {
  const wrap = document.createElement("aside");
  wrap.className = `ad-banner ad-banner--${banner.placement}`;
  wrap.setAttribute("role", "complementary");
  wrap.dataset.adId = banner.id;

  const label = document.createElement("span");
  label.className = "ad-banner-label";
  label.textContent = adLabelText();

  const inner = document.createElement("div");
  inner.className = "ad-banner-inner";

  if (banner.type === "image" && banner.imageUrl) {
    const img = document.createElement("img");
    img.src = banner.imageUrl;
    img.alt = banner.alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    if (banner.href) {
      const link = document.createElement("a");
      link.href = banner.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer sponsored";
      link.appendChild(img);
      inner.appendChild(link);
    } else {
      inner.appendChild(img);
    }
  } else if (banner.type === "html" && banner.html) {
    inner.innerHTML = banner.html;
  } else if (banner.type === "adsense" && banner.adClient && banner.adSlot) {
    ensureAdSense(banner.adClient);
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.dataset.adClient = banner.adClient;
    ins.dataset.adSlot = banner.adSlot;
    if (banner.adFormat) ins.dataset.adFormat = banner.adFormat;
    inner.appendChild(ins);
    window.setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {}
    }, 0);
  } else {
    return null;
  }

  wrap.appendChild(label);
  wrap.appendChild(inner);
  return wrap;
}

function insertAdBanner(banner) {
  const app = document.querySelector(".app");
  if (!app) return;

  const header = app.querySelector("header.header");
  const main = app.querySelector("main.page-main");
  const nav = app.querySelector("nav.bottom-nav");
  const element = buildBannerElement(banner);
  if (!element) return;

  const mount = document.createElement("div");
  mount.className = `ad-banner-mount ad-banner-mount--${banner.placement}`;
  mount.appendChild(element);

  if (banner.placement === "top" && header) {
    header.insertAdjacentElement("afterend", mount);
    return;
  }

  if (banner.placement === "bottom") {
    if (nav) nav.insertAdjacentElement("beforebegin", mount);
    else if (main) main.insertAdjacentElement("afterend", mount);
  }
}

function initAds() {
  clearAdBanners();

  const config = getEffectiveAdsConfig();
  if (!config.enabled) return;

  const page = document.body?.dataset?.page || "";
  if (config.hideOnAuthPages && AUTH_PAGES.has(page)) return;
  if (config.hideInNativeApp && isNativeMobileApp()) return;

  const app = document.querySelector(".app");
  if (!app) return;

  config.banners
    .filter((banner) => matchAdPages(banner.pages, page))
    .forEach((banner) => insertAdBanner(banner));
}

function populateAdsSettingsForm() {
  const form = document.getElementById("ads-settings-form");
  if (!form) return;

  const settings = loadAdsUserSettings() || {
    enabled: false,
    top: { enabled: false, imageUrl: "", href: "", alt: "", html: "" },
    bottom: { enabled: false, imageUrl: "", href: "", alt: "", html: "" },
  };

  form.querySelector("#ads-enabled").checked = Boolean(settings.enabled);
  form.querySelector("#ads-top-enabled").checked = Boolean(settings.top?.enabled);
  form.querySelector("#ads-top-image").value = settings.top?.imageUrl || "";
  form.querySelector("#ads-top-href").value = settings.top?.href || "";
  form.querySelector("#ads-top-alt").value = settings.top?.alt || "";
  form.querySelector("#ads-top-html").value = settings.top?.html || "";

  form.querySelector("#ads-bottom-enabled").checked = Boolean(settings.bottom?.enabled);
  form.querySelector("#ads-bottom-image").value = settings.bottom?.imageUrl || "";
  form.querySelector("#ads-bottom-href").value = settings.bottom?.href || "";
  form.querySelector("#ads-bottom-alt").value = settings.bottom?.alt || "";
  form.querySelector("#ads-bottom-html").value = settings.bottom?.html || "";
}

function readAdsSettingsForm() {
  const form = document.getElementById("ads-settings-form");
  if (!form) return null;

  return {
    enabled: form.querySelector("#ads-enabled").checked,
    top: {
      enabled: form.querySelector("#ads-top-enabled").checked,
      imageUrl: form.querySelector("#ads-top-image").value.trim(),
      href: form.querySelector("#ads-top-href").value.trim(),
      alt: form.querySelector("#ads-top-alt").value.trim(),
      html: form.querySelector("#ads-top-html").value.trim(),
    },
    bottom: {
      enabled: form.querySelector("#ads-bottom-enabled").checked,
      imageUrl: form.querySelector("#ads-bottom-image").value.trim(),
      href: form.querySelector("#ads-bottom-href").value.trim(),
      alt: form.querySelector("#ads-bottom-alt").value.trim(),
      html: form.querySelector("#ads-bottom-html").value.trim(),
    },
  };
}

function initAdsSettingsForm() {
  const form = document.getElementById("ads-settings-form");
  if (!form || form.dataset.wired === "1") return;

  form.dataset.wired = "1";
  populateAdsSettingsForm();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const settings = readAdsSettingsForm();
    saveAdsUserSettings(settings);
    initAds();

    const note = document.getElementById("ads-settings-saved-note");
    if (note) {
      note.classList.remove("hidden");
      window.clearTimeout(initAdsSettingsForm._savedTimer);
      initAdsSettingsForm._savedTimer = window.setTimeout(() => {
        note.classList.add("hidden");
      }, 2500);
    }
  });
}

window.initAds = initAds;
window.initAdsSettingsForm = initAdsSettingsForm;
window.populateAdsSettingsForm = populateAdsSettingsForm;

document.addEventListener("DOMContentLoaded", () => {
  initAds();
  initAdsSettingsForm();
});
