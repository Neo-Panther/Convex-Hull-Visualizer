/** @module Jarvis-March */

/**
 * This array stores the points for the convex hull algorithm.
 * @type {Array}
 * @memberof Jarvis-March
 */
const points = [];
/**
 * This array stores the points that make up the convex hull.
 * @type {Array}
 * @memberof Jarvis-March
 */
let convexHull = [];
/**
 * This array stores the history of actions for the convex hull algorithm.
 * @type {Array}
 * @memberof Jarvis-March
 */
let actionHistory = [];
/**
 * This variable tracks the current step of the convex hull algorithm.
 * @type {string}
 * @memberof Jarvis-March
 */
let currentStep = "drawLines";
/**
 * This variable stores the SVG container element.
 * @type {HTMLElement}
 * @memberof Jarvis-March
 */
const svg_container = document.getElementsByClassName("svg-container")[0];
/**
 * This variable stores the SVG element.
 * @type {SVGElement}
 * @memberof Jarvis-March
 */
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg_container.appendChild(svg);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
/**
 * This array stores the actions for the convex hull algorithm.
 * @type {Array}
 * @memberof Jarvis-March
 */
const ACTIONS = [];
/**
 * This variable stores the number of clicks.
 * @type {number}
 * @memberof Jarvis-March
 */
let clickKara = 0;
/**
 * This variable stores the SVG click listener.
 * @type {EventListener}
 * @memberof Jarvis-March
 */
let svgClickListener = null;
const arandom = document.getElementById("add-random-button");
const nxtbtn = document.getElementById("next-button");
const prevbtn = document.getElementById("prev-button");
const skipendbtn = document.getElementById("skip-end");
const afilebtn = document.getElementById("get-file");
const afile = document.getElementById("points-file");

/**
 * This is an asynchronous function that parses a JSON file.
 *
 * It uses the FileReader API to read the content of the file and then parses it into a JavaScript object.
 *
 * The function returns a Promise that resolves with the parsed object if the reading and parsing are successful.
 *
 * If there is an error during the reading process, the Promise is rejected with the error.
 *
 * @param {File} file - The file to be parsed. This should be a File object representing a JSON file.
 *
 * The File object represents a file in a file system and provides methods to access the file's content.
 *
 * @return {Promise<Object>} A Promise that resolves to the parsed JavaScript object if the reading and parsing are successful.
 *
 * If there is an error during the reading process, the Promise is rejected with the error.
 * @memberof Jarvis-March
 */
async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = event => resolve(JSON.parse(event.target.result))
    fileReader.onerror = error => reject(error)
    fileReader.readAsText(file)
  })
}

/**
 * This event listener is triggered when the 'afilebtn' button is clicked.
 *
 * It programmatically triggers a click event on the hidden file input element 'afile'.
 *
 * This allows the user to select a file from their system's file picker dialog.
 * @memberof Jarvis-March
 */
afilebtn.addEventListener("click", function() {
  afile.click();
});
/**
 * This event listener is triggered when a file is selected via the 'afile' input element.
 *
 * It reads the selected files and parses each one as JSON using the 'parseJsonFile' function.
 *
 * The parsed points are then converted to a new format and added to the SVG.
 *
 * @param {Event} event - The change event object. This object contains information about the event, including the selected files.
 * @memberof Jarvis-March
 */
afile.addEventListener('change', function (event) {
  const files = event.target.files;
  for(const file of files){
    /**
     * The 'parseJsonFile' function is called with the current file.
 *
     * It returns a Promise that resolves with the parsed points from the file.
 *
     * The points are then converted to a new format and added to the SVG.
     *
     * @param {File} file - The current file being processed. This should be a JSON file containing an array of points.
     * @memberof Jarvis-March
 */
    parseJsonFile(file).then(function(fpoints) {
      const npoints = [];
      for(const point of fpoints){
        npoints.push({x: Number(point.x), y: Number(point.y)});
      }
      for(const point of npoints){
        addPointToSvg({ clientX: point.x + 150, clientY: point.y + 150});
      }
      if(points.length >= 3){
        nxtbtn.disabled = false;
        skipendbtn.disabled = false;
      }
    });
  }
});
/**
 * This event listener is triggered when the 'skipendbtn' button is clicked.
 *
 * It disables the 'afilebtn' button and programmatically triggers click events on the 'nxtbtn' button until it is disabled.
 *
 * This effectively skips to the end of a certain process (e.g., a step-by-step visualization).
 * @memberof Jarvis-March
 */
