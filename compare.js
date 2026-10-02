
(function () {
  const $ = (id) => document.getElementById(id);

  const calcBtn = $("calcBtn");
  const modeToggle = $("modeToggle");
  const resultPlacard = $("resultPlacard");
  const placardDistance = $("placardDistance");
  const placardBreakdown = $("placardBreakdown");
  const discountCheck = $("discountCheck");
  const roundCheck = $("roundPeso");

  const compareCard = $("compareCard");
  const compareDiscountRow = $("compareDiscountRow");
  const compareDiff = $("compareDiff");

  function fare(distance, baseFare, baseKm, ratePerKm) {
    const extraKm = Math.max(0, distance - baseKm);
    return baseFare + extraKm * ratePerKm;
  }

  // 20% discount is taken from the exact fare, then rounded (if rounding is on)
  function finalize(exactFare, withRounding) {
    const regular = withRounding ? Math.round(exactFare) : Math.round(exactFare * 100) / 100;
    const discountedExact = exactFare * 0.8;
    const discounted = withRounding ? Math.round(discountedExact) : Math.round(discountedExact * 100) / 100;
    return { regular, discounted };
  }

  function peso(n) {
    return "₱" + n.toFixed(2);
  }

  calcBtn.addEventListener("click", () => {
    // script.js already ran: if it showed an error, there is no result to work with
    if (resultPlacard.hidden) {
      compareCard.hidden = true;
      return;
    }

    const distance = parseFloat(placardDistance.textContent);

    const aBase = parseFloat($("baseFare").value);
    const aKm = parseFloat($("baseKm").value);
    const aRate = parseFloat($("rateKm").value);

    const oBase = parseFloat($("modernBaseFare").value);
    const oKm = parseFloat($("modernBaseKm").value);
    const oRate = parseFloat($("modernRateKm").value);

    const values = [distance, aBase, aKm, aRate, oBase, oKm, oRate];
    if (values.some((n) => isNaN(n) || n < 0)) {
      compareCard.hidden = true;
      return;
    }

    const rounding = roundCheck.checked;
    const aircon = finalize(fare(distance, aBase, aKm, aRate), rounding);
    const ordinary = finalize(fare(distance, oBase, oKm, oRate), rounding);

    // Update the main result placard (script.js showed the unrounded numbers)
    if (rounding) {
      $("fareRegular").textContent = peso(aircon.regular);
      $("fareDiscounted").textContent = peso(aircon.discounted);
      placardBreakdown.textContent += " (binilog sa pinakamalapit na piso)";
    }

    $("cmpAirconRegular").textContent = peso(aircon.regular);
    $("cmpOrdinaryRegular").textContent = peso(ordinary.regular);

    if (discountCheck.checked) {
      $("cmpAirconDiscount").textContent = peso(aircon.discounted);
      $("cmpOrdinaryDiscount").textContent = peso(ordinary.discounted);
      compareDiscountRow.hidden = false;
    } else {
      compareDiscountRow.hidden = true;
    }

    const diff = Math.round((aircon.regular - ordinary.regular) * 100) / 100;
    if (diff > 0) {
      compareDiff.textContent = `Mas mahal ng ${peso(diff)} ang Aircon kumpara sa Ordinary para sa ${distance} km.`;
    } else if (diff < 0) {
      compareDiff.textContent = `Mas mura ng ${peso(Math.abs(diff))} ang Aircon kumpara sa Ordinary para sa ${distance} km.`;
    } else {
      compareDiff.textContent = `Pareho ang pamasahe ng Aircon at Ordinary para sa ${distance} km.`;
    }

    compareCard.hidden = false;
  });

  // Switching modes clears the result in script.js, so clear the comparison too
  modeToggle.addEventListener("click", () => {
    compareCard.hidden = true;
  });
})();
