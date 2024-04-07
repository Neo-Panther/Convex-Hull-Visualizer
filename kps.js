/** @module Kirkpatrick-Seidel */

/** 
 * This array stores the input points for the kps algorithm
 *
 * Point object
 *
 * x: number  // x-coordinate on svg 
 *
 * y: number  // y-coordinate on svg 
 *
 * @type {Array}
 * @memberof Kirkpatrick-Seidel
 */
const points = [];
/**
 * This array stores the lines that make up the convex hull.
 * @type {Array}
 * @memberof Kirkpatrick-Seidel
 */
let convexHull = [];
/**
 * This variable stores the SVG container element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const svg_container = document.getElementsByClassName("svg-container")[0];
/**
 * This variable stores the SVG element.
 * @type {SVGElement}
 * @memberof Kirkpatrick-Seidel
 */
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
/**
 * This variable stores the Next Button element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const nxtbtn = document.getElementById("next-button");
/**
 * This variable stores the Previous Button element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const prevbtn = document.getElementById("prev-button");
/**
 * This variable stores the Add Random Button element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const arandom = document.getElementById("add-random-button");
/**
 * This variable stores the Skip Steps Button element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const skipbtn = document.getElementById("skip-steps");
/**
 * This variable stores the Skip to End Button element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const skipendbtn = document.getElementById("skip-end");
/**
 * This variable stores the Add File Points Button element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const afilebtn = document.getElementById("get-file");
/**
 * This variable stores the Add File input element.
 * @type {HTMLElement}
 * @memberof Kirkpatrick-Seidel
 */
const afile = document.getElementById("points-file");
svg_container.appendChild(svg);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
/**
 * Action[]
 * Action object
 *
 * adot : {x: number, y: number, c: class}[]  // add these dots
 *
 * rdot : {x: number, y: number}[]  // remove these dots
 *
 * aline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  
 *
 * rline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // remove these lines
 *
 * cdot : {x: number, y: number, c: class, pc: class}[]  // change dot class
 *
 * instr: "instruction to show"
 *
 * class => string
 *
 * @type {Array}
 * @memberof Kirkpatrick-Seidel
 */
const ACTIONS = [];
var clickKara = 0;
const textc = document.getElementById('text-container-left');


/**
 * Parses a JSON file asynchronously.
 * @param {File} file - The JSON file to parse.
 * @returns {Promise<any>} A promise that resolves with the parsed JSON data.
 * @memberof Kirkpatrick-Seidel
 */
async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => resolve(JSON.parse(event.target.result));
    fileReader.onerror = error => reject(error);
    fileReader.readAsText(file);
  });
}

// Get Points from file
/**
 * Attaches a click event listener to a button element that triggers a click event on a file input element.
 * 
 * @param {HTMLElement} buttonElement - The button element to which the click event listener will be attached.
 * @param {HTMLElement} fileInputElement - The file input element that will be clicked when the button is clicked.
 * @memberof Kirkpatrick-Seidel
 */
afilebtn.addEventListener("click", function() {
  afile.click();
});
/**
 * Attaches a change event listener to a file input element, which triggers when files are selected.
 * It reads the selected JSON files, parses them, and adds them to an SVG.
 * 
 * @param {Event} event - The change event triggered by selecting files in the file input element.
 * @memberof Kirkpatrick-Seidel
 */
afile.addEventListener('change', function (event) {
  const files = event.target.files;
  for(const file of files){
    parseJsonFile(file).then(function(fpoints) {
      const npoints = [];
      for(const point of fpoints){
        npoints.push({x: Number(point.x), y: Number(point.y)});
      }
      for(const point of npoints){
        points.push(point);
        addPointToSvg(point.x, point.y);
      }
      if(points.length >= 3){
        nxtbtn.disabled = false;
        skipbtn.disabled = false;
        skipendbtn.disabled = false;
      }
    });
  }
});
/**
 * Attaches a click event listener to the clear button element.
 * When clicked, it reloads the current page, effectively clearing the points.
 * @memberof Kirkpatrick-Seidel
 */
