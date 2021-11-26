var x0 = [];
var y0 = [];
var x1 = [];
var y1 = [];
var x2 = [];
var y2 = [];

let detectorInitiated = false;
let vectorAnglePolar = [];
let vectorAngleCartesian = [];

var iteration = [];
var calculatedSA = [];

var detX = [];
var detY = [];
var detZ = [];

var xStart = [-10];
var xEnd = [10];
var yStart = [-10];
var yEnd = [10];

var trace1 = {
  x: x0,
  y: y0,
  mode: 'line',
  type: 'scatter',
};


var traceSolidAngle = {
  x: iteration,
  y: calculatedSA,
  mode: 'line',
  type: 'scatter',
};


var SAdata = [traceSolidAngle];
Plotly.newPlot('chartBottom', SAdata);

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


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

  [detX, detY, detZ] = defineDetector(4, 50, 0, 80, 100);

  let maxX = detX[0];
  let maxY = detY[0];
  let minX = detX[0];
  let minY = detY[0];


  for(let vertex = 0; vertex<detX.length; vertex++) {

    x0[vertex] = detX[vertex];
    y0[vertex] = detY[vertex];

    if(x0[vertex] > maxX) maxX = x0[vertex];
    if(y0[vertex] > maxY) maxY = y0[vertex];
    if(x0[vertex] < minX) minX = x0[vertex];
    if(x0[vertex] < minY) minY = y0[vertex];

  }

  x0.push(detX[0]);
  y0.push(detY[0]);

  xStart[0] = minX - 3;
  xEnd[0] = maxX + 3;

  yStart[0] = minY - 3;
  yEnd[0] = maxY + 3;





  var trace3 = {
    x: x2,
    y: y2,
    type: 'histogram2d',
    // colorscale : [['0' , 'rgb(0,225,100)'],['1', 'rgb(100,0,200)']],

    xbins: {
      start: xStart[0],
      end: xEnd[0],
      size: (xEnd[0] - xStart[0]) / 50
    },

    ybins: {
      start: yStart[0],
      end: yEnd[0],
      size: (yEnd[0] - yStart[0]) / 50
    }
  };

  var data = [trace1, trace3];
  Plotly.newPlot('chartRight', data);



  detectorInitiated = true;

}
















async function runSimulation() {


  // for(let a=0; a<100; a++) {
  //   x2.push(Math.random()*2);
  //   y2.push(Math.random()*3);
  // }

  let detHitCount = 0;
  let detMissCount = 0;
  let solidAngle = [];

  let aParam = 0;
  let bParam = 0;
  let cParam = 0;

  let Xintersection = 0;
  let Yintersection = 0;
  let lineCrossCount = 0;
  let detHit = false;
  let linesCrossBool = false;
  let intersectsOnLine = false;

  let subIterationN = 10000;

  // only run if the detector has been initiated!
  if(detectorInitiated == true) {


    for (let j = 1; j <= 50; j++) {


      // Next need to simulate the particles (in groups of 100? 1000?)
      for (let i = 0; i < subIterationN; i++) {
        detHit = false;
        lineCrossCount = 0;
        Xintersection = 0;
        Yintersection = 0;
        linesCrossBool = false;
        intersectsOnLine = false;







        // Simulating particle emission
        vectorAnglePolar = ejectParticle();
        vectorAngleCartesian = convertSphericalToCartesian(1.0, vectorAnglePolar[0], vectorAnglePolar[1]);

        //    Then need to calculate its position of the particleon the x-y plane of the detector
        xPlane = vectorAngleCartesian[0] * (detZ[0] / vectorAngleCartesian[2]);
        yPlane = vectorAngleCartesian[1] * (detZ[0] / vectorAngleCartesian[2]);

        // console.log("DEBUG0: " + xPlane + "  " + yPlane);

        // Code that determines if the particle hit the detector or not

        //looping over the vertices (except the last one)
        // and joining them into lines.
        // Then solving the "point-in-polygon" problem to varify if the 
        // particle hit the detector
        for(let lineIndex = 0; lineIndex <x0.length - 1; lineIndex++ ) {

          linesCrossBool = false;

          // Calculating the parameters of the line
          aParam = y0[lineIndex] - y0[lineIndex+1];
          bParam = x0[lineIndex+1] - x0[lineIndex];
          cParam = ((x0[lineIndex] - x0[lineIndex+1])*y0[lineIndex]) + ( (y0[lineIndex+1] - y0[lineIndex])*x0[lineIndex] );



          // Checking if the lines are paralell
          // If they are, then they don't cross
          // If they are not, continue to calculate xIntersection of two lines
          if(aParam == 0) {
            linesCrossBool == false;
          }
          else {
            Xintersection = ((-bParam*yPlane) - cParam) / aParam;
            Yintersection = yPlane;

            // console.log("DEBUG: " + Xintersection + "  " + Yintersection)



            // Is the intersection on the line itself, or an extension?
            if( (Yintersection>=y0[lineIndex] && Yintersection<=y0[lineIndex+1]) || ( (Yintersection<=y0[lineIndex] && Yintersection>=y0[lineIndex+1]) ) ) {
              intersectsOnLine = true;
            }
            else {
              intersectsOnLine = false;
            }

            // Combining conditions to see if the lines intersect 
            if(Xintersection >= xPlane && intersectsOnLine == true ) {
              linesCrossBool = true;
            }
            else {
              linesCrossBool = false;
            }


          }



          // console.log("DEBUG1: " + x0[lineIndex] + "  " + y0[lineIndex]);
          // console.log("DEBUG2: " + x0[lineIndex+1] + "  " + y0[lineIndex+1]);
          // console.log("DEBUG3: " + xPlane + "  " + yPlane);
          // console.log("DEBUG4: " + Xintersection);

          // Need to make sure that it crosses the line between the two vertices as well!!!
          if( linesCrossBool == true ) {
            // console.log("crossed line!");
            lineCrossCount++;
          }

          // console.log("DEBUG1: " + lineCrossCount)

        }

        // console.log("DEBUG2: " + lineCrossCount)

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
          detHitCount++;
        }
        else {
          detMissCount++;
        }

      }


      iteration.push(j*subIterationN);
      calculatedSA.push( (detHitCount / (detMissCount + detHitCount))*0.5*4*Math.PI );



      Plotly.redraw('chartBottom');
      Plotly.redraw('chartRight');
      await delay(400);

      // Calculate solid angle from fraction of detected to undetected hits
      console.log(detHitCount / (detMissCount + detHitCount) );

    }


    










  }




  


}