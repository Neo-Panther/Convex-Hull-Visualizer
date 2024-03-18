const points = []
var width  = window.innerWidth * (3 / 4) - 15,
  height = window.innerHeight - 15;
console.log(width + "::" + height);

const svg_container = document.getElementsByClassName("svg-container")[0];
const svg = document.createElement("svg");
svg_container.appendChild(svg);
svg.width = "97%";
svg.height = "97%";
svg.onclick= function(event){
  console.log("ClientX: " + event.clientX + "::ClientY: " + event.clientY);
};
console.log(svg.width + "::" + svg.height + "::" + svg.onclick);

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
