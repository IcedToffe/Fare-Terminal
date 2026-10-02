// map.js
//
// Shows the route stops on a Leaflet map (OpenStreetMap tiles) and
// highlights the segment between the "Mula sa" and "Papunta sa" stops.
//
// Coordinates are approximate town-center positions, only meant for
// showing where the stops are. The order MUST match the stop order in
// routes.json (index 0 = first stop, and so on).

(function () {
  const STOPS = [
    { name: "Davao Terminal",      lat: 7.0731, lng: 125.6128 },
    { name: "Panabo Terminal",     lat: 7.3075, lng: 125.6840 },
    { name: "Sto. Tomas Terminal", lat: 7.5333, lng: 125.6167 },
    { name: "Tagum Terminal",      lat: 7.4478, lng: 125.8078 }
  ];

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

  // CARTO basemap (OpenStreetMap data). The standard OSM tile server blocks
  // pages opened by double-click (file://), which is why the first version
  // showed "Access blocked".
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
  }).addTo(map);

  const points = STOPS.map((s) => [s.lat, s.lng]);

  // Whole route (quiet), then a highlight layer redrawn on every change
  L.polyline(points, { color: SOFT, weight: 3, opacity: 0.6, dashArray: "6 8" }).addTo(map);
  map.fitBounds(points, { padding: [30, 30] });

  const highlight = L.layerGroup().addTo(map);

  function redraw() {
    highlight.clearLayers();

    const a = parseInt(fromStop.value, 10);
    const b = parseInt(toStop.value, 10);
    const hasSelection = !isNaN(a) && !isNaN(b) && STOPS[a] && STOPS[b];

    if (hasSelection && a !== b) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      L.polyline(points.slice(lo, hi + 1), { color: BLUE, weight: 6, opacity: 0.9 }).addTo(highlight);
    }

    STOPS.forEach((stop, i) => {
      const isFrom = hasSelection && i === a;
      const isTo = hasSelection && i === b;

      const marker = L.circleMarker([stop.lat, stop.lng], {
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

  // script.js fills the dropdowns after routes.json loads, so redraw then too
  new MutationObserver(redraw).observe(toStop, { childList: true });

  redraw();
})();
