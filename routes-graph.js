// routes-graph.js
//
// Works out the road distance between any two stops of a route.
//
// A route lists its stops and the road SEGMENTS between neighbouring stops
// (see routes.json). Because the Carmen road and the Sto. Tomas road both
// lead to Tagum, the stops are not one straight line, so the distance
// between two stops is the shortest way through the segments.
//
// Routes that only give a "km" marker per stop (no segments) still work:
// the distance is the difference between the markers.

const RouteGraph = (function () {
  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  // Returns { km, path } where path is the list of stop indexes travelled
  function shortest(route, from, to) {
    const start = Number(from);
    const end = Number(to);
    const n = route.stops.length;

    if (!route.segments) {
      const km = Math.abs(route.stops[end].km - route.stops[start].km);
      const step = end >= start ? 1 : -1;
      const path = [];
      for (let i = start; i !== end + step; i += step) path.push(i);
      return { km, path };
    }

    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const done = new Array(n).fill(false);
    dist[start] = 0;

    for (let round = 0; round < n; round++) {
      let u = -1;
      for (let i = 0; i < n; i++) {
        if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;
      }
      if (u === -1 || dist[u] === Infinity) break;
      done[u] = true;

      route.segments.forEach((s) => {
        let v = -1;
        if (s.from === u) v = s.to;
        else if (s.to === u) v = s.from;
        if (v !== -1 && dist[u] + s.km < dist[v]) {
          dist[v] = dist[u] + s.km;
          prev[v] = u;
        }
      });
    }

    const path = [];
    for (let at = end; at !== -1; at = prev[at]) path.unshift(at);
    return { km: round1(dist[end]), path };
  }

  return {
    shortest,
    distance: (route, from, to) => shortest(route, from, to).km
  };
})();
