
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}



// Plotly.plot('chart3',[{
// 	y:[getData()],
// 	type:'line'
// }]);

// setInterval(function(){
// 	Plotly.extendTraces('chart3',{ y:[[getData()]]}, [0]);
// },200);


let xArray = [];
let yArray = [];
let zArray = [];



// Plot of distribution of decayed particles in 3D space to check isotropy.
// Define Data
var data1 = [{
  x: xArray,
  y: yArray,
  z: zArray,
  mode:"markers",
  type:"scatter3d"
}];

// Define Layout
var layout1 = {
  xaxis: {range: [0, 1]},
  yaxis: {range: [0, 1]},
  zaxis: {range: [0, 1]},
};

Plotly.newPlot("chartLeft", data1, layout1);



// Testing defineDetector:
let exampleX = [];
let exampleY = [];
let exampleZ = [];


var data2 = [{
  x: exampleX,
  y: exampleY,
  mode:"line",
  type:"scatter"
}];

// Define Layout
var layout2 = {
  xaxis: {range: [0, 1]},
  yaxis: {range: [0, 1]},
  zaxis: {range: [0, 1]},
};



Plotly.newPlot("chartRight", data2);








let vectorAnglePolar = [];
let vectorAngleCartesian = [];

async function refreshPlot() {
	for (let j = 0; j < 3; j++) {
		for (let i = 0; i < 100; i++) {
		  vectorAnglePolar = ejectParticle();

		  vectorAngleCartesian = convertSphericalToCartesian(1.0, vectorAnglePolar[0], vectorAnglePolar[1]);

		  xArray.push(vectorAngleCartesian[0]);
		  yArray.push(vectorAngleCartesian[1]);
		  zArray.push(vectorAngleCartesian[2]);

		}

		Plotly.redraw('chartLeft');

		await delay(50);

	}

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

	console.log("debug:  " + verticesX[0] + "  " + verticesY[0]);
	console.log("debug:  " + verticesX[1] + "  " + verticesY[1]);
	console.log("debug:  " + verticesX[2] + "  " + verticesY[2]);
	console.log("debug:  " + verticesX[3] + "  " + verticesY[3]);


	// Looping through the rest of the polygon to define the rest
	// of the vertices
	for( let point = 0; point < nPoly; point++) {
		verticesX[point] = verticesX[point] + xOffset;
		verticesY[point] = verticesY[point] + yOffset;
		verticesZ.push(zOffset);
	}

	return [verticesX, verticesY, verticesZ];

}







function drawDetector() {
	// Need to allow for user-input for detector size, shape and location

	[tempX, tempY, tempZ] = defineDetector(4, 10, 0, 0, 40);

	// Setting the arrays properly (it doesn't work unless I "push" the array...)
	for( let vertexNumber=0; vertexNumber<tempX.length; vertexNumber++) {
		exampleX.push(tempX[vertexNumber]);
		exampleY.push(tempY[vertexNumber]);
		exampleZ.push(tempZ[vertexNumber]);
	}

	// Pushing the first entry again so that the line chart closes the loop
	// of the detector face, making it look more like an actual detector!
	exampleX.push(tempX[0]);
	exampleY.push(tempY[0]);
	exampleZ.push(tempZ[0]);



	Plotly.redraw('chartRight');

}


function runSimulation() {

	drawDetector();


	// Next need to simulate the particles (in groups of 100? 1000?)
	// for (let i = 0; i < 100; i++) {
	//   vectorAnglePolar = ejectParticle();

	// 	 Then need to calculate its position on the x-y plane of the detector

	//   Then determine if it HIT the detector or not

	//   Save (push) the values:
	//     - x and y in detector plane
	//     - hitDetector boolean (true/flase)
	//     - separate vector of x-y coordinates for only detector hits

	// }

	// Then calculate solid angle based on hitDetector true:false ratio

	// Update 3D scatter plot
	// Update 2D histogram of detector hit pattern
	// Update solid angle vs iteration number line chart



}



// PLAN:

// 0) Define the detector face shape and position
//		To begin with , have this predefined as a simple square or something, but 
//		in the future have it user-inputed.

// 1) Place new async function here.
// 		in it, have a for loop that executes for however many iterations
//		for each iterations, create particle, identify where it crosses the detector pane (x-y)
//		and classify it as a hit or miss. 

// 2) After X number of iterations, calculate the solid angle and plot:
//		- solid angle vs iteration number
//		- heat-map (histogram) of counts on detector face
//		- 3D map of (subset of) events that hit the detector



