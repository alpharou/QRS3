function setup() {
	
	createCanvas(windowWidth, windowHeight);

	data = [];
	maxDataValue = 1000;
	dataPoints = 500;

	for (let i = 0; i < dataPoints; i++) {

		data.push(ceil(random(0, maxDataValue)));

	}

	//console.log(data);
	
	//QRS Setup
	index = [];
	
	qrs = new QRS(data, index, 60, true);

}


function draw() {
	
	background(0);

	//DRAW DATA
	fill(255);
	strokeWeight(1);
	stroke(255);
	
	let ordered = true;
	let maxOrderedValue = 0;
	
	for (let i = 0; i < data.length; i++) {
		
		fill(255);
		stroke(255);
		
		if (qrs.stateF() == "ON(PIV)" || qrs.stateF() == "ON(INS)" || qrs.stateF() == "SET") {
			
			if (qrs.data[i] < maxOrderedValue) {ordered = false;}
			if (ordered) {
				
				maxOrderedValue = qrs.data[i];
				fill(170, 255, 170);stroke(170, 255, 170);
				
			}
			
			for (let j = 0; j < qrs.index.length; j++) {
			
				if (qrs.index[j][0] == i) {
					
					ordered = true;
					maxOrderedValue = 0;
					fill(100, 170, 200);stroke(100, 170, 200);
					
				}
				
			}
			
			if (qrs.pivotSort.stateF() == "SET") {
			
				if (i == qrs.pivotSort.iniIndex) {fill(0, 0, 255); stroke(0, 0, 255);}
				if (i == qrs.pivotSort.eIndex) {fill(0,255,255);stroke(0,255,255);}
				if (i == qrs.pivotSort.pIndex) {fill(255, 0, 255);stroke(255, 0, 255);}
				if (i == qrs.pivotSort.endIndex) {fill(255, 0, 0);stroke(255, 0, 0);}
		
			}
		
			if (qrs.pivotSort.stateF() == "ON") {
				
				if (i == qrs.pivotSort.iniIndex) {fill(0, 0, 255);stroke(0, 0, 255);}
				if (i == qrs.pivotSort.eIndex) {fill(0,255,255);stroke(0,255,255);}
				if (i == qrs.pivotSort.pIndex) {fill(255, 0, 255);stroke(255, 0, 255);}
				if (i == qrs.pivotSort.endIndex) {fill(255, 0, 0);stroke(255, 0, 0);}
			
			}
			
			if (qrs.insertSort.stateF() == "SET") {
				
				if (i == qrs.insertSort.iniIndex) {fill(0, 0, 255);stroke(0, 0, 255);}
				if (i == qrs.insertSort.pIndex) {fill(255, 0, 255);stroke(255, 0, 255);}
				if (i == qrs.insertSort.endIndex) {fill(255, 0, 0);stroke(255, 0, 0);}
				
			}
			
			if (qrs.insertSort.stateF() == "ON") {
				
				if (i == qrs.insertSort.iniIndex) {fill(0, 0, 255);stroke(0, 0, 255);}
				if (i == qrs.insertSort.pIndex) {fill(255, 0, 255);stroke(255, 0, 255);}
				if (i == qrs.insertSort.endIndex) {fill(255, 0, 0);stroke(255, 0, 0);}
			
			}
		
		}
		
		if (qrs.stateF() == "DONE") {
			
			fill(170, 255, 170);stroke(170, 255, 170);
			
			for (let j = 0; j < qrs.index.length; j++) {
			
				if (qrs.index[j][0] == i) {fill(100, 170, 200);stroke(100, 170, 200);}
				
			}

		}

		let w = (windowWidth / data.length);
		let h = map(data[i], 0, maxDataValue, 0, windowHeight);
		let x = w * i;
		let y = windowHeight - h;
		rect(x, y, w, h);

	}
	
	console.log(qrs.sort());

}

function windowResized() {

	resizeCanvas(windowWidth, windowHeight);

}

function mousePressed() {

	console.log(qrs.sort());
	
}
