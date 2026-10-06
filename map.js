// map.js
//
// Shows the route stops on a Leaflet map (OpenStreetMap tiles) and
// highlights the segment between the "Mula sa" and "Papunta sa" stops.
//
// Coordinates are approximate town-center positions, only meant for
// showing where the stops are. Stops are matched by name, so a stop name in
// routes.json must also exist in COORDS below to appear on the map.

(function () {
  // Coordinates are looked up by stop name, so any route in routes.json can be drawn.
  const COORDS = {
    "Davao Terminal":      [7.0731, 125.6128],
    "Panabo Terminal":     [7.3075, 125.6840],
    "Carmen Terminal":     [7.3583, 125.7000],
    "Sto. Tomas Terminal": [7.5333, 125.6167],
    "Tagum Terminal":      [7.4478, 125.8078]
  };

  const mapEl = document.getElementById("routeMap");
  if (!mapEl) return;

  if (typeof L === "undefined") {
    mapEl.textContent = "Hindi na-load ang mapa. I-check ang internet connection.";
    mapEl.classList.add("map-fallback");
    return;
  }

  const fromStop = document.getElementById("fromStop");
  const toStop = document.getElementById("toStop");

  const styles = getComputedStyle(document.documentElement);
  const BLUE = styles.getPropertyValue("--blue").trim() || "#1D4E89";
  const RED = styles.getPropertyValue("--red").trim() || "#C8102E";
  const SOFT = styles.getPropertyValue("--ink-soft").trim() || "#6B7178";

  const map = L.map(mapEl, { scrollWheelZoom: false });

  // Tile providers, tried in order. If one starts failing (blocked, needs an
  // API key, offline...), the map automatically switches to the next one.
  //  - OpenStreetMap's own server refuses pages opened by double-click
  //    (file://), but is the right choice once the site is hosted.
  //  - Esri's street map works without an API key, including from file://.
  const PROVIDERS = [
    {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      options: { maxZoom: 18, attribution: "Tiles &copy; Esri" }
    },
    {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: { maxZoom: 18, attribution: "&copy; OpenStreetMap contributors" }
    }
  ];

  // When hosted over http(s), prefer OpenStreetMap first
  if (location.protocol === "http:" || location.protocol === "https:") {
    PROVIDERS.reverse();
  }

  let providerIndex = 0;
  let tileErrors = 0;
  let tiles = null;

  function useProvider(i) {
    if (tiles) map.removeLayer(tiles);
    tileErrors = 0;
    tiles = L.tileLayer(PROVIDERS[i].url, PROVIDERS[i].options).addTo(map);
    tiles.on("tileerror", () => {
      tileErrors += 1;
      if (tileErrors === 3 && providerIndex < PROVIDERS.length - 1) {
        providerIndex += 1;
        useProvider(providerIndex);
      }
    });
  }

  useProvider(providerIndex);

  // Default view (Davao del Norte area) until the dropdowns are filled
  map.setView([7.3, 125.65], 9);

  const baseLayer = L.layerGroup().addTo(map);
  const highlight = L.layerGroup().addTo(map);
  let lastRouteKey = "";

  // The current route's stops, read from the "Mula sa" dropdown (filled by script.js)
  function currentStops() {
    return Array.from(fromStop.options)
      .map((opt) => ({ name: opt.text, pos: COORDS[opt.text] }))
      .filter((s) => s.pos);
  }

  function redraw() {
    highlight.clearLayers();

    const stops = currentStops();
    if (stops.length === 0 || !route) return;

    // Whole road network (quiet). Drawn once per route.
    const routeKey = stops.map((s) => s.name).join("|");
    if (routeKey !== lastRouteKey) {
      baseLayer.clearLayers();
      const segments = route.segments || stops.slice(1).map((_, i) => ({ from: i, to: i + 1 }));
      segments.forEach((seg) => {
        L.polyline([stops[seg.from].pos, stops[seg.to].pos], {
          color: SOFT, weight: 3, opacity: 0.6, dashArray: "6 8"
        }).addTo(baseLayer);
      });
      map.fitBounds(stops.map((s) => s.pos), { padding: [30, 30] });
      lastRouteKey = routeKey;
    }

    const a = parseInt(fromStop.value, 10);
    const b = parseInt(toStop.value, 10);
    const hasSelection = !isNaN(a) && !isNaN(b) && stops[a] && stops[b];

    // Highlight the actual path of the selected trip
    if (hasSelection && a !== b) {
      const path = RouteGraph.shortest(route, a, b).path;
      L.polyline(path.map((i) => stops[i].pos), { color: BLUE, weight: 6, opacity: 0.9 }).addTo(highlight);
    }

    stops.forEach((stop, i) => {
      const isFrom = hasSelection && i === a;
      const isTo = hasSelection && i === b;

      const marker = L.circleMarker(stop.pos, {
        radius: isFrom || isTo ? 9 : 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: isTo ? RED : isFrom ? BLUE : SOFT,
        fillOpacity: 1
      }).addTo(highlight);

      marker.bindTooltip(stop.name, { permanent: true, direction: "top", offset: [0, -6] });
    });
  }

  fromStop.addEventListener("change", redraw);
  toStop.addEventListener("change", redraw);

  // script.js fills the dropdowns, so redraw when they change
  new MutationObserver(redraw).observe(toStop, { childList: true });

  redraw();
})();
