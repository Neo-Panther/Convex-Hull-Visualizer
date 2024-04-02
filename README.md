### Opening the Vizualizer
After extracting all the files to the same directory, just open [Convex Hull Visualizer](./Home.html) and enjoy. Alternatively, you can open the `Home.html` file in any web browser. Absolutely no external libraries needed.

### Opening the Documentation
After extracting all the files to the same directory, just open [Documentation](./index.html). Alternatively, you can open `index.html` file in any web browser.

### Code and Algorithm Analysis
The analysis of the algorithms and their code implementations are present in the `About` tab of the visualizer.

### Adding points from file
The file should be in json format, containing an array of point objects with numerical attributes x and y.  `{'x': <Number>, 'y': <Number>}[]`

x and y should be between 100 and 600, with distance of at least 10 between two point centers. (The algorithm will still run if the conditions are not met, but the visualization may be difficult to interpret)

### Tools Used
The visualization apps have been written in vanilla js, plain html and css, without the use of other tools. The documentation was made using the `documentation.js` tool (which uses the `jsdoc` comment syntax and `documentation.yml` configuration file). The documentation and visualization pages have been pre-built and will run on most modern browsers. Refer `package.json` for the versions of the tools used. 

Build command for `documentation.js`

> $ documentation build kps.js jarvis.js -f html --github -o . --config documentation.yml

NOTE: In the generated ouput the sha code of github links was corrected to main, and incorrect line numbers in links were removed.