document.getElementById("clear-button").addEventListener("click", function () {
  location.reload(); // Reload the page
});
// Random points function
/**
 * Attaches a click event listener to the "Random" button element.
 * When clicked, it generates random points within the SVG container and adds them to the SVG.
 * It also enables certain navigation buttons.
 * @memberof Kirkpatrick-Seidel
 */
arandom.addEventListener("click", function () {
  skipbtn.disabled = false;
  skipendbtn.disabled = false;
  nxtbtn.disabled = false;
  const svgWidth = svg.width.animVal.value - 100;
  const svgHeight = svg.height.animVal.value - 100;
  const svgX = 50;
  const svgY = 50;

  for (let i = 0; i < 50; i++) {
    const x = Math.floor(Math.random() * svgWidth) + svgX; // Random x within SVG container
    const y = Math.floor(Math.random() * svgHeight) + svgY; // Random y within SVG container
    addPointToSvg(x, y); // Call the existing function to add a point to the SVG
    points.push({ x: x, y: y });
  }
});
// Skip steps for faster completion
/**
 * Attaches a click event listener to the "Skip" button element.
 * When clicked, it triggers a click event on the "Next" button element five times.
 * @memberof Kirkpatrick-Seidel
 */
skipbtn.addEventListener("click", function(){
  for(var i = 0; i < 5; i++)
    nxtbtn.click();
});

//skip to completed hull
/**
 * Attaches a click event listener to the "Skip to End" button element.
 * When clicked, it disables the "Next", "Skip", and "Skip to End" buttons,
 * enables the "Previous" button, clears the ACTIONS array, invokes the kps function with the points array,
 * iterates through the convexHull array, adding lines to the SVG based on the hull points,
 * and sets the clickKara variable to the length of the ACTIONS array.
 * @memberof Kirkpatrick-Seidel
 */
skipendbtn.addEventListener('click', function(){
  console.time("Time for complete run");
  svg.classList.add("running");
  nxtbtn.disabled = true;
  skipbtn.disabled = true;
  skipendbtn.disabled = true;
  afilebtn.disabled = true;
  arandom.disabled = true;
  prevbtn.disabled = false;
  ACTIONS.length = 0;
  convexHull.length = 0;
  const a = kps(points);
  console.log("kps points");
  console.log(...a)
  const lines = document.getElementsByTagName("line");
  const dots = document.getElementsByTagName("circle");
  for(const dot of dots)
  removeDotFromSvg(dot);
for(const line of lines)
removeLineFromSvg(line);
for(const point of points)
addPointToSvg(point.x, point.y);
for(const hull of convexHull){
  addLineToSvg(hull.x1, (hull.y1 >= 0)? hull.y1: -hull.y1, hull.x2, (hull.y2 >= 0)? hull.y2: -hull.y2, "hull");
}
  clickKara = ACTIONS.length;
  textc.innerHTML = ""+String(points.length)+" total points, "+String(a.length-1)+" hull points. Check console for the running time.";
  console.timeEnd("Time for complete run");
});
/**
 * Calculates the inverted slope of a line passing through two points.
 * @param {Object} point1 - The first point with x and y coordinates.
 * @param {Object} point2 - The second point with x and y coordinates.
 * @returns {number} - The slope of the line passing through the two points.
 * @memberof Kirkpatrick-Seidel
 */
function getSlope(point1, point2) {
  return (point1.y - point2.y) / (point2.x - point1.x);
}
/**
 * Finds the convex hull of a set of points using the Kirkpatrick-Seidel algorithm.
 * This algorithm identifies the extreme points, and then constructs the upper and lower hulls.
 * @param {Object[]} points - An array of points with x and y coordinates.
 * @returns {Object[]} - An array of points representing the convex hull.
 * @memberof Kirkpatrick-Seidel
 */
