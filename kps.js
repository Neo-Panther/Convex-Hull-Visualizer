const points = [];
let convexHull = [];
let actionHistory = []; // Array to store the history of actions
let currentStep = "drawLines"; // Track the current step of the algorithm
const svg_container = document.getElementsByClassName("svg-container")[0];
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const nxtbtn = document.getElementById("next-button");
const prevbtn = document.getElementById("prev-button");
const arandom = document.getElementById("add-random-button");
const skipbtn = document.getElementById("skip-steps");
svg_container.appendChild(svg);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
const ACTIONS = [];
var clickKara = 0;
const textc = document.getElementById('text-container-left');
/**
 * Action object [{}]
 * adot : {x: number, y: number, c: class}[]  // add these dots
 * rdot : {x: number, y: number}[]  // remove these dots
 * aline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // add these lines
 * rline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // remove these lines
 * cdot : {x: number, y: number, c: class, pc: class}[]  // change dot class
 * instr: "instruction to show"
 * class => string
*/

// Clear button functionality
document.getElementById("clear-button").addEventListener("click", function () {
  location.reload(); // Reload the page
});
// Random points function
arandom.addEventListener("click", function () {
  if(arandom.disabled){
    alert("Cannot add points while algorithm is running.");
    return;
  }
  skipbtn.disabled = false;
  nxtbtn.disabled = false;
  const svgWidth = svg.width.animVal.value - 100;
  const svgHeight = svg.height.animVal.value - 100;
  const svgX = 50;
  const svgY = 50;

  for (let i = 0; i < 5; i++) {
    const x = Math.floor(Math.random() * svgWidth) + svgX; // Random x within SVG container
    const y = Math.floor(Math.random() * svgHeight) + svgY; // Random y within SVG container
    addPointToSvg(x, y); // Call the existing function to add a point to the SVG
    points.push({ x: x, y: y });
  }
});
// Skip steps for faster completion
skipbtn.addEventListener("click", function(){
  if(nxtbtn.disabled){
    alert(msg);
    return;
  }
  for(var i = 0; i < 5; i++)
    nxtbtn.click();
});

function getSlope(point1, point2) {
  return (point1.y - point2.y) / (point2.x - point1.x);
}

function kps(points) {
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
      { x1: pumin.x, x2: pumax.x, y1: pumin.y, y2: pumax.y, c: "divider" },
      { x1: plmin.x, x2: plmax.x, y1: plmin.y, y2: plmax.y, c: "divider" },
    ],
    instr: "We find pumin, pumax and plmin, plmax to divide the upper hull and lower hull respectively"
  });
  ACTIONS.push({
    rdot: lowerHull.filter((point) => (point.x != pumax.x || point.y != pumax.y) && (point.x != pumin.x || point.y != pumin.y)),
    rline: [
      { x1: pumin.x, x2: pumax.x, y1: pumin.y, y2: pumax.y, c: "divider" },
      { x1: plmin.x, x2: plmax.x, y1: plmin.y, y2: plmax.y, c: "divider" },
    ],
    instr: "Let us now focus on the upper hull points"
  });
  ans.push(...upper_hull(pumin, pumax, upperHull));
  const newLowerHull = [];
  for (const point of lowerHull) {
    newLowerHull.push({ x: point.x, y: -point.y });
  }
  ACTIONS.push({
    aline: [
      { x1: pumin.x, x2: pumax.x, y1: pumin.y, y2: pumax.y, c: "divider" },
      { x1: plmin.x, x2: plmax.x, y1: plmin.y, y2: plmax.y, c: "divider" },
    ],
    adot: lowerHull.filter((point) => point !== pumax || point !== pumin),
    instr: "We return all original points after finding the upper hull"
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
      { x1: pumin.x, x2: pumax.x, y1: pumin.y, y2: pumax.y, c: "divider" },
      { x1: plmin.x, x2: plmax.x, y1: plmin.y, y2: plmax.y, c: "divider" },
    ],
    instr: "Let us now focus on the lower hull points"
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
    instr: "We return all original points after finding the lower hull"
  });
  return [
    ...new Map(ans.map((point) => [`${point.x}:${point.y}`, point])).values(),
  ];
}

