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
      "id": "davao-tagum-network",
      "name": "Davao – Panabo – Carmen – Sto. Tomas – Tagum",
      "note": "Segment lengths are approximate road distances, not a surveyed odometer reading. The distance between any two stops is the shortest way through these segments. Adjust the km values if you know the actual distance more precisely.",
      "stops": [
        {
          "name": "Davao Terminal"
        },
        {
          "name": "Panabo Terminal"
        },
        {
          "name": "Carmen Terminal"
        },
        {
          "name": "Sto. Tomas Terminal"
        },
        {
          "name": "Tagum Terminal"
        }
      ],
      "segments": [
        {
          "from": 0,
          "to": 1,
          "km": 32
        },
        {
          "from": 1,
          "to": 2,
          "km": 8
        },
        {
          "from": 2,
          "to": 4,
          "km": 15
        },
        {
          "from": 1,
          "to": 3,
          "km": 26
        },
        {
          "from": 3,
          "to": 4,
          "km": 28.8
        }
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
