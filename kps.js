const points = [];
let convexHull = [];
let actionHistory = []; // Array to store the history of actions
let currentStep = "drawLines"; // Track the current step of the algorithm
const svg_container = document.getElementsByClassName("svg-container")[0];
const off = svg_container.getBoundingClientRect();
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const nxtbtn = document.getElementById("next-button");
svg_container.appendChild(svg);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
const ACTIONS = [];
var clickKara = 0;

/**
 * Action object
 * adot : {x: number, y: number, c: class}[]  // add these dots
 * rdot : {x: number, y: number}[]  // remove these dots
 * aline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // add these lines
 * rline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // remove these lines
 * cdot : {x: number, y: number, c: class, pc: class}[]  // change dot class
 * cline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // change line class
 * default class: solid black
 * class => string
*/

function getSlope(point1, point2) {
  return (point1.y - point2.y) / (point2.x - point1.x);
}

function kps(points) {
  console.log("kps in", ...points);
  points.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  const pmin = points[0];
  const pmax = points[points.length - 1];
  const upperHull = [];
  var lowerHull = [];
  // find pumin
  var pumin = pmin,
    pumax = pmax,
    plmin = pmin,
    plmax = pmax;
  for (const point of points) {
    if (pmin.x === point.x) {
      if (point.y < pumin.y) {
        pumin = point;
      } else if (point.y > plmin.y) {
        plmin = point;
      }
    } else if (pmax.x === point.x) {
      if (point.y < pumax.y) {
        pumax = point;
      } else if (point.y > plmax.y) {
        plmax = point;
      }
    } else {
      upperHull.push(point);
      lowerHull.push(point);
    }
  }
  var uslope = getSlope(pumax, pumin);
  for (var i = upperHull.length - 1; i >= 0; i--) {
    if (getSlope(pumin, upperHull[i]) < uslope) {
      upperHull.splice(i, 1);
    }
  }
  upperHull.push(pumax, pumin);
  var lslope = getSlope(plmax, plmin);
  for (var i = lowerHull.length - 1; i >= 0; i--) {
    if (getSlope(plmin, lowerHull[i]) > lslope) {
      lowerHull.splice(i, 1);
    }
  }
  lowerHull.push(plmin, plmax);
  const ans = [];

  ACTIONS.push({
    aline: [
      { x1: pumin.x, x2: pumin.x, y1: pumin.y, y2: pumin.y, c: "divider" },
      { x1: plmin.x, x2: plmin.x, y1: plmin.y, y2: plmin.y, c: "divider" },
    ],
  });
  ACTIONS.push({
    rdot: lowerHull.filter((point) => point !== pumax || point !== pumin),
    rline: [
      { x1: pumin.x, x2: pumin.x, y1: pumin.y, y2: pumin.y, c: "divider" },
      { x1: plmin.x, x2: plmin.x, y1: plmin.y, y2: plmin.y, c: "divider" },
    ],
  });
  ans.push(...upper_hull(pumin, pumax, upperHull));
  const newLowerHull = [];
  for (const point of lowerHull) {
    newLowerHull.push({ x: point.x, y: -point.y });
  }
  ACTIONS.push({
    aline: [
      { x1: pumin.x, x2: pumin.x, y1: pumin.y, y2: pumin.y, c: "divider" },
      { x1: plmin.x, x2: plmin.x, y1: plmin.y, y2: plmin.y, c: "divider" },
    ],
    adot: lowerHull.filter((point) => point !== pumax || point !== pumin),
  });
  ACTIONS.push({
    rdot: upperHull.filter((point) => {
      for (const p of ans) {
        if (p.x === point.x && p.y === point.y) {
          return 0;
        }
      }
      return 1;
    }),
    rline: [
      { x1: pumin.x, x2: pumin.x, y1: pumin.y, y2: pumin.y, c: "divider" },
      { x1: plmin.x, x2: plmin.x, y1: plmin.y, y2: plmin.y, c: "divider" },
    ],
  });
  lowerHull = newLowerHull;
  plmin = { x: plmin.x, y: -plmin.y };
  plmax = { x: plmax.x, y: -plmax.y };
  const temp = upper_hull(plmin, plmax, lowerHull).reverse();
  for (const point of temp) {
    ans.push({ x: point.x, y: -point.y });
  }
  if (ans.length == 0) {
    ans.push(pumax, plmax);
  }
  ACTIONS.push({
    adot: points.filter((point) => {
      for (const p of ans) {
        if (p.x === point.x && p.y === point.y) {
          return 0;
        }
      }
      return 1;
    }),
  });
  console.log("kps out");
  console.log(...ans);
  return [
    ...new Map(ans.map((point) => [`${point.x}:${point.y}`, point])).values(),
  ];
}