function upper_hull(pmin, pmax, T) {
  if (pmin.x === pmax.x && pmin.y === pmax.y) {
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
        y2: svg.height.animVal.value,
        c: "medianx",
      },
    ],
    instr: "We find the median line to divide points into left and right"
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
      y2: svg.height.animVal.value,
      c: "medianx"
    }],
    instr: "We divide the points into left and right based on the median line"
  });
  const temp = upper_bridge(T, median);
  const pl = temp[0],
    pr = temp[1];
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
    instr: "We form a convex polygon with pmin, pl, pr, pmax; points inside will surely not be on the convex hull"
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
    instr: "We recurse on the remaining points on the left half"
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
    instr: "We recurse on the remaining points on the right half"
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
    instr: "We return all the points of this half after finding the hull points"
  });
  return ans;
}

function upper_bridge(S, L) {
  S.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  let candidates = [];

  if (S.length === 2) {
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
      instr: "Since there are only two points under consideration, these must lie on the hull"
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
          c: "random-pair-line",
        };
      }),
    ],
    rdot: [...removepoints],
    instr: "We pair the points randomly, while removing vertical ones"
  });
  // Calculate the median slope
  let slopes = pairs.map((pair) => pair.k);
  slopes.sort((a, b) => a - b);
  let medianSlope = slopes[Math.floor(slopes.length / 2)];

  ACTIONS.push({
    aline: [
      {
        x1: pairs[Math.floor(slopes.length / 2)][0].x,
        x2: pairs[Math.floor(slopes.length / 2)][1].x,
        y1: pairs[Math.floor(slopes.length / 2)][0].y,
        y2: pairs[Math.floor(slopes.length / 2)][1].y,
        c: "median-slope",
      },
    ],
    instr: "We find the line with the median slope among all pairs"
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

  const supportl = getSupportingLine(medianSlope, intercept, S[0].y < 0);
  ACTIONS.push({
    aline: [supportl],
    instr: "We find the support line with the median slope"
  });
  // Determine if h contains the bridge
  if (pk.x < L && pm.x >= L) {
    ACTIONS.push({
      rline: [
        {
          x1: pairs[Math.floor(slopes.length / 2)][0].x,
          x2: pairs[Math.floor(slopes.length / 2)][1].x,
          y1: pairs[Math.floor(slopes.length / 2)][0].y,
          y2: pairs[Math.floor(slopes.length / 2)][1].y,
          c: "median-slope",
        },
        supportl,
        ...pairs.map((pair) => {
          return {
            x1: pair[0].x,
            x2: pair[1].x,
            y1: pair[0].y,
            y2: pair[1].y,
            c: "random-pair-line",
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
      instr: "Since a point on the the support line lies in each half (created by  median-x), it must be our bridge"
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
      instr: "Since all points on the the support line lie to the left of the median-x, we remove the first point of lines with smaller slope (for lower bridge) or larger slope (for upper bridge)"
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
      instr: "Since all points on the support line lie to the right of the median-x, we remove the second point of lines with larger slope (for lower bridge) or smaller slope (for upper bridge)"
    });
    removepoints.push(...SMALL.concat(EQUAL).map((pair) => pair[1]));
  }
  ACTIONS.push({
    rline: [
      supportl,
      ...pairs.map((pair) => {
        return {
          x1: pair[0].x,
          x2: pair[1].x,
          y1: pair[0].y,
          y2: pair[1].y,
          c: "random-pair-line",
        };
      }),
      {
        x1: pairs[Math.floor(slopes.length / 2)][0].x,
        x2: pairs[Math.floor(slopes.length / 2)][1].x,
        y1: pairs[Math.floor(slopes.length / 2)][0].y,
        y2: pairs[Math.floor(slopes.length / 2)][1].y,
        c: "median-slope",
      },
    ],
    instr: "We remove all the lines and recurse on the remaining ones to find the bridge"
  });
  const ans = upper_bridge(candidates, L);
  ACTIONS.push({
    adot: [...removepoints],
    instr: "We add the removed points after finiding the upper bridge"
  });
  return ans;
}

function getSupportingLine(medianSlope, intercept, islower) {
  const h = svg.height.animVal.value, w = svg.width.animVal.value;
  return {
    x1: 0,
    x2: w,
    y1: (islower) ? intercept : -intercept,
    y2: (islower) ? (medianSlope * w + intercept) : -(medianSlope * w + intercept),
    c: "support",
  };
}

// Add a point to the SVG
function addPointToSvg(x, y, c) {
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", x);
  dot.setAttribute("cy", y);
  if(c) dot.setAttribute("class", c);
  svg.appendChild(dot);
  console.log("element=", dot);
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
  if(c)  line.classList.add(c);
  svg.appendChild(line);
  console.log("element=", line);
}

svg.addEventListener("click", function(event) {
  if(svg.classList.contains("running")){
    alert("Cannot add point while algorithm is running.");
    return;
  }
  const off = svg_container.getBoundingClientRect();
  points.push({ x: event.clientX - off.left, y: event.clientY - off.top });
  if(points.length === 3){
    nxtbtn.disabled = false;
    skipbtn.disabled = false;
  }
  addPointToSvg(event.clientX - off.left, event.clientY - off.top, "");
});

var msg = "Please add at least three points by clicking on the SVG.";
nxtbtn.addEventListener("click", function() {
  if(nxtbtn.disabled){
    alert(msg);
    return;
  } else if(clickKara === 0) {
    // Disable further inputs
    svg.classList.add("running");
    arandom.disabled = true;
    prevbtn.disabled = false;

    console.log("kps answer");
    console.log(...kps(points));
  }
  clickKara += 1;
  if(clickKara > ACTIONS.length){
    nxtbtn.disabled = true;
    skipbtn.disabled = true;
    msg = "Algorithm is finished, clear points or reload to restart";
    clickKara -= 1;
    return;
  }
  currentAction = ACTIONS[clickKara-1];
  textc.innerHTML = currentAction.instr;
  console.log("click", clickKara);

  if ("adot" in currentAction && currentAction.adot.length != 0){
    for(const dot of currentAction.adot){
      if(dot.y < 0) dot.y *= -1;
    }
    console.log("add dot", currentAction.adot);
    for(const dot of currentAction.adot){
      console.log(dot);
      addPointToSvg(dot.x, dot.y, dot.c);
    }
  } 
  if ("rdot" in currentAction && currentAction.rdot.length != 0) {
    const dots = document.getElementsByTagName("circle");
    console.log(dots);
    for(const dot of currentAction.rdot){
      if(dot.y < 0) dot.y *= -1;
    }
    console.log("remove dot", currentAction.rdot);
    for(const irdot of currentAction.rdot){
      for(const dot of dots){
        if(Number(dot.getAttribute('cx')) === irdot.x && Number(dot.getAttribute('cy')) === irdot.y){
          console.log(dot);
          dot.remove();
        }
      }
    }
  }
  if ("aline" in currentAction && currentAction.aline.length != 0){
    for(const line of currentAction.aline){
      if(line.c === "support") continue;
      if(line.y1 < 0) line.y1 *= -1;
      if(line.y2 < 0) line.y2 *= -1;
    }
    console.log("add line", currentAction.aline);
    for(const line of currentAction.aline){
      console.log(line);
      addLineToSvg(line.x1, line.y1, line.x2, line.y2, line.c);
    }
  } 
  if ("rline" in currentAction && currentAction.rline.length != 0) {
    for(const line of currentAction.rline){
      if(line.c === "support") continue;
      if(line.y1 < 0) line.y1 *= -1;
      if(line.y2 < 0) line.y2 *= -1;
    }
    console.log("remove line", currentAction.rline);
    const lines = document.getElementsByTagName("line");
    for(const irline of currentAction.rline){
      for(const line of lines){
        if(Number(line.getAttribute('x1')) === irline.x1 && Number(line.getAttribute('y1')) === irline.y1 && Number(line.getAttribute('x2')) === irline.x2 && Number(line.getAttribute('y2')) === irline.y2 && line.classList.contains(irline.c)){
          console.log(line);
          line.remove();
        }
      }
    }
  }
  if ("cdot" in currentAction && currentAction.cdot.length != 0) {
    for(const dot of currentAction.cdot){
      if(dot.y < 0) dot.y *= -1;
    }
    console.log("change class dot", currentAction.cdot);
    const dots = document.getElementsByTagName("circle");
    for(const icdot of currentAction.cdot){
      for(const dot of dots){
        if(Number(dot.getAttribute('cx')) === icdot.x && Number(dot.getAttribute('cy')) === icdot.y){
          console.log(dot);
          dot.setAttribute("class", icdot.c);
        }
      }
    }
  }
});

prevbtn.addEventListener("click", function() {
  if(prevbtn.disabled){
    alert("No previous step to go to");
    return;
  }
  if(nxtbtn.disabled) {
    skipbtn.disabled = false;
    nxtbtn.disabled = false;
  }
  clickKara-=1;
  const currentAction = ACTIONS[clickKara];
  if(clickKara===0){
    prevbtn.disabled = true;
    arandom.disabled = false;
    svg.classList.remove("running");
    textc.innerHTML = "Add points by tapping in the box";
  } else {
    textc.innerHTML = currentAction.instr;
  }
  if ("rdot" in currentAction && currentAction.rdot.length != 0){
    for(const dot of currentAction.rdot){
      if(dot.y < 0) dot.y *= -1;
    }
    console.log("add dot", currentAction.rdot);
    for(const dot of currentAction.rdot){
      console.log(dot);
      addPointToSvg(dot.x, dot.y, dot.c);
    }
  } 
  if ("adot" in currentAction && currentAction.adot.length != 0) {
    const dots = document.getElementsByTagName("circle");
    console.log(dots);
    for(const dot of currentAction.adot){
      if(dot.y < 0) dot.y *= -1;
    }
    console.log("remove dot", currentAction.adot);
    for(const irdot of currentAction.adot){
      for(const dot of dots){
        if(Number(dot.getAttribute('cx')) === irdot.x && Number(dot.getAttribute('cy')) === irdot.y){
          console.log(dot);
          dot.remove();
        }
      }
    }
  }
  if ("rline" in currentAction && currentAction.rline.length != 0){
    for(const line of currentAction.rline){
      if(line.c === "support") continue;
      if(line.y1 < 0) line.y1 *= -1;
      if(line.y2 < 0) line.y2 *= -1;
    }
    console.log("add line", currentAction.rline);
    for(const line of currentAction.rline){
      console.log(line);
      addLineToSvg(line.x1, line.y1, line.x2, line.y2, line.c);
    }
  } 
  if ("aline" in currentAction && currentAction.aline.length != 0) {
    for(const line of currentAction.aline){
      if(line.c === "support") continue;
      if(line.y1 < 0) line.y1 *= -1;
      if(line.y2 < 0) line.y2 *= -1;
    }
    console.log("remove line", currentAction.aline);
    const lines = document.getElementsByTagName("line");
    for(const irline of currentAction.aline){
      for(const line of lines){
        if(Number(line.getAttribute('x1')) === irline.x1 && Number(line.getAttribute('y1')) === irline.y1 && Number(line.getAttribute('x2')) === irline.x2 && Number(line.getAttribute('y2')) === irline.y2 && line.classList.contains(irline.c)){
          console.log(line);
          line.remove();
        }
      }
    }
  }
  if ("cdot" in currentAction && currentAction.cdot.length != 0) {
    for(const dot of currentAction.cdot){
      if(dot.y < 0) dot.y *= -1;
    }
    console.log("change class dot", currentAction.cdot);
    const dots = document.getElementsByTagName("circle");
    for(const icdot of currentAction.cdot){
      for(const dot of dots){
        if(Number(dot.getAttribute('cx')) === icdot.x && Number(dot.getAttribute('cy')) === icdot.y){
          console.log(dot);
          dot.setAttribute("class", icdot.pc);
        }
      }
    }
  }
  if(clickKara===0){
    ACTIONS.length = 0;
  }
});
