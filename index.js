// first attempt at javascript code!


let myChart = document.getElementById('myChart').getContext('2d');

let massPopChart = new Chart(myChart, {
	type:'bar', // could be: bar, horizontal bar, pie, line, scatter etc
	data:{
		labels:['Boston', 'Worcester', 'Springfield', 'Lowel', 'Cambridge', 'New Bedford'],
		datasets:[{
			label:'Population',
			data:[
				617594,
				181045,
				153060,
				106519,
				105162,
				95072
			]
		}]
	},
	options:{}
});