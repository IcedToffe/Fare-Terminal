// compare.js
//
// After a fare is calculated, shows traditional vs modern (aircon) jeepney
// side by side for the same distance. Uses the same formula as script.js:
//   fare = baseFare + max(0, distance - baseKm) * ratePerKm
//
// Traditional values come from the existing fare matrix inputs; modern
// values come from the new "Modern jeepney" inputs in the settings panel.

(function () {
  const $ = (id) => document.getElementById(id);

  const calcBtn = $("calcBtn");
  const modeToggle = $("modeToggle");
  const resultPlacard = $("resultPlacard");
  const placardDistance = $("placardDistance");
  const discountCheck = $("discountCheck");

  const compareCard = $("compareCard");
  const compareDiscountRow = $("compareDiscountRow");
  const compareDiff = $("compareDiff");

  function fare(distance, baseFare, baseKm, ratePerKm) {
    const extraKm = Math.max(0, distance - baseKm);
    return Math.round((baseFare + extraKm * ratePerKm) * 100) / 100;
  }

  function discount(amount) {
    return Math.round(amount * 0.8 * 100) / 100;
  }

  function peso(n) {
    return "₱" + n.toFixed(2);
  }

  calcBtn.addEventListener("click", () => {
    // script.js already ran: if it showed an error, there is no result to compare
    if (resultPlacard.hidden) {
      compareCard.hidden = true;
      return;
    }

    const distance = parseFloat(placardDistance.textContent);

    const tBase = parseFloat($("baseFare").value);
    const tKm = parseFloat($("baseKm").value);
    const tRate = parseFloat($("rateKm").value);

    const mBase = parseFloat($("modernBaseFare").value);
    const mKm = parseFloat($("modernBaseKm").value);
    const mRate = parseFloat($("modernRateKm").value);

    const values = [distance, tBase, tKm, tRate, mBase, mKm, mRate];
    if (values.some((n) => isNaN(n) || n < 0)) {
      compareCard.hidden = true;
      return;
    }

    const trad = fare(distance, tBase, tKm, tRate);
    const modern = fare(distance, mBase, mKm, mRate);

    $("cmpTradRegular").textContent = peso(trad);
    $("cmpModernRegular").textContent = peso(modern);

    if (discountCheck.checked) {
      $("cmpTradDiscount").textContent = peso(discount(trad));
      $("cmpModernDiscount").textContent = peso(discount(modern));
      compareDiscountRow.hidden = false;
    } else {
      compareDiscountRow.hidden = true;
    }

    const diff = Math.round((modern - trad) * 100) / 100;
    if (diff > 0) {
      compareDiff.textContent = `Mas mahal ng ${peso(diff)} ang Modern kumpara sa Traditional para sa ${distance} km.`;
    } else if (diff < 0) {
      compareDiff.textContent = `Mas mura ng ${peso(Math.abs(diff))} ang Modern kumpara sa Traditional para sa ${distance} km.`;
    } else {
      compareDiff.textContent = `Pareho ang pamasahe ng Traditional at Modern para sa ${distance} km.`;
    }

    compareCard.hidden = false;
  });

  // Switching modes clears the result in script.js, so clear the comparison too
  modeToggle.addEventListener("click", () => {
    compareCard.hidden = true;
  });
})();