skipendbtn.addEventListener('click', function(){
  console.time("Total Time Taken");
  afilebtn.disabled = true;
  arandom.disabled = true;
  while(!nxtbtn.disabled){
    nxtbtn.click();
  }
  console.timeEnd("Total Time Taken");
});
/**
 * This event listener is triggered when the 'clear-button' button is clicked.
 *
 * It reloads the page, effectively resetting the state of the application.
 *
 * This can be used to clear the current data or visualization and start over.
 * @memberof Jarvis-March
 */
document.getElementById("clear-button").addEventListener("click", function () {
  location.reload(); // Reload the page
});
/**
 * This event listener is triggered when the 'arandom' button is clicked.
 *
 * It generates a set of random points within the SVG container and adds them to the SVG.
 *
 * The 'nxtbtn' and 'skipendbtn' buttons are enabled, allowing the user to proceed with the next steps of the application.
 *
 * The SVG container's dimensions and position are used to ensure that the points are generated within its bounds.
 * @memberof Jarvis-March
 */
arandom.addEventListener("click", function () {
    const svgContainer = document.querySelector(".svg-container");
    const svgRect = svgContainer.getBoundingClientRect();
    const svgWidth = svgRect.width - 100;
    const svgHeight = svgRect.height - 100;
    const svgX = svgRect.left + 50;
    const svgY = svgRect.top + 50;
    nxtbtn.disabled = false;
    skipendbtn.disabled = false;
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * svgWidth) + svgX; // Random x within SVG container
      const y = Math.floor(Math.random() * svgHeight) + svgY; // Random y within SVG container
      addPointToSvg({ clientX: x, clientY: y }); // Call the existing function to add a point to the SVG
    }
  });

/**
 * Function to add a point to the SVG.
 * @param {Event} event - The event object containing the clientX and clientY properties.
 * @memberof Jarvis-March
 */
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

/**
 * Function to enable or disable the SVG click listener.
 * @param {boolean} enable - If true, adds the click listener. If false, removes the click listener.
 * @memberof Jarvis-March
 */
function toggleSvgClickListener(enable) {
  if (enable) {
    svgClickListener = function (event) {
      addPointToSvg(event);
      if(points.length >= 3){
        nxtbtn.disabled = false;
        skipendbtn.disabled = false;
      }
    };
    svg.addEventListener("click", svgClickListener);
  } else {
    svg.removeEventListener("click", svgClickListener);
  }
}
// If 'clickKara' is 0, the SVG click listener is enabled.
if (clickKara === 0) {
  toggleSvgClickListener(true);
}
/**
 * This event listener is triggered when the 'nxtbtn' button is clicked.
 * It sets 'clickKara' to 1, disables the 'prevbtn', 'afilebtn', and 'arandom' buttons, and disables the SVG click listener.
 * This prevents the user from adding more points or changing the set of points while the convex hull is being computed.
 * If the 'convexHull' array is empty, it sorts the 'points' array by x-coordinate and then by y-coordinate, and adds the first point to the 'convexHull' array.
 * This prepares the points for the computation of the convex hull.
 * @memberof Jarvis-March
 */
