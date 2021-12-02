



function testResults (form) {
    var TestVar = form.inputbox.value;
    alert ("You typed: " + TestVar);
}










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
var SA_hist = [];
var errorSA = [];
let iterationCount = 0;

var detX = [];
var detY = [];
var detZ = [];

var xStart = [-10];
var xEnd = [10];
var yStart = [-10];
var yEnd = [10];

var config = {responsive: true}


var trace1 = {
  x: x0,
  y: y0,
  mode: 'line',
  type: 'scatter',
  marker: {
            color: 'rgb( 33, 97, 140 )'
  }
};


var traceSolidAngle = {
  x: iteration,
  y: calculatedSA,
  error_y: {
    type: 'data',
    array: errorSA,
    visible: true,
    color: 'rgb( 33, 97, 140 )'
    
  },
  xaxis: 'x1',
  yaxis: 'y1',
  mode: 'line',
  type: 'scatter',
  marker: {
            color: 'rgb( 33, 97, 140 )'
  },

};

var histSolidAngle = {
  x: SA_hist,
  type: 'histogram',
  // orientation: 'h'
  marker:{
    color:  'rgb( 33, 97, 140 )'
  }
};

var layoutBottomLeft = {
  margin: {
      l: 80,
      r: 10,
      t: 20,
      b: 40
    },
    autosize: true,
    height: 250,

    xaxis: {
      title: 'Iterations'
    },
    yaxis: {
      title: 'Solid Angle [sr]'
    }
}

var layoutBottomRight = {
  margin: {
      l: 40,
      r: 40,
      t: 20,
      b: 20
    },
    autosize: true
}


var SAdata = [traceSolidAngle];
Plotly.newPlot('chartBottomLeft', SAdata, layoutBottomLeft);

// var SAhist = [histSolidAngle];
// Plotly.newPlot('chartBottomRight', SAhist, layoutBottomRight, config);

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








async function initializeDetector(form) {

  // emptying the arrays that represent the vertices of the 
  // detector
  x0.length = 0;
  y0.length = 0;

  //Setting the iteration count for the monte carlo simulation
  // it only resets when the detector configuration is changed.
  iterationCount = 0;
  

  var detPolygonN = parseInt(form.nPolygonInput.value);
  var detSize = parseFloat(form.detSizeInput.value);
  let detOffsetX = parseFloat(form.detXInput.value);
  let detOffsetY = parseFloat(form.detYInput.value);
  let detOffsetZ = parseFloat(form.detZInput.value);

  [detX, detY, detZ] = defineDetector(detPolygonN, detSize, detOffsetX, detOffsetY, detOffsetZ);

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
    if(y0[vertex] < minY) minY = y0[vertex];

  }

  x0[detX.length] = detX[0];
  y0[detX.length] = detY[0];

  xStart[0] = minX - 3;
  xEnd[0] = maxX + 3;

  yStart[0] = minY - 3;
  yEnd[0] = maxY + 3;





  var trace3 = {
    x: x2,
    y: y2,
    type: 'histogram2d',
    colorscale : [['0' , 'rgb( 254, 254, 254 )'],['1', 'rgb( 33, 97, 140 )']],

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

  var layoutRight = {
  margin: {
      l: 45,
      r: 5,
      t: 25,
      b: 45,
      autoexpand: true
    },

    title: {
      text:'Plot Title'
    },

    xaxis: {
      showgrid: false,
      showline: false,
      title: 'X'
    },
    yaxis: {
      showgrid: false,
      showline: false,
      title: 'Y'
    },

    autosize: true


}

  var data = [trace1, trace3];
  Plotly.newPlot('chartRight', data, layoutRight, config);



  detectorInitiated = true;

}











// Counters for when the particles hit/miss the detector
let detHitCount = 0;
let detMissCount = 0;

let solidAngleResult = 0;
let solidAngleResultError = 0;


async function runSimulation(form) {

  var nLoops = parseInt(form.loopNumber.value);
  var subIterationN = parseInt(form.subIterationNInput.value);
  


  // for(let a=0; a<100; a++) {
  //   x2.push(Math.random()*2);
  //   y2.push(Math.random()*3);
  // }

  
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

  // let subIterationN = 10000;

  // only run if the detector has been initiated!
  if(detectorInitiated == true) {


    for (let j = 1; j <= nLoops; j++) {


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

      iterationCount = iterationCount + subIterationN;

      solidAngleResult = (detHitCount / (detMissCount + detHitCount))*0.5*4*Math.PI;
      solidAngleResultError =  solidAngleResult * Math.sqrt( Math.pow( Math.sqrt(detHitCount)/detHitCount , 2 )  +  Math.pow( Math.sqrt(detHitCount+detMissCount)/(detHitCount+detMissCount) , 2 ) );

      iteration.push(iterationCount);
      calculatedSA.push( solidAngleResult );
      SA_hist.push( solidAngleResult );
      errorSA.push(solidAngleResultError);

      document.getElementById("outputSA").innerHTML = solidAngleResult.toFixed(4);
      document.getElementById("outputSAError").innerHTML = solidAngleResultError.toFixed(5);

      // Plotly.redraw('chartBottomRight');
      Plotly.redraw('chartBottomLeft');
      Plotly.redraw('chartRight');
      await delay(400);

      // Calculate solid angle from fraction of detected to undetected hits
      console.log(detHitCount / (detMissCount + detHitCount) );

    }


    










  }




  


}