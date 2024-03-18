const points = [];
var width = window.innerWidth * (3 / 4) - 15,
  height = window.innerHeight - 15;
console.log(width + "::" + height);

const svg_container = document.getElementsByClassName("svg-container")[0];
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg_container.appendChild(svg);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
svg.onclick = function (event) {
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
};
// console.log(svg.width + "::" + svg.height + "::" + svg.onclick);

let clickCount = 0;
let j = 0;
let t = 0;

document.getElementById("next-button").addEventListener("click", function () {
  clickCount++;
  console.log("The next button has been clicked " + clickCount + " times");
  if (points.length < 2) {
    alert("Please add at least two points by clicking on the SVG.");
    return;
  }

  // Sort the points by x and then y coordinate
  points.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });

  const lines = svg.getElementsByTagName("line");

  if (clickCount % 2 !== 0) {
    for (let i = j; i < points.length; i++) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", points[j].x);
      line.setAttribute("y1", points[j].y);
      line.setAttribute("x2", points[i].x);
      line.setAttribute("y2", points[i].y);
      line.setAttribute("stroke", "red");
      line.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(line);
    }
    j = j + 1;
  } else {
    const lines = Array.from(svg.getElementsByTagName("line"));
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].getAttribute("stroke-dasharray")) {
        lines[i].parentNode.removeChild(lines[i]);
      }
    }

    let k = 0;
    let temp = Number.MAX_SAFE_INTEGER;
    for (k = j; k < points.length; k++) {
      if ((points[j-1].y - points[k].y) / (points[k].x - points[j-1].x) <= temp) {
        temp = (points[j-1].y - points[k].y) / (points[k].x - points[j-1].x);
        t = k;
      }
    }

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", points[j - 1].x);
    line.setAttribute("y1", points[j - 1].y);
    line.setAttribute("x2", points[j].x);
    line.setAttribute("y2", points[j].y);
    line.setAttribute("stroke", "blue");
    svg.appendChild(line);
  }
});

/*
var svga = d3.select(".svg-container").append("svg")
.on("click", function() {
  if (fxn_i == 0) {
    vertices.push(d3.mouse(this));
    redrawVerticies();

    // check if at least 5 edges in upper hull
    var [xs, ys] = unzip(vertices);
    var x_min = [width, 0],
      x_max = [0, 0];
    for (var i = 0; i < vertices.length; i++) {
      if (vertices[i][0] < x_min[0]) x_min = vertices[i];
      if (vertices[i][0] > x_max[0]) x_max = vertices[i];
    }

    // make test if point is above or below divider
    var sl = (x_max[1] - x_min[1]) / (x_max[0] - x_min[0]);
    var inLowerHull = function(d) {
      return d[1] <= (d[0] - x_min[0]) * sl + x_min[1]
    }

    var upperHullCount = svg.selectAll('.vertex').filter(function(d) { return inLowerHull(d); }).size();
    if (upperHullCount >= 6) $('.next-button').removeClass('disabled');
    else $('.next-button').addClass('disabled');
  }
});
*/
