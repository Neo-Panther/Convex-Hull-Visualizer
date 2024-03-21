const points = [];
let convexHull = [];
let actionHistory = []; // Array to store the history of actions
let currentStep = "drawLines"; // Track the current step of the algorithm
const svg_container = document.getElementsByClassName("svg-container")[0];
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg_container.appendChild(svg);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
const ACTIONS = [];
/**
 * 
 * 
 * 
 */
let clickKara = 0;
let svgClickListener = null; // Variable to store the click listener

// JavaScript code

function getSlope(point1, point2){
  return (point1.y-point2.y)/(point2.x-point1.x);
}

function kps(points){
  console.log("kps in",   ...points);
  points.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  const pmin = points[0];
  const pmax = points[points.length - 1];
  const upperHull = [];
  var lowerHull = [];
  // find pumin
  var pumin = pmin, pumax = pmax, plmin = pmin, plmax = pmax;
  for(const point of points){
    if(pmin.x === point.x){
      if(point.y > pumin.y){
        pumin = point;
      } else if (point.y < plmin.y){
        plmin = point;
      }
    } else if(pmax.x === point.x){
      if(point.y > pumax.y){
        pumax = point;
      } else if (point.y < plmax.y){
        plmax = point;
      }
    } else {
      upperHull.push(point);
      lowerHull.push(point);
    }
  }
  var uslope = getSlope(pumax, pumin);
  for(var i = upperHull.length - 1; i >= 0; i--){
    if(getSlope(pumin, upperHull[i]) < uslope){
      upperHull.splice(i, 1);
    }
  }
  upperHull.push(pumax, pumin);
  var lslope = getSlope(plmax, plmin);
  for(var i = lowerHull.length - 1; i >= 0; i--){
    if(getSlope(plmin, lowerHull[i]) > lslope){
      lowerHull.splice(i, 1);
    }
  }
  lowerHull.push(plmin, plmax);
  const ans = [];
  ans.push(...upper_hull(pumin, pumax, upperHull));
  ans.push(pumax);
  const newLowerHull = [];
  for(const point of lowerHull){
    newLowerHull.push({x: point.x, y: -point.y});
  }
  lowerHull = newLowerHull;
  plmin = {x: plmin.x, y: -plmin.y};
  plmax = {x: plmax.x, y: -plmax.y};
  const temp = upper_hull(plmin, plmax, lowerHull).reverse();
  for(const point of temp){
    ans.push({x: point.x, y: -point.y});
  }
  // ans.push(...(lower_hull(plmin, plmax, lowerHull).reverse()));
  console.log("kps out");
  console.log(...ans);
  return ans;
}

function upper_hull(pmin, pmax, T){
  console.log("uhull in", pmin, pmax, T);
  if(pmin.x === pmax.x && pmin.y === pmax.y){
    console.log("uhull out", []);
    return [];
  }
  T.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  var median = 0;
  if(T.length%2){
    median = T[Math.floor(T.length/2)].x;
  } else {
    median = (T[Math.floor(T.length/2)].x + T[Math.floor(T.length/2) - 1].x)/2;
  }
  const Tleft = [], Tright = [];
  for(const point of T){
    if(point.x < median){
      Tleft.push(point);
    } else {
      Tright.push(point);
    }
  }
  const temp = upper_bridge(T, median);
  const pl = temp[0], pr = temp[1];
  console.log("check1", pl, pr);
  const slopeleft = getSlope(pmin, pl);
  for(var i = Tleft.length - 1; i >= 0; i--){
    if(getSlope(pmin, Tleft[i]) < slopeleft){
      Tleft.splice(i, 1);
    }
  }
  // Tleft.push(pl);
  const sloperight = getSlope(pmax, pr);
  for(var i = Tright.length - 1; i >= 0; i--){
    if(getSlope(pmax, Tright[i]) > sloperight){
      Tright.splice(i, 1);
    }
  }
  // Tright.push(pr);
  const ans = [];
  ans.push(...upper_hull(pmin, pl, Tleft));
  ans.push(pl);
  ans.push(...upper_hull(pr, pmax, Tright));
  console.log("uhull out");
  console.log(...ans);
  return ans;
}