function kps(points) {
  var pmin = points[0];
  var pmax = points[0];
  for(const point of points){
    if(point.x < pmin.x)
      pmin = point;
    else if(point.x > pmax.x)
      pmax = point;
  }
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
  ans.push(pumax, plmax);
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
  ans.push(plmin, pumin);
  ACTIONS.push({
    adot: points.filter((point) => {
      for (const p of ans) {
        if (p.x === point.x && p.y === point.y) {
          return 0;
        }
      }
      return 1;
    }),
    aline : [{
      x1: pumax
    },],
    instr: "We return all original points after finding the lower hull"
  });
  if(pumin.y !== plmin.y || pumax.y !== plmax.y){
    ACTIONS.push({
      aline: [{
        x1: pumax.x,
        y1: pumax.y,
        x2: plmax.x,
        y2: plmax.y,
        c: "hull"
      },
      {
        x1: plmin.x,
        y1: plmin.y,
        x2: pumin.x,
        y2: pumin.y,
        c: "hull"
      }],
      instr: "We connect the upper and lower hulls"
    });
    convexHull.push({
      x1: pumax.x,
      y1: pumax.y,
      x2: plmax.x,
      y2: plmax.y,
      c: "hull"
    },
    {
      x1: plmin.x,
      y1: plmin.y,
      x2: pumin.x,
      y2: pumin.y,
      c: "hull"
    });
  }
  return [
    ...new Map(ans.map((point) => [`${point.x}:${point.y}`, point])).values(),
  ];
}
/**
 * Computes the upper hull of a set of points given a dividing line.
 * 
 * This function calculates the upper hull of a set of points T with respect to a dividing line 
 * defined by pmin and pmax. It recursively divides the points into left and right halves, and 
 * computes the upper hull for each half.
 * 
 * @param {Object} pmin - The leftmost point of the hull.
 * @param {Object} pmax - The rightmost point of the hull.
 * @param {Object[]} T - The set of points to compute the upper hull from.
 * @returns {Object[]} - An array of points representing the upper hull.
 * @memberof Kirkpatrick-Seidel
 */
