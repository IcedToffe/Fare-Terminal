// script.js
//
// Two ways to get a distance:
// 1. "Pumili ng Hintuan" — pick two stops on the known route. Distance is
//    just the difference between their km markers (loaded from routes.json).
// 2. "Alam ko ang Distansya" — type the distance directly, for trips not
//    on the listed route.
//
// Either way, the result goes through the same fare formula:
//   fare = baseFare + max(0, distance - baseKm) * ratePerKm
// with an optional 20% discount applied after.

const modeToggle = document.getElementById("modeToggle");
const panelStops = document.getElementById("panel-stops");
const panelManual = document.getElementById("panel-manual");

const fromStop = document.getElementById("fromStop");
const toStop = document.getElementById("toStop");
const stopsDistance = document.getElementById("stopsDistance");
const manualKm = document.getElementById("manualKm");

const discountCheck = document.getElementById("discountCheck");
const calcBtn = document.getElementById("calcBtn");
const errorText = document.getElementById("errorText");

const resultPlacard = document.getElementById("resultPlacard");
const placardDistance = document.getElementById("placardDistance");
const fareRegular = document.getElementById("fareRegular");
const fareDiscounted = document.getElementById("fareDiscounted");
const discountBlock = document.getElementById("discountBlock");
const placardBreakdown = document.getElementById("placardBreakdown");

const baseFareInput = document.getElementById("baseFare");
const baseKmInput = document.getElementById("baseKm");
const rateKmInput = document.getElementById("rateKm");

let currentMode = "stops";
let route = null;

// ---------- Load route data ----------

async function loadRoute() {
  try {
    const res = await fetch("routes.json");
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const routes = await res.json();
    route = routes[0]; // this project only has one route for now

    route.stops.forEach((stop, i) => {
      const optionFrom = new Option(stop.name, i);
      const optionTo = new Option(stop.name, i);
      fromStop.add(optionFrom);
      toStop.add(optionTo);
    });

    toStop.selectedIndex = route.stops.length - 1; // default: first to last stop
    updateStopsDistance();
  } catch (err) {
    stopsDistance.textContent =
      "Hindi na-load ang routes.json. Kung double-click mo lang ang file, gumamit ng local server.";
    console.error("Failed to load routes:", err);
  }
}

// ---------- Mode toggle ----------

modeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".mode-btn");
  if (!btn) return;

  currentMode = btn.dataset.mode;

  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.toggle("active", b === btn));
  panelStops.classList.toggle("active", currentMode === "stops");
  panelManual.classList.toggle("active", currentMode === "manual");

  resultPlacard.hidden = true;
  errorText.hidden = true;
});

// ---------- Distance between two selected stops ----------

function updateStopsDistance() {
  if (!route) return;

  const fromKm = route.stops[fromStop.value]?.km;
  const toKm = route.stops[toStop.value]?.km;

  if (fromKm === undefined || toKm === undefined) {
    stopsDistance.textContent = "";
    return;
  }

  const distance = Math.abs(toKm - fromKm);
  stopsDistance.textContent =
    distance === 0
      ? "Parehong hintuan — walang distansya."
      : `Distansya: ${distance} km`;
}

fromStop.addEventListener("change", updateStopsDistance);
toStop.addEventListener("change", updateStopsDistance);

// ---------- The fare formula ----------

function calculateFare(distanceKm, baseFare, baseKm, ratePerKm) {
  const extraKm = Math.max(0, distanceKm - baseKm);
  const fare = baseFare + extraKm * ratePerKm;
  return Math.round(fare * 100) / 100; // round to the nearest centavo
}

// ---------- Main calculate action ----------

calcBtn.addEventListener("click", () => {
  errorText.hidden = true;

  let distance;

  if (currentMode === "stops") {
    if (!route) {
      showError("Hindi pa handa ang route data.");
      return;
    }
    const fromKm = route.stops[fromStop.value].km;
    const toKm = route.stops[toStop.value].km;
    distance = Math.abs(toKm - fromKm);

    if (distance === 0) {
      showError("Pumili ng dalawang magkaibang hintuan.");
      return;
    }
  } else {
    distance = parseFloat(manualKm.value);
    if (isNaN(distance) || distance <= 0) {
      showError("Maglagay ng wastong distansya (hal. 12.5).");
      return;
    }
  }

  const baseFare = parseFloat(baseFareInput.value);
  const baseKm = parseFloat(baseKmInput.value);
  const ratePerKm = parseFloat(rateKmInput.value);

  if ([baseFare, baseKm, ratePerKm].some((n) => isNaN(n) || n < 0)) {
    showError("May mali sa fare settings. I-check ang mga numero.");
    return;
  }

  const regular = calculateFare(distance, baseFare, baseKm, ratePerKm);
  const discounted = Math.round(regular * 0.8 * 100) / 100;

  placardDistance.textContent = `${distance} km`;
  fareRegular.textContent = `₱${regular.toFixed(2)}`;

  if (discountCheck.checked) {
    discountBlock.hidden = false;
    fareDiscounted.textContent = `₱${discounted.toFixed(2)}`;
  } else {
    discountBlock.hidden = true;
  }

  const extraKm = Math.max(0, distance - baseKm);
  placardBreakdown.textContent =
    `₱${baseFare.toFixed(2)} (unang ${baseKm}km) + ` +
    `${extraKm.toFixed(1)}km × ₱${ratePerKm.toFixed(2)} = ₱${regular.toFixed(2)}`;

  resultPlacard.hidden = false;
});

function showError(message) {
  errorText.textContent = message;
  errorText.hidden = false;
  resultPlacard.hidden = true;
}

loadRoute();