function upper_hull(pmin, pmax, T) {
  console.log("uhull in", pmin, pmax, T);
  if (pmin.x === pmax.x && pmin.y === pmax.y) {
    console.log("uhull out", []);
    return [];
  }
  T.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  var median = 0;
  if (T.length % 2) {
    median = T[Math.floor(T.length / 2)].x;
  } else {
    median =
      (T[Math.floor(T.length / 2)].x + T[Math.floor(T.length / 2) - 1].x) / 2;
  }
  ACTIONS.push({
    aline: [
      {
        x1: median,
        x2: median,
        y1: 0,
        y2: Number(svg.getAttribute("innerHeight")),
        c: "medianx",
      },
    ],
  });
  const Tleft = [],
    Tright = [];
  for (const point of T) {
    if (point.x < median) {
      Tleft.push(point);
    } else {
      Tright.push(point);
    }
  }
  ACTIONS.push({
    cdot: [...Tleft.map((point) =>{ return {
      x: point.x,
      y: point.y,
      c: "left",
      pc: ""
    }}), ...Tright.map((point) => { return {
      x: point.x,
      y: point.y,
      c: "right",
      pc: ""
    }})],
    rline: [{
      x1: median,
      x2: median,
      y1: 0,
      y2: Number(svg.getAttribute("innerHeight")),
      c: "medianx"
    }]
  });
  const temp = upper_bridge(T, median);
  const pl = temp[0],
    pr = temp[1];
  console.log("check1", pl, pr);
  const removepoints = [];
  const slopeleft = getSlope(pmin, pl);
  for (var i = Tleft.length - 1; i >= 0; i--) {
    if (getSlope(pmin, Tleft[i]) < slopeleft) {
      removepoints.push(Tleft[i]);
      Tleft.splice(i, 1);
    }
  }
  const sloperight = getSlope(pmax, pr);
  for (var i = Tright.length - 1; i >= 0; i--) {
    if (getSlope(pmax, Tright[i]) > sloperight) {
      removepoints.push(Tright[i]);
      Tright.splice(i, 1);
    }
  }
  const ans = [];
  ACTIONS.push({
    aline: [
      {
        x1: pmin.x,
        x2: pl.x,
        y1: pmin.y,
        y2: pl.y,
        c: "trapezium",
      },
      {
        x1: pmin.x,
        x2: pmax.x,
        y1: pmin.y,
        y2: pmax.y,
        c: "trapezium",
      },
      {
        x1: pmax.x,
        x2: pr.x,
        y1: pmax.y,
        y2: pr.y,
        c: "trapezium",
      },
    ],
    rdot: [...removepoints],
  });
  ACTIONS.push({
    rdot: [...Tright],
    rline: [
      {
        x1: pmin.x,
        x2: pl.x,
        y1: pmin.y,
        y2: pl.y,
        c: "trapezium",
      },
      {
        x1: pmin.x,
        x2: pmax.x,
        y1: pmin.y,
        y2: pmax.y,
        c: "trapezium",
      },
      {
        x1: pmax.x,
        x2: pr.x,
        y1: pmax.y,
        y2: pr.y,
        c: "trapezium",
      },
    ],
  });
  ans.push(...upper_hull(pmin, pl, Tleft));
  ans.push(pl, pr);
  ACTIONS.push({
    adot: [
      ...Tright.map((point) => {
        return {
          x: point.x,
          y: point.y,
          c: "right",
        };
      }),
    ],
    rdot: [...Tleft],
  });
  ans.push(...upper_hull(pr, pmax, Tright));
  ACTIONS.push({
    adot: [...Tleft, ...removepoints],
    cdot: [...Tright.map((point) => { return {
      x: point.x,
      y: point.y,
      pc: "right",
      c: ""
    }})],
  })
  console.log("uhull out");
  console.log(...ans);
  return ans;
}

