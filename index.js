var x0 = [];
var y0 = [];
var x1 = [];
var y1 = [];
var x2 = [];
var y2 = [];

let detectorInitiated = false;
let vectorAnglePolar = [];
let vectorAngleCartesian = [];

var detX = [];
var detY = [];
var detZ = [];


var trace1 = {
  x: x0,
  y: y0,
  mode: 'line',
  type: 'scatter',
};

var trace3 = {
  x: x2,
  y: y2,
  type: 'histogram2d',
  colorscale : [['0' , 'rgb(0,225,100)'],['1', 'rgb(100,0,200)']],

  xbins: {
    start: -20,
    end: 20,
    size: 2
  },

  ybins: {
    start: -20,
    end: 20,
    size: 2
  }


};



var layout = {

  xaxis: {range: [-20, 20]},

  yaxis: {range: [-20, 20]}

};


var data = [trace1, trace3];

Plotly.newPlot('chartRight', data, layout);





// Defines the vertices of the requested polygon for the
// detector face based on the shape, and the x-y-z offset
// from the radioactive source
function defineDetector(nPoly, size, xOffset, yOffset, zOffset) {

  let verticesX = [];
  let verticesY = [];
  let verticesZ = [];
  // Angle between vertices of detector face
  vertAngle = ( 2*Math.PI ) / nPoly;

  // Allocating point 0 manually before for loop
  tempPointX = 0;
  tempPointY = -1.0 * size;

  verticesX[0] = tempPointX*Math.cos(vertAngle/2.) - tempPointY*Math.sin(vertAngle/2.);
  verticesY[0] = tempPointY*Math.cos(vertAngle/2.) + tempPointX*Math.sin(vertAngle/2.);

  // Looping through the rest of the polygon to define the rest
  // of the vertices
  for( let point = 1; point < nPoly; point++) {
    verticesX.push(verticesX[point-1]*Math.cos(vertAngle) - verticesY[point-1]*Math.sin(vertAngle));
    verticesY.push(verticesY[point-1]*Math.cos(vertAngle) + verticesX[point-1]*Math.sin(vertAngle));
  }

  // console.log("debug:  " + verticesX[0] + "  " + verticesY[0]);
  // console.log("debug:  " + verticesX[1] + "  " + verticesY[1]);
  // console.log("debug:  " + verticesX[2] + "  " + verticesY[2]);
  // console.log("debug:  " + verticesX[3] + "  " + verticesY[3]);


  // Looping through the rest of the polygon to define the rest
  // of the vertices
  for( let point = 0; point < nPoly; point++) {
    verticesX[point] = verticesX[point] + xOffset;
    verticesY[point] = verticesY[point] + yOffset;
    verticesZ.push(zOffset);
  }

  return [verticesX, verticesY, verticesZ];

}






// This function simulates the ejected decay particle
// returning its vector it polar-angle coordinates.
function ejectParticle() {
  let phiDecay = Math.acos((2*Math.random()) - 1.0);
  let thetaDecay = 2*3.14159 * Math.random();

  return[thetaDecay, phiDecay];
}

// Covert spherical polar coodrdinates to cartesian
function convertSphericalToCartesian(r, theta, phi) {
  let x = r*Math.sin(phi)*Math.cos(theta);
  let y = r*Math.sin(phi)*Math.sin(theta);
  let z = r*Math.cos(phi);

  return [x, y, z];
}








async function initializeDetector() {

  [detX, detY, detZ] = defineDetector(4, 10, 0, 0, 40);


  for(let vertex = 0; vertex<detX.length; vertex++) {

    x0[vertex] = detX[vertex];
    y0[vertex] = detY[vertex];
  }

  x0.push(detX[0]);
  y0.push(detY[0]);




  Plotly.redraw('chartRight');


  detectorInitiated = true;

}
















async function runSimulation() {


  // for(let a=0; a<100; a++) {
  //   x2.push(Math.random()*2);
  //   y2.push(Math.random()*3);
  // }

  let deltaY = 0;
  let deltaX = 0;
  let grad = 0;
  let intercept = 0;
  let Xintersection = 0;
  let lineCrossCount = 0;
  let detHit = false;

  // only run if the detector has been initiated!
  if(detectorInitiated == true) {

    // Next need to simulate the particles (in groups of 100? 1000?)
    for (let i = 0; i < 1000; i++) {
      detHit = false;

      // Simulating particle emission
      vectorAnglePolar = ejectParticle();
      vectorAngleCartesian = convertSphericalToCartesian(1.0, vectorAnglePolar[0], vectorAnglePolar[1]);

      //    Then need to calculate its position of the particleon the x-y plane of the detector
      xPlane = vectorAngleCartesian[0] * (detZ[0] / vectorAngleCartesian[2]);
      yPlane = vectorAngleCartesian[1] * (detZ[0] / vectorAngleCartesian[2]);


      // Code that determines if the particle hit the detector or not

      //looping over the vertices (except the last one)
      // and joining them into lines.
      for(let lineIndex = 0; lineIndex <x0.length - 1; lineIndex++ ) {

        // Calculating the parameters of the line
        deltaX = x0[lineIndex + 1] - x0[lineIndex];
        deltaY = y0[lineIndex + 1] - y0[lineIndex];
        grad = deltaY / deltaX;
        intercept = y0[lineIndex] - (grad * x0[lineIndex]);

        // Where does this line and a horizontal line at the point of interest intersect?
        Xintersection = (intercept - yPlane) / (-grad);

        // Need to make sure that it crosses the line between the two vertices as well!!!
        if( Xintersection >= xPlane ) 
        {
          lineCrossCount++;
        }

      }

      if(lineCrossCount % 2 == 0) {
        detHit = false;
      }
      else{
        detHit = true;
      }


      //   Then determine if it HIT the detector or not
      if(detHit == true) {
        x2.push(xPlane);
        y2.push(yPlane);
        // console.log("debug:  " + xPlane + "  " + yPlane);
      }

    }

  }




  Plotly.redraw('chartRight');


}