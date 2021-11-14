

// function getData() {
// 	return Math.random();
// }

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}



// Plotly.plot('chart',[{
// 	y:[getData()],
// 	type:'line'
// }]);

// setInterval(function(){
// 	Plotly.extendTraces('chart',{ y:[[getData()]]}, [0]);
// },200);


let xArray = [];
let yArray = [];
let zArray = [];





// Define Data
var data = [{
  x: xArray,
  y: yArray,
  z: zArray,
  mode:"markers",
  type:"scatter3d"
}];

// Define Layout
var layout = {
  xaxis: {range: [0, 7], title: "Square Meters"},
  yaxis: {range: [0, 5], title: "Price in Millions"},
  title: "House Prices vs. Size"
};

Plotly.newPlot("chart", data, layout);

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


		Plotly.redraw('chart');

		await delay(1000)

	}
}


// This function simulates the ejected decay particle
// returning its vector it polar-angle coordinates.
function ejectParticle() {
	let phiDecay = Math.acos((2*Math.random()) - 1.0);
    let thetaDecay = 2*3.14159 * Math.random();

    return[thetaDecay, phiDecay];
}

function convertSphericalToCartesian(r, theta, phi) {
	let x = r*Math.sin(phi)*Math.cos(theta);
	let y = r*Math.sin(phi)*Math.sin(theta);
	let z = r*Math.cos(phi);

	return [x, y, z];
}