function upper_bridge(S, L) {
  S.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  console.log("ubridge in", S, L);
  let candidates = [];

  if (S.length === 2) {
    console.log("ubridge out", [S[0], S[1]]);
    ACTIONS.push({
      aline: [
        {
          x1: S[0].x,
          x2: S[1].x,
          y1: S[0].y,
          y2: S[1].y,
          c: "hull",
        },
      ],
    });
    return S[0].x < S[1].x ? [S[0], S[1]] : [S[1], S[0]];
  }

  let pairs = [];
  for (let i = 0; i < S.length; i += 2) {
    if (i + 1 < S.length) {
      pairs.push([S[i], S[i + 1]]);
    } else {
      candidates.push(S[i]);
    }
  }
  let newPairs = [];
  const removepoints = [];
  pairs.forEach((pair) => {
    if (pair[0].x === pair[1].x) {
      if (pair[0].y > pair[1].y) {
        candidates.push(pair[1]);
        removepoints.push(pair[0]);
      } else {
        candidates.push(pair[0]);
        removepoints.push(pair[1]);
      }
    } else {
      pair.k = getSlope(pair[0], pair[1]);
      newPairs.push(pair);
    }
  });
  pairs = newPairs;
  ACTIONS.push({
    aline: [
      ...pairs.map((pair) => {
        return {
          x1: pair[0].x,
          x2: pair[1].x,
          y1: pair[0].y,
          y2: pair[1].y,
          c: "randompairline",
        };
      }),
    ],
    rdot: [...removepoints],
  });
  // Calculate the median slope
  let slopes = pairs.map((pair) => pair.k);
  slopes.sort((a, b) => a - b);
  let medianSlope = slopes[Math.floor(slopes.length / 2)];

  ACTIONS.push({
    cline: [
      {
        x1: pairs[Math.floor(slopes.length / 2)][0].x,
        x2: pairs[Math.floor(slopes.length / 2)][1].x,
        y1: pairs[Math.floor(slopes.length / 2)][0].y,
        y2: pairs[Math.floor(slopes.length / 2)][1].y,
        c: "medianslope",
      },
    ],
  });

  // Divide pairs into SMALL, EQUAL, and LARGE based on their slopes
  let SMALL = pairs.filter((pair) => pair.k < medianSlope);
  let EQUAL = pairs.filter((pair) => pair.k === medianSlope);
  let LARGE = pairs.filter((pair) => pair.k > medianSlope);

  // Find a supporting line of S with slope medianSlope
  let intercept = Math.max(
    ...S.map((point) => -point.y - medianSlope * point.x)
  );
  let MAX = S.filter(
    (point) => Math.abs(-point.y - medianSlope * point.x - intercept) < 0.03
  );
  let pk = MAX.reduce(
    (minPoint, point) => (point.x < minPoint.x ? point : minPoint),
    MAX[0]
  );
  let pm = MAX.reduce(
    (maxPoint, point) => (point.x > maxPoint.x ? point : maxPoint),
    MAX[0]
  );

  ACTIONS.push({
    aline: [getSupportingLine(medianSlope, intercept)],
  });
  // Determine if h contains the bridge
  if (pk.x < L && pm.x >= L) {
    console.log("ubridge out", [pk, pm]);
    ACTIONS.push({
      rline: [
        getSupportingLine(medianSlope, intercept),
        ...pairs.map((pair) => {
          return {
            x1: pair[0].x,
            x2: pair[1].x,
            y1: pair[0].y,
            y2: pair[1].y,
            c: "randompairline",
          };
        }),
      ],
      aline: [
        {
          x1: pk.x,
          x2: pm.x,
          y1: pk.y,
          y2: pm.y,
          c: "hull",
        },
      ],
    });
    return [pk, pm];
  }

  // h contains only points of S to the left of or on L
  if (pm.x < L) {
    SMALL.forEach((pair) => {
      candidates.push(pair[0]);
      candidates.push(pair[1]);
    });
    LARGE.concat(EQUAL).forEach((pair) => candidates.push(pair[1]));
    ACTIONS.push({
      rdot: LARGE.concat(EQUAL).map((pair) => pair[0]),
    });
    removepoints.push(...LARGE.concat(EQUAL).map((pair) => pair[0]));
  }

  // h contains only points of S to the right of L
  else if (pm.x >= L) {
    SMALL.concat(EQUAL).forEach((pair) => candidates.push(pair[0]));
    LARGE.forEach((pair) => {
      candidates.push(pair[0]);
      candidates.push(pair[1]);
    });
    ACTIONS.push({
      rdot: SMALL.concat(EQUAL).map((pair) => pair[1]),
    });
    removepoints.push(...SMALL.concat(EQUAL).map((pair) => pair[1]));
  }
  ACTIONS.push({
    rline: [
      getSupportingLine(medianSlope, intercept),
      ...pairs.map((pair) => {
        return {
          x1: pair[0].x,
          x2: pair[1].x,
          y1: pair[0].y,
          y2: pair[1].y,
          c: "randompairline",
        };
      }),
    ],
  });
  const ans = upper_bridge(candidates, L);
  ACTIONS.push({
    adot: [...removepoints],
  });
  console.log("ubridge out", ans);
  return ans;
}

