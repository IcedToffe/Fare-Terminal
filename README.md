# Fare Calculator 

A  fare calculator for the Davao Terminal → Panabo → Sto. Tomas →
Tagum route. Pick your two stops (or type a distance directly) and it
calculates the fare using the LTFRB bus fare formula 
with an editable fare matrix, since rates change over time.

**[Live demo →](#)** *(add your deployed link here once you host it)*

## Why I built this

Most beginner project lists suggest connecting to a generic API. I wanted
something that solves a problem I actually have — figuring out fare
for my own commute — using real route data and the real LTFRB fare formula,
not a toy example.

## Features

- Two ways to get a distance: pick two stops on the known route, or type a
  distance directly for trips not on the list
- Real fare formula: base fare for the first few km, plus a rate per
  additional km — exactly how LTFRB structures bus fares
- Editable fare matrix (base fare, base km, rate per km) so the calculator
  doesn't go stale when fares change
- 20% discount toggle for students, senior citizens, PWDs, and pregnant
  women — mandatory under LTFRB-Davao's current rules
- Map view of the route: all stops are plotted, and the segment between your
  selected stops is highlighted
- Fare comparison between aircon and ordinary buses for the same trip, with
  its own editable fare matrix
- Optional rounding to the nearest peso, since bus tickets are usually whole pesos
- Route distances for Davao Terminal, Panabo Terminal, Sto. Tomas Terminal,
  and Tagum Terminal, stored in their own `routes.json`
- Fully responsive, no frameworks — plain HTML, CSS, JavaScript, and JSON

## Where the numbers came from

- **Fare rates (defaults):** Aircon bus ₱15 for the first 5 km + ₱2.65 per
  succeeding km; Ordinary bus ₱13 for the first 5 km + ₱2.25 per succeeding km.
  These are the LTFRB bus matrix before the March 2026 adjustment (the 2022
  LTFRB-Davao announcement for ordinary city buses lists ₱13 + ₱2.25). The 20%
  discount for students/senior citizens/PWDs/pregnant women is mandatory.
  The March 2026 adjustment (aircon ₱18 + ₱2.98, ordinary ₱15 + ₱2.49, and a
  separate provincial matrix) may apply to your bus, so always check the matrix
  posted inside the bus and edit the fare settings if it differs.
- **Route distances:** compiled from public road-distance tools (not a
  surveyed odometer reading), cross-checked against each other for
  consistency: Davao–Panabo ≈ 32 km, Panabo–Sto. Tomas ≈ 26 km,
  Sto. Tomas–Tagum ≈ 28.8 km, giving cumulative markers of 0 / 32 / 58 / 87 km
  from Davao Terminal.
- **Map:** stop coordinates are approximate town-center positions in `map.js`,
  drawn with Leaflet on CARTO basemap tiles (OpenStreetMap data). They show where the stops are,
  not the exact road path.
- **Fares and distances change.** Both the fare matrix and the route
  distances are editable in the app / in `routes.json` — update them if
  LTFRB issues a new fare order, or if you measure the actual distance more
  precisely (e.g. with a GPS tracking app during an actual ride).

## Running it locally

Because this uses `fetch()` to load `routes.json`, double-clicking
`index.html` may not work in some browsers. Use one of these instead:

**Option A — VS Code Live Server:** install the extension, right-click
`index.html` → "Open with Live Server"

**Option B — Python's built-in server:**
```
python3 -m http.server
```
then open `http://localhost:8000`

Once deployed to Vercel or GitHub Pages, this isn't an issue. As a safety net,
`fetch-fallback.js` also supplies a built-in copy of the route data when the
page is opened by double-click, so the dropdowns still work. If you edit
`routes.json`, update that copy too. The map needs an internet connection.

## Tech stack

- HTML5
- Leaflet (map, loaded from a CDN)
- CSS3 (custom properties, flexbox, grid)
- Vanilla JavaScript (fetch API, async/await, form validation, number formatting)
- JSON for the route data

## What I'd add next

- More routes (jeepney, multicab, or other common commutes in Davao del Norte)
- A route line that follows the actual road instead of straight segments

## Author

Built by Milo ^_^