nxtbtn.addEventListener("click", function () {
  clickKara = 1;
  // Disable further inputs
  prevbtn.disabled = false;
  afilebtn.disabled = true;
  toggleSvgClickListener(false);
  arandom.disabled = true;
  if (convexHull.length === 0) {
    // Sort the points by x and then y coordinate
    points.sort(function (a, b) {
      return a.x - b.x || b.y - a.y;
    });
    convexHull.push(points[0]);
  }
/**
 * This block of code is responsible for drawing lines between points in a convex hull.
 * It first logs the points to the console, then identifies the leftmost point in the convex hull.
 * It then creates a line between the leftmost point and each other point, skipping the last point.
 * These lines are added to an SVG element as dashed lines.
 * Finally, it updates the current step to "addLines" and disables the "prev-button".
 *
 * @param {Array} points - An array of points to be connected.
 * @param {Array} convexHull - An array of points that form the convex hull.
 * @param {string} currentStep - The current step in the process.
 * @returns {void}
 * @memberof Jarvis-March
 * @ignore
 */
  if (currentStep === "drawLines") {
    const leftmost = convexHull[convexHull.length - 1];
    let lastPoint;
    if (convexHull.length >= 2) lastPoint = convexHull[convexHull.length - 2];
    else lastPoint = convexHull[convexHull.length - 1];
    for (let i = 0; i < points.length; i++) {
      if (points[i] === leftmost || points[i] === lastPoint) continue;
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
    document.getElementById("prev-button").disabled = true; // Disable previous button
    /**
 * This block of code is responsible for adding lines to the convex hull.
 * It first removes any previously drawn dashed lines, then identifies the leftmost point in the convex hull.
 * It then identifies the next point in the hull, which is either the first point in the points array,
 * or a point that forms a left turn or is further away when a tie occurs.
 * This next point is then added to the convex hull.
 *
 * @param {Array} points - An array of points to be connected.
 * @param {Array} convexHull - An array of points that form the convex hull.
 * @param {string} currentStep - The current step in the process.
 * @returns {void}
 * @memberof Jarvis-March
 * @ignore
 */
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
      if(convexHull[0].x === convexHull[convexHull.length - 1].x && convexHull[0].y === convexHull[convexHull.length - 1].y){
        nxtbtn.disabled = true;
        skipendbtn.disabled = true;
      }
    }
    console.log(
      "x:" +
        convexHull[convexHull.length - 2].x +
        ":y:" +
        convexHull[convexHull.length - 2].y
    );
    currentStep = "drawLines";
    document.getElementById("prev-button").disabled = false; // Re-enable previous button
  }
});
/**
 * Event listener for the "Previous" button click, which goes back to the previous algorithm step.
 * If the action history contains only one action, it enables the file input button, random point generation button,
 * and the SVG click listener to add points. It also clears the convex hull array.
 * When clicking the "Previous" button, it pops the last action from the history. If the last action was a "Next" action,
 * it removes the last added SVG element and pops the last point from the convex hull. If the "Next" button was disabled
 * due to reaching the end of actions, it enables both the "Next" button and the "Skip to End" button.
 * @memberof Jarvis-March
 */
prevbtn.addEventListener("click", function () {
  if(actionHistory.length === 1){
    prevbtn.disabled = true;
    afilebtn.disabled = false;
    toggleSvgClickListener(true);
    convexHull.length = 0;
    arandom.disabled = false;
  } 
  const lastAction = actionHistory.pop();
  if (lastAction.action === "next") {
    svg.removeChild(svg.lastChild);
    convexHull.pop();
  }
  if(nxtbtn.disabled){
    nxtbtn.disabled = false;
    skipendbtn.disabled = false;
  }
});
/**
* This function calculates the cross product of three points.
* It is used to determine the direction of the turn formed by the three points.
*
* @param {Object} p1 - The first point.
* @param {Object} p2 - The second point.
* @param {Object} p3 - The third point.
* @returns {number} The cross product of the three points.
 * @memberof Jarvis-March
 */
function crossProduct(p1, p2, p3) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}
/**
 * This function calculates the Euclidean distance between two points.
 *
 * @param {Object} p1 - The first point.
 * @param {Object} p2 - The second point.
 * @returns {number} The distance between the two points.
 * @memberof Jarvis-March
 */
function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}