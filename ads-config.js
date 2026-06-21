/**
 * Configurazione banner pubblicitari (predefinita).
 * Puoi anche gestire i banner dal Profilo → Banner pubblicitari (salvati sul dispositivo).
 *
 * placement: "top" | "bottom"
 * pages: ["today", "overview", ...] oppure ["*"] per tutte le pagine autenticate
 * type: "image" | "html" | "adsense"
 */
const ADS_CONFIG = {
  enabled: false,
  hideOnAuthPages: true,
  hideInNativeApp: false,
  banners: [
    // Esempio immagine (disattivato):
    // {
    //   id: "promo-top",
    //   enabled: true,
    //   placement: "top",
    //   pages: ["*"],
    //   type: "image",
    //   imageUrl: "https://example.com/banner.jpg",
    //   href: "https://example.com",
    //   alt: "Offerta partner",
    // },
    // Esempio Google AdSense (disattivato):
    // {
    //   id: "adsense-bottom",
    //   enabled: true,
    //   placement: "bottom",
    //   pages: ["today", "overview", "week"],
    //   type: "adsense",
    //   adClient: "ca-pub-XXXXXXXX",
    //   adSlot: "1234567890",
    //   adFormat: "auto",
    // },
  ],
};
