# servicetool
Stand: 2026-07-29, geprüft gegen Commit 5bf9e33

## Zweck
HTML-Frontend eines internen Service-/Verwaltungswerkzeugs: Oberflächen u. a. für
Bestelltool, Dashboard, Display-Details, Listenansichten, Charts und Newsletter.
Interne Admin-UI für Homeinfo-Mitarbeiter.

## Stack & Einstiegspunkte
Statisches Web-Frontend (HTML/CSS/JS) — kein `setup.py`. Einstieg `index.html`;
weitere Views wie `dashboard.html`, `bestelltool(.|-list).html`,
`display-details.html`, `global.html`, `chart.html`, `defaultnewsletter.html`.
Assets unter `assets/`.

## Schnittstellen
### Konsumiert
- ⚠️ ANNAHME: konsumiert per JavaScript diverse HIS-/interne APIs (z. B.
  `smitrac`, sysmon, Bestelldaten). Genaue Endpunkte aus den JS-Dateien
  ableitbar, hier nicht im Detail erfasst.

### Bietet an
- Browser-UI für interne Service-/Verwaltungsaufgaben (statisch ausgeliefert).

## Deployment / Laufzeit
Als statische Dateien über einen Webserver ausgeliefert (intern). ⚠️ ANNAHME:
nur intern/hinter Auth erreichbar.

## Ersetzbarkeit
Kopplungsgrad: **mittel**. UI an die konsumierten Backends gebunden; als
Frontend-Schicht ersetzbar.

## Weitere Doku
- `README.md` (nur Titel).
- Verwandt: `cms`, `sysmon`, TYPO3-`smitrac`.
- ⚠️ ANNAHME: Zweck/Status im zentralen Repo `homeinfo-architektur` verifizieren.
