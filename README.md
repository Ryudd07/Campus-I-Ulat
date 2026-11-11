# Campus Care

A small Ionic + Angular + Capacitor app for NEUST-Sumacab students to report broken or unsafe things on campus (maintenance, safety, IT and network, grounds) and follow each repair until it is fixed.

There is no server: reports are saved on the phone with Preferences, and a copy of each new report is sent to a free public test API.

## Device features (Capacitor)

| Feature | Plugin | Where in the app | Code |
|---|---|---|---|
| Add a photo | Camera | New report → Add photo | `src/app/pages/new-report/new-report.page.ts` → `addPhoto()` |
| Find my location | Geolocation + Leaflet | New report → Use my current location (or pick the building from the list) | `new-report.page.ts` → `locate()`, `shared/pin-map.component.ts` |
| Tap feedback | Haptics (Success double-tap) | Submit report; "Yes, it is fixed" | `new-report.page.ts` → `submit()`, `report-detail.page.ts` → `confirm()` |
| Save data on the phone | Preferences | The student's reports (saved, confirmed, reopened) | `src/app/core/reports.service.ts` |
| Send and fetch data | CapacitorHttp | GET the building list from this repository when the app opens; POST a copy of each new report to a test API | `reports.service.ts` → `loadBuildings()`, `postReport()` |

## Setup

Requirements: Node.js 22 or newer, and Android Studio (for the APK).

```bash
npm install
npm start
```

Open http://localhost:4200. The app opens on Home; there is no sign-in.

## Build the Android APK

```bash
npm run build
npx cap sync android
npx cap open android
```

In Android Studio: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**. The APK is saved in `android/app/build/outputs/apk/debug/`.

## Install and use

1. Copy the APK to an Android phone and open it (allow "Install unknown apps" if asked).
2. Tap a category on Home, add a photo, pin the location, describe the problem and tap **Submit report**.
3. Follow your reports in **My reports**. A resolved report asks "Is it fixed?".

The app needs internet for the map tiles (OpenStreetMap) and the test API (jsonplaceholder.typicode.com). Reports are still saved on the phone when offline; only the copy sent to the test API is skipped.

## Updating the buildings

The app downloads the building list from [`src/app/core/neust-buildings.json`](src/app/core/neust-buildings.json) in this repository every time it opens. To add or fix a building, edit that file on GitHub (pencil icon) and commit: every installed app picks it up on its next launch, no new APK needed. GitHub can take up to about 5 minutes to serve the new version. If the download fails, the app uses the copy built into it.

Each entry looks like this (`lat`/`lng` in decimal degrees, `null` until known):

```json
{ "no": 29, "name": "Science and Technology Bldg.", "category": "Science and technology", "lat": 15.4431, "lng": 120.9388 }
```

## Project structure

```
src/app/
  core/
    models.ts             Report, Building and form types
    reports.service.ts    Preferences + CapacitorHttp (all data)
    seed.ts               sample reports on first launch
    geo.ts                campus centre, buildings, distances
    neust-buildings.json  the 53 campus buildings (lat/lng to fill in)
  pages/                  one folder per screen
  shared/                 report card, tags, tab bar, Leaflet maps
```

## Tests

```bash
npm run test:unit
```
