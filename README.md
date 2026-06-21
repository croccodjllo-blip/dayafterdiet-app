# DaD — Web App

Diario alimentare e fitness personale (DayafterDiet).

## Anteprima locale (web)

```bash
python3 -m http.server 8080
```

Apri http://localhost:8080

Anteprima modalità mobile nel browser:

http://localhost:8080/index.html?mobilePreview=1

## App mobile (Android)

L'app usa [Capacitor](https://capacitorjs.com/) per impacchettare la web app in un'app nativa Android.

### Prerequisiti

- Node.js 18+
- [Android Studio](https://developer.android.com/studio) con SDK Android
- Variabile `ANDROID_HOME` configurata

### Build e installazione

```bash
npm install
npm run mobile:sync    # copia gli asset web e sincronizza con Android
npm run cap:android  # apre il progetto in Android Studio
```

Da Android Studio: **Run** su emulatore o dispositivo collegato.

Oppure da terminale (con device/emulatore attivo):

```bash
npm run mobile:run
```

### Sviluppo

Dopo modifiche ai file HTML/JS/CSS:

```bash
npm run mobile:sync
```

Poi ricompila dall'IDE o con `npm run mobile:run`.

## Online

https://croccodjllo-blip.github.io/dayafterdiet-app/

## Repository

https://github.com/croccodjllo-blip/dayafterdiet-app

Sito di presentazione (landing): https://github.com/croccodjllo-blip/dayafterdiet
