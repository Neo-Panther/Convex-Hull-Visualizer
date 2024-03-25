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
 * Action object
 * adot : {x: number, y: number, c: class}[]  // add these dots
 * rdot : {x: number, y: number, c: class}[]  // remove these dots
 * aline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // add these lines
 * rline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // remove these lines
 * cdot : {x: number, y: number, c: class}[]  // change dot class
 * cline: {x1: number, y1: number, x2: number, y2: number, c: class}[]  // change line class
 * default class: solid black
*/
let clickKara = 0;
let svgClickListener = null; // Variable to store the click listener


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
      line.setAttribute("class", "dashed-line"); // Add class for animation
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
      line.setAttribute("stroke", "white");
      line.setAttribute("stroke-width", "2.5");
      line.setAttribute("class", "solid-line"); // Add class for animation
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
