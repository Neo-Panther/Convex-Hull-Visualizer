## Convex Hull Visualizer

### Opening the Vizualizer
After extracting all the files to the same directory, just open [Convex Hull Visualizer](./Home.html) and enjoy. Alternatively, you can open the `Home.html` file in any web browser. Absolutely no external libraries needed.

### Opening the Documentation
After extracting all the files to the same directory, just open [Documentation](./index.html). Alternatively, you can open `index.html` file in any web browser.

### Adding points from file
The file should be in json format, containing an array of point objects with numerical attributes x and y.  `{'x': <Number>, 'y': <Number>}[]`

x and y should be between 100 and 600, with distance of at least 10 between two point centers. (The algorithm will still run if the conditions are not met, but the visualization may be difficult to interpret)

### Tools Used
The visualization tools have been written in vanilla js, plain html and css, without the use of other tools. The documentation was made using the `jsdoc` tool.