function lower_hull(pmin, pmax, T){
  console.log("lhull in", pmin, pmax, T);
  if(pmin.x === pmax.x && pmin.y === pmax.y){
    console.log("lhull out", []);
    return [];
  }
  T.sort(function (a, b) {
    return a.x - b.x || a.y - b.y;
  });
  var median = 0;
  if(T.length%2){
    median = T[Math.floor(T.length/2)].x;
  } else {
    median = (T[Math.floor(T.length/2)].x + T[Math.floor(T.length/2) - 1].x)/2;
  }
  const Tleft = [], Tright = [];
  for(const point of T){
    if(point.x < median){
      Tleft.push(point);
    } else {
      Tright.push(point);
    }
  }
  const temp = lower_bridge(T, median);
  const pl = temp[0], pr = temp[1];
  const slopeleft = getSlope(pmin, pl);
  for(var i = Tleft.length - 1; i >= 0; i--){
    if(getSlope(pmin, Tleft[i]) > slopeleft){
      Tleft.splice(i, 1);
    }
  }
  // Tleft.push(pl);
  const sloperight = getSlope(pmax, pr);
  for(var i = Tright.length - 1; i >= 0; i--){
    if(getSlope(pmax, Tright[i]) < sloperight){
      Tright.splice(i, 1);
    }
  }
  // Tright.push(pr);
  const ans = [];
  ans.push(...lower_hull(pmin, pl, Tleft));
  ans.push(pl);
  ans.push(...lower_hull(pr, pmax, Tright));
  console.log("lhull out");
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
    console.log("ubridge out",  [S[0], S[1]]);
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
  pairs.forEach(pair => {
    if (pair[0].x === pair[1].x) {
      if (pair[0].y > pair[1].y) {
        candidates.push(pair[0]);
      } else {
        candidates.push(pair[1]);
      }
    } else {
      pair.k = (pair[0].y - pair[1].y) / (pair[0].x - pair[1].x);
      newPairs.push(pair);
    }
  });
  pairs = newPairs;

  // Calculate the median slope
  let slopes = pairs.map(pair => pair.k);
  slopes.sort((a, b) => a - b);
  let medianSlope = slopes[Math.floor(slopes.length / 2)];

  // Divide pairs into SMALL, EQUAL, and LARGE based on their slopes
  let SMALL = pairs.filter(pair => pair.k < medianSlope);
  let EQUAL = pairs.filter(pair => pair.k === medianSlope);
  let LARGE = pairs.filter(pair => pair.k > medianSlope);

  // Find a supporting line of S with slope medianSlope
  let intercept = Math.min(...S.map(point => point.y - medianSlope * point.x));
  let MIN = S.filter(point => Math.abs(point.y - medianSlope * point.x - intercept) < 0.03);
  let pk = MIN.reduce((minPoint, point) => point.x < minPoint.x ? point : minPoint, MIN[0]);
  let pm = MIN.reduce((maxPoint, point) => point.x > maxPoint.x ? point : maxPoint, MIN[0]);

  // Determine if h contains the bridge
  if (pk.x < L && pm.x >= L) {
    console.log("ubridge out",   [pk, pm]);
    return [pk, pm];
  }

  // h contains only points of S to the left of or on L
  if (pm.x <= L) {
    SMALL.forEach(pair => {
        candidates.push(pair[0]);
        candidates.push(pair[1]);
    });
    LARGE.concat(EQUAL).forEach(pair => candidates.push(pair[1]));
  }

  // h contains only points of S to the right of L
  if (pm.x > L) {
    SMALL.concat(EQUAL).forEach(pair => candidates.push(pair[0]));
    LARGE.forEach(pair => {
      candidates.push(pair[0]);
      candidates.push(pair[1]);
    });
  }
  const ans = upper_bridge(candidates, L);
  console.log("ubridge out", ans);
  return ans;
}

