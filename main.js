const points = [];
var width = window.innerWidth * (3 / 4) - 15,
  height = window.innerHeight - 15;
console.log(width + "::" + height);

function getSlope(point1, point2){
  return (point1.y-point2.y)/(point1.x-point2.x)
}

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
  if (points.length > 2){
    document.getElementById("next-button").classList.remove("disabled");
  }
};
// console.log(svg.width + "::" + svg.height + "::" + svg.onclick);

let clickCount = 0;
let j = 0;
let t = 0;

document.getElementById("next-button").addEventListener("click", function () {
  if(document.getElementById("next-button").classList.contains("disabled")){
    return;
  }
  clickCount++;
  console.log("The next button has been clicked " + clickCount + " times");

  // Sort the points by x and then y coordinate
  points.sort(function (a, b) {
    return a.x - b.x || b.y - a.y;
  });

  const line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  line.setAttribute("x1", points[0].x);
  line.setAttribute("y1", points[0].y);
  line.setAttribute("x2", points[points.length-1].x);
  line.setAttribute("y2", points[points.length-1].y);
  line.setAttribute("stroke", "black");
  line.setAttribute("stroke-solid", "5,5");
  svg.appendChild(line);
  var slope = getSlope(points[0], points[points.length-1]);
  if(clickCount>=2){
    for(i = 1; i < points.length; i++){
      var dots = document.getElementsByClassName("dot");
      console.log(points[i].x + ":" + slope + ":"+ (points[i].y-slope*(points[i].x - points[0].x) - points[0].y));
      if (points[0].y-slope*(points[0].x - points[i].x) < points[i].y){
        dots[i].classList.add("hidden");
        console.log("hide");
      }
    }
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