function upper_hull(pmin, pmax, T) {
  if (pmin.x === pmax.x && pmin.y === pmax.y) {
    return [];
  }
  // KPS does not sort here, we do so to make the task of finding the median simpler. We can use the median of medians method to find the median in O(n) time
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
/**
 * Computes the upper bridge of a set of points with respect to a given dividing line.
 * 
 * This function calculates the upper bridge of a set of points S with respect to a given dividing 
 * line defined by L. It recursively divides the points into smaller subsets and determines the upper
 * bridge based on certain conditions.
 * 
 * @param {Object[]} S - The set of points to compute the upper bridge from.
 * @param {number} L - The x-coordinate of the dividing line.
 * @returns {Object[]} - An array containing two points representing the upper bridge.
 * @memberof Kirkpatrick-Seidel
 */
function upper_bridge(S, L) {
  // KPS does not sort here, we do so to make the task of finding the median simpler. We can use the median of medians method to find the median in O(n) time
  S.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });
  let candidates = [];

  if (S.length === 2) {
    convexHull.push({
      x1: S[0].x,
      x2: S[1].x,
      y1: S[0].y,
      y2: S[1].y,
      c: "hull",
    });
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
  // KPS does not sort here, we do so to make the task of finding the median simpler. We can use the median of medians method to find the median in O(n) time
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
    convexHull.push({
      x1: pk.x,
      x2: pm.x,
      y1: pk.y,
      y2: pm.y,
      c: "hull",
    });
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
/**
 * Calculates the equation of a supporting line with the given slope and intercept.
 * 
 * This function determines the equation of a supporting line with a specified slope and
 * intercept. The supporting line is used in the upper bridge computation algorithm to
 * partition the points into left and right subsets. The equation is needed to draw the
 * line on the svg
 * 
 * @param {number} medianSlope - The slope of the supporting line.
 * @param {number} intercept - The y-intercept of the supporting line.
 * @param {boolean} islower - Indicates whether the supporting line is lower or upper.
 * @returns {Object} - An object representing the equation of the supporting line.
 * @memberof Kirkpatrick-Seidel
 */
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
/**
 * Adds a point to the SVG container.
 * 
 * This function creates a new SVG circle element representing a point and appends it
 * to the SVG container. It sets the coordinates of the point based on the provided
 * x and y coordinates. Optionally, a class can be provided to customize the appearance
 * of the point.
 * 
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @param {string} [c] - The class attribute for styling the point (optional).
 * @memberof Kirkpatrick-Seidel
 */
function addPointToSvg(x, y, c) {
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", x);
  dot.setAttribute("cy", y);
  if(c) dot.setAttribute("class", c);
  svg.appendChild(dot);
}
/**
 * Adds a line to the SVG container.
 * 
 * This function creates a new SVG line element representing a line segment and appends it
 * to the SVG container. It sets the coordinates of the line segment based on the provided
 * (x1, y1) and (x2, y2) coordinates. Optionally, a class can be provided to customize the appearance
 * of the line segment.
 * 
 * @param {number} x1 - The x-coordinate of the starting point of the line.
 * @param {number} y1 - The y-coordinate of the starting point of the line.
 * @param {number} x2 - The x-coordinate of the ending point of the line.
 * @param {number} y2 - The y-coordinate of the ending point of the line.
 * @param {string} [c] - The class attribute for styling the line (optional).
 * @memberof Kirkpatrick-Seidel
 */
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
}
/**
 * Removes a dot element from the SVG container.
 * 
 * This function removes a dot element from the SVG container by animating its removal.
 * It creates a clone of the dot element, reverses the animation direction, and sets the animation
 * fill mode to "backwards" to make the animation appear as if the dot is shrinking. After a delay,
 * the cloned dot element is removed from the SVG container.
 * 
 * @param {Element} dot - The dot element to be removed from the SVG container.
 * @memberof Kirkpatrick-Seidel
 */
function removeDotFromSvg(dot){
  var newdot = dot.cloneNode(true);
  newdot.style.animationDirection = "reverse";
  newdot.style.animationFillMode = "backwards";
  dot.parentNode.replaceChild(newdot, dot);
  setTimeout(function() {newdot.remove()}, 460);
}
/**
 * Removes a line element from the SVG container.
 * 
 * This function removes a line element from the SVG container by animating its removal.
 * It creates a clone of the line element, reverses the animation direction, and sets the animation
 * fill mode to "backwards" to make the animation appear as if the line is shrinking. After a delay,
 * the cloned line element is removed from the SVG container.
 * 
 * @param {Element} line - The line element to be removed from the SVG container.
 * @memberof Kirkpatrick-Seidel
 */
function removeLineFromSvg(line){
  var newline = line.cloneNode(true);
  newline.style.animationDirection = "reverse";
  newline.style.animationFillMode = "backwards";
  line.parentNode.replaceChild(newline, line);
  setTimeout(function() {newline.remove()}, 360);
}
/**
 * Event listener for clicking on the SVG container to add a point.
 * 
 * @param {MouseEvent} event - The mouse event object.
 * @memberof Kirkpatrick-Seidel
 */