function lower_bridge(S, L){
  S.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  console.log("lbridge in",   S, L);
  let candidates = [];

  if (S.length === 2) {
    console.log("lbridge out",  [S[0], S[1]]);
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
  pairs.forEach(pair => {
    if (pair[0].x === pair[1].x) {
      if (pair[0].y < pair[1].y) {
        candidates.push(pair[0]);
      } else {
        candidates.push(pair[1]);
      }
    } else {
      pair.k = (pair[0].y - pair[1].y) / (pair[0].x - pair[1].x);
      newPairs.push(pair);
    }
  });
  pairs = newPairs;

  // Calculate the median slope
  let slopes = pairs.map(pair => pair.k);
  slopes.sort((a, b) => a - b);
  let medianSlope = slopes[Math.floor(slopes.length / 2)];

  // Divide pairs into SMALL, EQUAL, and LARGE based on their slopes
  let SMALL = pairs.filter(pair => pair.k > medianSlope);
  let EQUAL = pairs.filter(pair => pair.k === medianSlope);
  let LARGE = pairs.filter(pair => pair.k < medianSlope);

  // Find a supporting line of S with slope medianSlope
  let intercept = Math.max(...S.map(point => point.y - medianSlope * point.x));
  let MAX = S.filter(point => Math.abs(point.y - medianSlope * point.x - intercept) < 0.03);
  let pk = MAX.reduce((minPoint, point) => point.x < minPoint.x ? point : minPoint, MAX[0]);
  let pm = MAX.reduce((maxPoint, point) => point.x > maxPoint.x ? point : maxPoint, MAX[0]);

  // Determine if h contains the bridge
  if (pk.x < L && pm.x >= L) {
    console.log("lbridge out",  [pk, pm]);
    return [pk, pm];
  }

  // h contains only points of S to the right of L
  if (pm.x < L) {
    LARGE.concat(EQUAL).forEach(pair => candidates.push(pair[1]));
    SMALL.forEach(pair => {
      candidates.push(pair[0]);
      candidates.push(pair[1]);
    });
  }

  // h contains only points of S to the left of or on L
  if (pm.x >= L) {
      SMALL.concat(EQUAL).forEach(pair => candidates.push(pair[0]));
      LARGE.forEach(pair => {
          candidates.push(pair[0]);
          candidates.push(pair[1]);
      });
  }
  const ans = lower_bridge(candidates, L);
  console.log("lbridge out", ans);
  return ans;
}

// Add a point to the SVG
function addPointToSvg(event) {
  const x = event.clientX,
    y = event.clientY;
  const off = svg_container.getBoundingClientRect();
  var offx = off.left;
  var offy = off.top;
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", x - offx);
  dot.setAttribute("cy", y - offy);
  dot.setAttribute("r", 5);
  dot.setAttribute("class", "dot");
  svg.appendChild(dot);
  points.push({ x: x - offx, y: y - offy });
  console.log("x-cor" + x + "y-cor" + y);
}

// Function to enable or disable the SVG click listener
function toggleSvgClickListener(enable) {
  if (enable) {
    svgClickListener = function (event) {
      addPointToSvg(event);
    };
    svg.addEventListener("click", svgClickListener);
  } else {
    svg.removeEventListener("click", svgClickListener);
  }
}

if (clickKara === 0) {
  toggleSvgClickListener(true);
}
var done = 0;
document.getElementById("next-button").addEventListener("click", function () {
  clickKara = 1;
  // Disable further inputs
  toggleSvgClickListener(false);

  if (points.length < 3) {
    alert("Please add at least three points by clicking on the SVG.");
    return;
  }

  if (convexHull.length === 0) {
    // Sort the points by x and then y coordinate
    points.sort(function (a, b) {
      return a.x - b.x || b.y - a.y;
    });
    convexHull.push(points[0]);
  }
  
  if (currentStep === "drawLines") {
    console.log(points);
    if(!done){
      const ans = kps(points);
      for(const point of ans){
        console.log(point.x, point.y);
      }
      done = 1;
    }
    const leftmost = convexHull[convexHull.length - 1];
    for (let i = 0; i < points.length; i++) {
      if (points[i] === leftmost) continue;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", leftmost.x);
      line.setAttribute("y1", leftmost.y);
      line.setAttribute("x2", points[i].x);
      line.setAttribute("y2", points[i].y);
      line.setAttribute("stroke", "teal");
      line.setAttribute("stroke-dasharray", "10,10");
      line.setAttribute("class", "line"); // Add class for animation
      svg.appendChild(line);
    }
    currentStep = "addLines";
  } else if (currentStep === "addLines") {
    // Remove previously drawn dashed lines
    const dashedLines = svg.querySelectorAll("line[stroke-dasharray]");
    dashedLines.forEach((line) => line.remove());

    const leftmost = convexHull[convexHull.length - 1];
    let nextPoint = points[0];
    for (let i = 1; i < points.length; i++) {
      if (points[i] === leftmost) continue;
      let direction = crossProduct(leftmost, nextPoint, points[i]);
      if (
        nextPoint === leftmost ||
        direction > 0 ||
        (direction === 0 &&
          distance(leftmost, points[i]) > distance(leftmost, nextPoint))
      ) {
        nextPoint = points[i];
      }
    }
    convexHull.push(nextPoint);
    // Add the action to history
    actionHistory.push({ action: "next", point: nextPoint });
    // Draw the convex hull
    if (convexHull.length >= 2) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", convexHull[convexHull.length - 2].x);
      line.setAttribute("y1", convexHull[convexHull.length - 2].y);
      line.setAttribute("x2", convexHull[convexHull.length - 1].x);
      line.setAttribute("y2", convexHull[convexHull.length - 1].y);
      line.setAttribute("stroke", "red");
      line.setAttribute("stroke-width", "2.5");
      line.setAttribute("class", "line"); // Add class for animation
      svg.appendChild(line);
    }
    console.log("x:" + convexHull[convexHull.length - 2].x + ":y:" + convexHull[convexHull.length - 2].y);
    currentStep = "drawLines";
  }
});

document.getElementById("prev-button").addEventListener("click", function () {
  if (actionHistory.length === 0) {
    alert("No previous actions to undo.");
    return;
  }
  const lastAction = actionHistory.pop();
  if (lastAction.action === "next") {
    svg.removeChild(svg.lastChild);
    convexHull.pop();
  }
});

function crossProduct(p1, p2, p3) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}

function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
