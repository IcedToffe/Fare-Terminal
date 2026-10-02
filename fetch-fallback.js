// fetch-fallback.js
//
// Browsers block fetch("routes.json") when the page is opened by
// double-clicking index.html (file://). This file runs BEFORE script.js and
// quietly supplies a built-in copy of the route data in that case.
//
// When the page is served normally (Live Server, GitHub Pages, Vercel),
// the real routes.json is used and this fallback is never needed.
//
// NOTE: keep this copy in sync with routes.json if you edit the km values.

(function () {
  const ROUTES_FALLBACK = [
    {
      id: "davao-tagum",
      name: "Davao – Panabo – Sto. Tomas – Tagum",
      note: "Distances are approximate road distances compiled from public distance-calculator sources, not a surveyed odometer reading.",
      stops: [
        { name: "Davao Terminal", km: 0 },
        { name: "Panabo Terminal", km: 32 },
        { name: "Sto. Tomas Terminal", km: 58 },
        { name: "Tagum Terminal", km: 87 }
      ]
    }
  ];

  const realFetch = window.fetch.bind(window);

  function fallbackResponse() {
    return new Response(JSON.stringify(ROUTES_FALLBACK), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";

    if (/(^|\/)routes\.json(\?.*)?$/.test(url)) {
      return realFetch(input, init).then(
        (res) => (res.ok ? res : fallbackResponse()),
        () => fallbackResponse()
      );
    }
    return realFetch(input, init);
  };
})();
