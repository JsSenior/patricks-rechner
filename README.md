# 💼 Türsteher Rechner

Eine Progressive Web App (PWA) zur Berechnung des Verdienstes für Türsteher basierend auf konfigurierbaren Schichten.

## Features

- 📱 **Installierbare PWA** - Funktioniert offline und kann auf dem Homescreen installiert werden
- ⏰ **Flexible Zeiterfassung** - Eingabe von Arbeitszeiten mit Unterstützung für Nachtschichten
- 💶 **Automatische Berechnung** - Verdienst wird automatisch basierend auf konfigurierten Schichten berechnet
- 📊 **Historie** - Speicherung aller Berechnungen mit detaillierter Aufschlüsselung
- ⚙️ **Konfigurierbare Schichten** - Verwaltung von Zeiträumen und Stundensätzen
- 💾 **Lokale Speicherung** - Alle Daten werden lokal in IndexedDB gespeichert

## Live Demo

Die App ist verfügbar unter: `https://jssenior.github.io/patricks-rechner/`

## Verwendung

### Verdienst berechnen

1. Navigieren Sie zur **Rechner**-Seite
2. Geben Sie die Startzeit ein (z.B. 01:00)
3. Geben Sie die Endzeit ein (z.B. 06:00)
4. Aktivieren Sie "Über Nacht" wenn die Schicht über Mitternacht geht
5. Klicken Sie auf "Berechnen"
6. Die App zeigt den Gesamtverdienst und eine detaillierte Aufschlüsselung
7. Speichern Sie das Ergebnis optional in der Historie

### Schichten verwalten

1. Navigieren Sie zur **Einstellungen**-Seite
2. Fügen Sie neue Schichten hinzu:
   - Von: Startzeit der Schicht (z.B. 02:00)
   - Bis: Endzeit der Schicht (z.B. 04:00)
   - Stundensatz: Verdienst pro Stunde (z.B. 10)
3. Löschen Sie Schichten durch Klick auf "Löschen"

### Historie anzeigen

1. Navigieren Sie zur **Historie**-Seite
2. Sehen Sie alle gespeicherten Berechnungen
3. Jeder Eintrag zeigt Datum, Zeit, Arbeitszeit und Verdienst
4. Löschen Sie die gesamte Historie mit "Historie löschen"

## Installation

### Lokal ausführen

1. Klonen Sie das Repository:
```bash
git clone https://github.com/JsSenior/patricks-rechner.git
cd patricks-rechner
```

2. Starten Sie einen lokalen Webserver:
```bash
python3 -m http.server 8080
```

3. Öffnen Sie http://localhost:8080 in Ihrem Browser

### Auf dem Gerät installieren

1. Öffnen Sie die App in einem modernen Browser (Chrome, Edge, Safari)
2. Bei Chrome/Edge: Klicken Sie auf das "Installieren"-Symbol in der Adressleiste
3. Bei Safari (iOS): Tippen Sie auf "Teilen" → "Zum Home-Bildschirm"

## GitHub Pages Deployment

Die App ist bereits für GitHub Pages konfiguriert. Bei jedem Push zum main/master Branch wird die App automatisch deployed.

### Manuelles Deployment

1. Gehen Sie zu Repository Settings → Pages
2. Wählen Sie "Deploy from a branch"
3. Wählen Sie den Branch (main/master) und Ordner (/ root)
4. Klicken Sie auf "Save"

Die App ist dann verfügbar unter: `https://[username].github.io/patricks-rechner/`

## Technologie-Stack

- **HTML5** - Struktur und Semantik
- **CSS3** - Styling und Responsive Design
- **Vanilla JavaScript** - Logik und Interaktivität
- **IndexedDB** - Lokale Datenspeicherung
- **Service Worker** - Offline-Funktionalität und Caching
- **Web App Manifest** - PWA-Installation

## Browser-Unterstützung

- ✅ Chrome/Edge (empfohlen)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ✅ Opera

## Standard-Schichten

Die App wird mit folgenden Standard-Schichten ausgeliefert:
- 00:00 - 02:00: €12/h
- 02:00 - 04:00: €10/h
- 04:00 - 05:00: €20/h
- 05:00 - 06:00: €15/h

Diese können in den Einstellungen angepasst werden.

## Lizenz

MIT License