svg.addEventListener("click", function(event) {
  // dont remove this idiot
  if(svg.classList.contains("running")){
    alert("Cannot add point after algorithm starts.");
    return;
  }
  const off = svg_container.getBoundingClientRect();
  points.push({ x: event.clientX - off.left, y: event.clientY - off.top });
  if(points.length >= 3){
    nxtbtn.disabled = false;
    skipbtn.disabled = false;
    skipendbtn.disabled = false;
  }
  addPointToSvg(event.clientX - off.left, event.clientY - off.top, "");
});
/**
 * Event listener for the "Next" button click, which proceeds to the next algorithm step.
 * If it's the first click, it disables further inputs, adds the "running" class to the SVG element,
 * logs the answer obtained from the kps function, and sets up the current action.
 * It increments the click counter and checks if it exceeds the total number of actions.
 * If it does, it disables the "Next" button, the "Skip" button, and the "Skip to End" button,
 * decrements the click counter, and exits the function.
 * Otherwise, it retrieves the current action from the actions array, updates the instruction text,
 * and executes actions based on the action type:
 * - If "adot" exists and is not empty, it adds dots to the SVG element based on the action data.
 * - If "rdot" exists and is not empty, it removes dots from the SVG element based on the action data.
 * - If "aline" exists and is not empty, it adds lines to the SVG element based on the action data.
 * - If "rline" exists and is not empty, it removes lines from the SVG element based on the action data.
 * - If "cdot" exists and is not empty, it changes the class of dots in the SVG element based on the action data.
 * @memberof Kirkpatrick-Seidel
 */
