// ui.js
//
// Presentation only. Does NOT touch the fare logic: it only reads the numbers
// script.js / compare.js already put on the page, then
//  1. marks the cheaper column in the Aircon vs Ordinary table, and
//  2. shows a sticky fare bar on phones when the ticket is scrolled out of view.
// Loaded last, so its click handlers run after script.js and compare.js.

(function () {
  const $ = (id) => document.getElementById(id);

  const calcBtn = $("calcBtn");
  const modeToggle = $("modeToggle");
  const placard = $("resultPlacard");
  const table = $("compareTable");
  const fareBar = $("fareBar");
  const fareBarValue = $("fareBarValue");

  const num = (id) => parseFloat($(id).textContent.replace(/[^0-9.]/g, ""));

  // ---- 1. cheaper column ----
  function markCheaper() {
    table.querySelectorAll(".is-cheaper").forEach((el) => el.classList.remove("is-cheaper"));
    if ($("compareCard").hidden) return;

    const aircon = num("cmpAirconRegular");
    const ordinary = num("cmpOrdinaryRegular");
    if (isNaN(aircon) || isNaN(ordinary) || aircon === ordinary) return;

    const cheaper = aircon < ordinary ? "col-aircon" : "col-ordinary";
    table.querySelectorAll("." + cheaper).forEach((el) => el.classList.add("is-cheaper"));
  }

  // ---- 2. sticky fare bar (phones) ----
  let placardVisible = true;

  function syncBar() {
    if (placard.hidden) {
      fareBar.hidden = true;
      return;
    }
    const discounted = !$("discountBlock").hidden;
    fareBarValue.textContent = $(discounted ? "fareDiscounted" : "fareRegular").textContent;
    fareBar.hidden = placardVisible;
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      placardVisible = entries[0].isIntersecting;
      syncBar();
    }).observe(placard);
  }

  calcBtn.addEventListener("click", () => {
    markCheaper();
    syncBar();
    // bring the result into view on small screens
    if (!placard.hidden && window.matchMedia("(max-width: 899px)").matches) {
      placard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  modeToggle.addEventListener("click", () => {
    markCheaper();
    syncBar();
  });
})();
