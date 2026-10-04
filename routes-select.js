// routes-select.js
//
// Lets you choose between the routes listed in routes.json (for example the
// Carmen highway route and the Sto. Tomas route). script.js loads the first
// route by default; this file swaps the stops when you pick another one.

(function () {
  const routeSelect = document.getElementById("routeSelect");
  if (!routeSelect) return;

  const resultPlacard = document.getElementById("resultPlacard");
  const compareCard = document.getElementById("compareCard");

  fetch("routes.json")
    .then((res) => res.json())
    .then((routes) => {
      routes.forEach((r, i) => routeSelect.add(new Option(r.name, i)));

      routeSelect.addEventListener("change", () => {
        // `route` is the variable declared in script.js
        route = routes[routeSelect.value];

        fromStop.innerHTML = "";
        toStop.innerHTML = "";
        route.stops.forEach((stop, i) => {
          fromStop.add(new Option(stop.name, i));
          toStop.add(new Option(stop.name, i));
        });
        toStop.selectedIndex = route.stops.length - 1;
        updateStopsDistance();

        resultPlacard.hidden = true;
        if (compareCard) compareCard.hidden = true;
      });
    })
    .catch((err) => console.error("Failed to load routes for the selector:", err));
})();