nxtbtn.addEventListener("click", function() {
  if(clickKara === 0) {
    // Disable further inputs
    svg.classList.add("running");
    arandom.disabled = true;
    afilebtn.disabled = true;
    prevbtn.disabled = false;

    console.log("kps answer");
    console.log(...kps(points));
  }
  clickKara += 1;
  if(clickKara > ACTIONS.length){
    nxtbtn.disabled = true;
    skipbtn.disabled = true;
    skipendbtn.disabled = true;
    clickKara -= 1;
    return;
  }
  currentAction = ACTIONS[clickKara-1];
  textc.innerHTML = currentAction.instr;

  if ("adot" in currentAction && currentAction.adot.length != 0){
    for(const dot of currentAction.adot){
      if(dot.y < 0) dot.y *= -1;
    }
    for(const dot of currentAction.adot){
      addPointToSvg(dot.x, dot.y, dot.c);
    }
  } 
  if ("rdot" in currentAction && currentAction.rdot.length != 0) {
    const dots = document.getElementsByTagName("circle");
    for(const dot of currentAction.rdot){
      if(dot.y < 0) dot.y *= -1;
    }
    for(const irdot of currentAction.rdot){
      for(const dot of dots){
        if(Number(dot.getAttribute('cx')) === irdot.x && Number(dot.getAttribute('cy')) === irdot.y){
          removeDotFromSvg(dot);
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
    for(const line of currentAction.aline){
      addLineToSvg(line.x1, line.y1, line.x2, line.y2, line.c);
    }
  } 
  if ("rline" in currentAction && currentAction.rline.length != 0) {
    for(const line of currentAction.rline){
      if(line.c === "support") continue;
      if(line.y1 < 0) line.y1 *= -1;
      if(line.y2 < 0) line.y2 *= -1;
    }
    const lines = document.getElementsByTagName("line");
    for(const irline of currentAction.rline){
      for(const line of lines){
        if(Number(line.getAttribute('x1')) === irline.x1 && Number(line.getAttribute('y1')) === irline.y1 && Number(line.getAttribute('x2')) === irline.x2 && Number(line.getAttribute('y2')) === irline.y2 && line.classList.contains(irline.c)){
          removeLineFromSvg(line);
        }
      }
    }
  }
  if ("cdot" in currentAction && currentAction.cdot.length != 0) {
    for(const dot of currentAction.cdot){
      if(dot.y < 0) dot.y *= -1;
    }
    const dots = document.getElementsByTagName("circle");
    const dots2 = [...dots];
    for(const icdot of currentAction.cdot){
      for(const dot of dots2){
        if(Number(dot.getAttribute('cx')) === icdot.x && Number(dot.getAttribute('cy')) === icdot.y){
          removeDotFromSvg(dot)
          addPointToSvg(icdot.x, icdot.y, icdot.c);
          // dot.setAttribute("class", icdot.c);
        }
      }
    }
  }
});
/**
 * Event listener for the "Previous" button click, which navigates to the previous algorithm step.
 * If the "Next" button is disabled, it enables the "Skip" button, the "Next" button, and the "Skip to End" button.
 * Decrements the click counter and retrieves the current action based on the click counter.
 * If the click counter reaches 0, it disables the "Previous" button, enables further inputs,
 * removes the "running" class from the SVG element, and updates the instruction text.
 * Otherwise, it updates the instruction text with the current action.
 * It then executes actions based on the action type:
 * - If "rdot" exists and is not empty, it adds dots to the SVG element based on the action data.
 * - If "adot" exists and is not empty, it removes dots from the SVG element based on the action data.
 * - If "rline" exists and is not empty, it adds lines to the SVG element based on the action data.
 * - If "aline" exists and is not empty, it removes lines from the SVG element based on the action data.
 * - If "cdot" exists and is not empty, it changes the class of dots in the SVG element based on the action data.
 * If the click counter reaches 0, it clears the actions array.
 * @memberof Kirkpatrick-Seidel
 */
prevbtn.addEventListener("click", function() {
  if(nxtbtn.disabled) {
    skipbtn.disabled = false;
    nxtbtn.disabled = false;
    skipendbtn.disabled = false;
  }
  clickKara-=1;
  const currentAction = ACTIONS[clickKara];
  if(clickKara===0){
    prevbtn.disabled = true;
    arandom.disabled = false;
    afilebtn.disabled = false;
    svg.classList.remove("running");
    textc.innerHTML = "Add points by tapping in the box or from a json file";
  } else {
    textc.innerHTML = currentAction.instr;
  }
  if ("rdot" in currentAction && currentAction.rdot.length != 0){
    for(const dot of currentAction.rdot){
      if(dot.y < 0) dot.y *= -1;
    }
    for(const dot of currentAction.rdot){
      addPointToSvg(dot.x, dot.y, dot.c);
    }
  } 
  if ("adot" in currentAction && currentAction.adot.length != 0) {
    const dots = document.getElementsByTagName("circle");
    for(const dot of currentAction.adot){
      if(dot.y < 0) dot.y *= -1;
    }
    for(const irdot of currentAction.adot){
      for(const dot of dots){
        if(Number(dot.getAttribute('cx')) === irdot.x && Number(dot.getAttribute('cy')) === irdot.y){
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
    for(const line of currentAction.rline){
      addLineToSvg(line.x1, line.y1, line.x2, line.y2, line.c);
    }
  } 
  if ("aline" in currentAction && currentAction.aline.length != 0) {
    for(const line of currentAction.aline){
      if(line.c === "support") continue;
      if(line.y1 < 0) line.y1 *= -1;
      if(line.y2 < 0) line.y2 *= -1;
    }
    const lines = document.getElementsByTagName("line");
    for(const irline of currentAction.aline){
      for(const line of lines){
        if(Number(line.getAttribute('x1')) === irline.x1 && Number(line.getAttribute('y1')) === irline.y1 && Number(line.getAttribute('x2')) === irline.x2 && Number(line.getAttribute('y2')) === irline.y2 && line.classList.contains(irline.c)){
          line.remove();
        }
      }
    }
  }
  if ("cdot" in currentAction && currentAction.cdot.length != 0) {
    for(const dot of currentAction.cdot){
      if(dot.y < 0) dot.y *= -1;
    }
    const dots = document.getElementsByTagName("circle");
    for(const icdot of currentAction.cdot){
      for(const dot of dots){
        if(Number(dot.getAttribute('cx')) === icdot.x && Number(dot.getAttribute('cy')) === icdot.y){
          dot.setAttribute("class", icdot.pc);
        }
      }
    }
  }
  if(clickKara===0){
    ACTIONS.length = 0;
    convexHull.length = 0;
  }
});
