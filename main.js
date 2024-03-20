const points = [];
const points_backup = [];
var width = window.innerWidth * (3 / 4) - 15,
  height = window.innerHeight - 15;
console.log(width + "::" + height);

function getSlope(point1, point2){
  return (point2.y-point1.y)/(point1.x-point2.x)
}

function randomlyPairPoints(points) {
  var p_copy = points;
  var pairs  = [];
  while (p_copy.length >= 2) {
    var ix_1 = Math.floor(Math.random() * p_copy.length);
    var p_1  = p_copy.splice(ix_1, 1);
    var ix_2 = Math.floor(Math.random() * p_copy.length);
    var p_2  = p_copy.splice(ix_2, 1);
    pairs.push([p_1[0], p_2[0]]);
  }
  return pairs;
}


const svg_container = document.getElementsByClassName("svg-container")[0];
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const next_button = document.getElementById("next-button");
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
  points_backup.push({ x: x - offx, y: y - offy });
  console.log("x-cor" + x + "y-cor" + y);
  if (points.length > 2){
    next_button.classList.remove("disabled");
  }
};

let clickCount = 0;
let j = 0;
let t = 0;
const upperHull = [];
const lowerHull = [];

next_button.addEventListener("click", function () {
  if(next_button.classList.contains("disabled")){
    return;
  }
  clickCount++;
  console.log("The next button has been clicked " + clickCount + " times");
  // start of KPS
  if(clickCount == 1){
    // Sort the points by x and then y coordinate
    points.sort(function (a, b) {
      return a.x - b.x || b.y - a.y;
    });
    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    // line separating upper and lower hull
    line.setAttribute("x1", points[0].x);
    line.setAttribute("y1", points[0].y);
    line.setAttribute("x2", points[points.length-1].x);
    line.setAttribute("y2", points[points.length-1].y);
    line.setAttribute("stroke", "black");
    line.classList.add("divider");
    svg.appendChild(line);
  }
  else if(clickCount==2){
    // separate upper and lower hull points, hide lower hull points
    var slope = getSlope(points[0], points[points.length-1]);
    for(var i = 0; i < points.length; i++){
      var dots = document.getElementsByClassName("dot");
      console.log(points[0].y+":"+slope*(points[0].x - Number(dots[i].getAttribute("cx"))) + ":" + Number(dots[i].getAttribute("cy")));
      if (getSlope(points[0], {x:Number(dots[i].getAttribute("cx")), y: Number(dots[i].getAttribute("cy"))}) < slope){
        dots[i].classList.add("hidden");
        console.log("hide");
        lowerHull.push({ x : Number(dots[i].getAttribute("cx")), y: Number(dots[i].getAttribute("cy"))});
      } else {
        upperHull.push({x:Number(dots[i].getAttribute("cx")), y: Number(dots[i].getAttribute("cy"))});
        console.log("pushed:"+ upperHull);
      }
    }
  }
  else if(clickCount==3){
    // draw median line and separate points into left and right
    // Sort the points by x and then y coordinate
    upperHull.sort(function (a, b) {
      return a.x - b.x || b.y - a.y;
    });
    var median = 0;
    console.log(upperHull);
    if(upperHull.length%2){
      median = upperHull[Math.floor(upperHull.length/2)].x;
    } else {
      median = (upperHull[Math.floor(upperHull.length/2)].x + upperHull[Math.floor(upperHull.length/2) - 1].x)/2;
    }
    const off = svg_container.getBoundingClientRect();
    const h = svg_container.offsetHeight;
    var offx = off.left;
    var offy = off.top;
    
    const line = document.getElementsByClassName("divider")[0];
    line.classList.remove("divider");
    line.classList.add("median");
    line.setAttribute("x1", median);
    line.setAttribute("y1", 0);
    line.setAttribute("x2", median);
    line.setAttribute("y2", h);

    var dots = document.getElementsByClassName("dot");
    for(var i = 0; i < dots.length; i++){
      if(Number(dots[i].getAttribute("cx")) < median){
        if(!dots[i].classList.contains("hidden")) dots[i].classList.add("left");
      } else {
        if(!dots[i].classList.contains("hidden")) dots[i].classList.add("right");
      }
    }
  }
  else if(clickCount==4){
    // upper bridge random pairing
    // remove median line
    const line = document.getElementsByClassName("median")[0];
    line.remove();
    const pairs = randomlyPairPoints(upperHull);
    for (var i = 0; i < pairs.length; i++){
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", pairs[i][0].x);
      line.setAttribute("y1", pairs[i][0].y);
      line.setAttribute("x2", pairs[i][1].x);
      line.setAttribute("y2", pairs[i][1].y);
      line.classList.add("randomline");
      svg.appendChild(line);
    }
  } else if(clickCount==5){
    // get median slope
    
  }
  
});

// document.getElementById("next-button").addEventListener("click", function () {
//   clickCount++;
//   console.log("The next button has been clicked " + clickCount + " times");
//   if (points.length < 2) {
//     alert("Please add at least two points by clicking on the SVG.");
//     return;
//   }

//   // Sort the points by x and then y coordinate
//   points.sort(function (a, b) {
//     return a.x - b.x || b.y - a.y;
//   });

//   const lines = svg.getElementsByTagName("line");

//   if (clickCount % 2 !== 0) {
//     for (let i = j; i < points.length; i++) {
//       const line = document.createElementNS(
//         "http://www.w3.org/2000/svg",
//         "line"
//       );
//       line.setAttribute("x1", points[j].x);
//       line.setAttribute("y1", points[j].y);
//       line.setAttribute("x2", points[i].x);
//       line.setAttribute("y2", points[i].y);
//       line.setAttribute("stroke", "red");
//       line.setAttribute("stroke-dasharray", "5,5");
//       svg.appendChild(line);
//     }
//     j = j + 1;
//   } else {
//     const lines = Array.from(svg.getElementsByTagName("line"));
//     for (let i = 0; i < lines.length; i++) {
//       if (lines[i].getAttribute("stroke-dasharray")) {
//         lines[i].parentNode.removeChild(lines[i]);
//       }
//     }

//     let k = 0;
//     let temp = Number.MAX_SAFE_INTEGER;
//     for (k = j; k < points.length; k++) {
//       if (
//         (points[j - 1].y - points[k].y) / (points[k].x - points[j - 1].x) <=
//         temp
//       ) {
//         temp =
//           (points[j - 1].y - points[k].y) / (points[k].x - points[j - 1].x);
//         t = k;
//       }
//     }

//     const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
//     line.setAttribute("x1", points[j - 1].x);
//     line.setAttribute("y1", points[j - 1].y);
//     line.setAttribute("x2", points[t].x);
//     line.setAttribute("y2", points[t].y);
//     line.setAttribute("stroke", "blue");
//     svg.appendChild(line);
//     j = t%points.length;
//   }
// });