function getSupportingLine(medianSlope, intercept) {
  return {
    x1: 0,
    x2: Number(svg.getAttribute("innerWidth")),
    y1: -intercept,
    y2: -(medianSlope * Number(svg.getAttribute("innerWidth")) + intercept),
    c: "support",
  };
}

// Add a point to the SVG
function addPointToSvg(x, y, c) {
  var offx = off.left;
  var offy = off.top;
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", x - offx);
  dot.setAttribute("cy", y - offy);
  dot.setAttribute("r", 5);
  dot.setAttribute("class", "dot");
  if(c) dot.classList.add(c);
  svg.appendChild(dot);
  points.push({ x: x - offx, y: y - offy });
  console.log("x-cor" + x + "y-cor" + y);
}

function addLineToSvg(x1, y1, x2, y2, c){
  const line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  if(!c)
    line.setAttribute("class", "dashed-line"); // Add class for animation
  else
    line.setAttribute("class", c);
  svg.appendChild(line);
}

svg.addEventListener("click", function(event) {
  if(svg.classList.contains("disabled")){
    alert("Cannot add point while algorithm is running.");
    return;
  }
  addPointToSvg(event.clientX, event.clientY, "");
})


nxtbtn.addEventListener("click", function () {
  if(nxtbtn.classList.contains("disabled")){
    alert("Please add at least three points by clicking on the SVG.");
    return;
  }
  // Disable further inputs
  svg.classList.add("disabled");

  clickKara += 1;
  if(clickKara === 1){
    kps(points);
  }
  currentAction = ACTIONS[clickKara-1];

  if ("adot" in currentAction && currentAction.adot.length != 0){
    for(const dot of currentAction.adot){
      addPointToSvg(dot.x, dot.y, dot.c);
    }
  } 
  if ("rdot" in currentAction && currentAction.adot.length != 0) {
    const dots = document.getElementsByClassName("dot");
    
  }
});
