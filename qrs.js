//This version of QRS is designed with visualization in mind and has to
// keep track of its state between individual frames, so its performance
//is severely capped to one operation per frame and no multithreading.

//TODO add a prune and verify function

class QRS {
	
	constructor(data, index, res, insertAllowed) {
	
		this.data = data; //Pass the reference, not a copy
		this.index = index;
		this.index = [];
		this.insertAllowed = insertAllowed;
		this.res = res; //Threshold to use pivotSort
		if (res < 3) {this.res = 3;} //Dont allow sorting below 3. RES 3 is by definition sorted.
		this.pivotSort = new PivotSort(this.data);
		this.insertSort = new InsertSort(this.data);
		this.state = "OFF";
		this.workZone = 0; //The index of the zone in this.index (not this.data)
	
	}
	
	sort() {
		
		//OFF -> SET
		if (this.stateF() == "OFF") {this.setup(); return this.stateF("SET");}

		//SET -> ON(PIV)/ON(INS)
		if (this.stateF() == "SET") {
			
			let maxRes = 0;
			this.workZone = 0;
			
			for (let i = 0; i < this.index.length; i++) {
			
				if (this.index[i][1] > maxRes && this.index[i][2] == false) {
					
					maxRes = this.index[i][1];
					this.workZone = i;
					
				}
			
			}
			
			if (this.insertAllowed && maxRes <= this.res && maxRes > 1) {
				
				return this.stateF("ON(INS)");
				
			}
			
			if (maxRes > this.res) {return this.stateF("ON(PIV)");}
			
			return this.stateF("DONE");
			
		}
		
		//ON -> DONE/STEP
		let leftIndex = this.index[this.workZone][0];
		let rightIndex = leftIndex + this.index[this.workZone][1] - 1;
		
		if (this.stateF() == "ON(PIV)") {
			
			if (this.pivotSort.stateF() == "DONE") {
				
				this.splitZone(this.pivotSort.pIndex);
				this.pivotSort.stateF("OFF");
				return this.stateF("SET");
				
			}
			
			return "STEP(PIV): " + this.pivotSort.sort(leftIndex, rightIndex);
			
		}
		
		if (this.stateF() == "ON(INS)") {
			
			if (this.insertSort.stateF() == "DONE") {
				
				this.index[this.workZone][2] = true;
				//this.pruneIndex()
				//this.verifyZones()
				this.insertSort.stateF("OFF");
				return this.stateF("SET");
				
			}
			
			return "STEP(INS): " + this.insertSort.sort(leftIndex, rightIndex);
			
		}
		
		//DONE -> REPEAT/OFF
		if (this.stateF() == "DONE") {
			
			if (this.insertAllowed == false) {return this.stateF("DONE");}
			
			for (let i = 0; i < this.index.length; i++) {
			
				if (this.index[i][2] == false) {
					
					return this.stateF("SET");
					
				}
			
			}
			
			return this.stateF("DONE");

		}
		
	}
	
	rebuildIndex() {
		
		//MAYBE Add a function that tries to create a zone index from a raw dataSet
		
	}
	
	pruneIndex() {
		
		//TODO make zones sorted if neccesary and join adyacent sorted zones
		
	}
	
	stateF(state = "NONE") {
	
		if (state == "OFF") {this.state = "OFF"; return "OFF";}
		if (state == "SET") {this.state = "SET"; return "SET";}
		if (state == "ON(PIV)") {this.state = "ON(PIV)"; return "ON(PIV)";}
		if (state == "ON(INS)") {this.state = "ON(INS)"; return "ON(INS)";}
		if (state == "DONE") {this.state = "DONE"; return "DONE";}
		
		return this.state;
	
	}
	
	swap(a, b) {
	
		let temp = this.data[a];
		this.data[a] = this.data[b];
		this.data[b] = temp;
		
		return true;
	
	}
	
	maxVal(leftI, rightI) {
		
		let bestMatchIndex = leftI;
		
		for(let i = leftI; i <= rightI; i++) {
			
			if (this.data[i] > this.data[bestMatchIndex]) {bestMatchIndex = i;}
			
		}
		
		return bestMatchIndex;
		
	}
	
	minVal(leftI, rightI) {
	
		let bestMatchIndex = rightI;
		
		for(let i = rightI; i >= leftI; i--) {
		
			if (this.data[i] < this.data[bestMatchIndex]) {bestMatchIndex = i;}
		
		}
	
		return bestMatchIndex;
	
	}
	
	setup() {
	
		this.swap(this.minVal(0, this.data.length - 1), 0);
		this.swap(this.maxVal(0, this.data.length - 1), this.data.length - 1);
		this.index = [];
		this.index.push([0, this.data.length, false]);
		this.index.push([this.data.length - 1, 1, true]);
		return this.stateF("SET");
	
	}
	
	splitZone(pivotIndex) {
		
		if (typeof pivotIndex != "number") {return "QRS splitZone() ERROR: pivotIndex is not a number";}
		if (this.index.length < 1) {return "QRS splitZone() ERROR: Index array faulty";}
		if (pivotIndex > this.data.length - 1 || pivotIndex < 0) {return "QRS splitZone() ERROR: pivotIndex outOfBounds";}
		for (let i = 0; i < this.index.length; i++) {
			
			if (pivotIndex == this.index[i][0]) {return "QRS splitZone() ERROR: pivotIndex can't coincide with the start of a zone";}
			
		}
		
		let bestMatchIndex = 0;
		let bestMatchDataIndex = 0;
		
		for(let i = 0; i < this.index.length; i++) {
			
			if (this.index[i][0] > bestMatchDataIndex && this.index[i][0] < pivotIndex) {
				
				bestMatchDataIndex = this.index[i][0];
				bestMatchIndex = i;
				
			}
			
		}
		
		let newZone = [
			pivotIndex, 
			this.index[bestMatchIndex][0] + this.index[bestMatchIndex][1] - pivotIndex,
			false
		];
			
		this.index.push(newZone);
		
		newZone = [
			this.index[bestMatchIndex][0],
			pivotIndex - this.index[bestMatchIndex][0] + 1,
			false
		];
			
		this.index[bestMatchIndex] = newZone;
		
		return this.index;
		
	}
	
	verifyZones() {
		
		if (this.index.length < 1) {return "QRS verifyZones() ERROR: Index not defined or properly initialized";}
		let maxVal = this.data[0];
		let minVal = this.data[0];
		
		for (let i = 0; i < this.index.length; i++) {
			
			minVal = this.data[this.index[i][0]];
			maxVal = this.data[this.index[i][0] + this.index[i][1] - 1];
			
			for (let j = this.index[i][0]; j < this.index[i][0] + this.index[i][1]; j++) {
				
				if (this.data[j] < minVal || this.data[j] > maxVal) {return false;}
				
			}
			
		}
		
		return true;
		
	}

}

class InsertSort {
	
	constructor(data) {
		
		this.data = data;
		this.state = "OFF";
		this.iniIndex = 0;
		this.pIndex = 1;
		this.endIndex = data.length - 1;
		
	}
	
	//Permission to directly edit the data is not advisable
	//I'm doing it anyways
	swap(a, b) {
	
		let temp = this.data[a];
		this.data[a] = this.data[b];
		this.data[b] = temp;
		
		return true;
	
	}
	
	stateF(state = "NONE") {
	
		if (state == "OFF") {this.state = "OFF"; return "OFF";}
		if (state == "SET") {this.state = "SET"; return "SET";}
		if (state == "ON") {this.state = "ON"; return "ON";}
		if (state == "DONE") {this.state = "DONE"; return "DONE";}
		
		return this.state;
	
	}
	
	minVal(leftI, rightI) {
	
		let bestMatchIndex = rightI;
		
		for(let i = rightI; i >= leftI; i--) {
		
			if (this.data[i] < this.data[bestMatchIndex]) {bestMatchIndex = i;}
		
		}
	
		return bestMatchIndex;
	
	}
	
	setup(leftIndex, rightIndex) {
		
		//Error exceptions
		if (typeof leftIndex != "number" || typeof rightIndex != "number") {
			return "insertSort setup() ERROR: bounds not defined";
		}
		if (leftIndex > rightIndex) {return "insertSort setup() ERROR: bounds reversed";}
		
		if ((rightIndex - leftIndex) < 1) {
			
			this.stateF("OFF");
			return "insertSort setup() ERROR: bounds under 2";
			
		}
		
		this.iniIndex = leftIndex;
		this.pIndex = leftIndex + 1;
		this.endIndex = rightIndex;
		return this.stateF("SET");
		
	}
	
	sort(leftIndex, rightIndex) {
		
		//OFF -> SET
		if (this.stateF() == "OFF") {return this.setup(leftIndex, rightIndex);}
		
		//SET -> ON
		if (this.stateF() == "SET") {return this.stateF("ON");}
		
		//ON -> STEP/DONE
		if (this.stateF() == "ON") {
			
			if (leftIndex != this.iniIndex || rightIndex != this.endIndex) {
				
				this.stateF("OFF");
				return "InsertSort sort() ERROR: Bounds unexpectedly changed";
				
			}
			
			if (this.pIndex + 1 >= this.endIndex) {return this.stateF("DONE");}
			
			this.swap(this.pIndex, this.minVal(this.pIndex, rightIndex));
			this.pIndex++;
			
			return "STEP";
			
		}
		
		//DONE -> OFF
		if (this.stateF() == "DONE") {return this.stateF("OFF");}
		
	}
	
}
	
class PivotSort {

	constructor(data) {
	
		this.data = data; //Pass the reference, not a copy
		this.state = "OFF";
		this.iniIndex = 0;
		this.pIndex = 0;
		this.eIndex = data.length - 1;
		this.endIndex = data.length - 1;
	
	}
	
	//Permission to directly edit the data is not advisable
	//I'm doing it anyways
	swap(a, b) {
	
		let temp = this.data[a];
		this.data[a] = this.data[b];
		this.data[b] = temp;
		
		return true;
	
	}
	
	findPivotIndex(leftIndex, rightIndex) {
		
		let bestMatchIndex = leftIndex + 1;
		
		//Assuming that leftIndex is the minimum value of the dataZone
		let avg = (this.data[leftIndex] + this.data[rightIndex]) / 2;
		let currDiff = abs(avg - this.data[leftIndex]);
		
		for (let i = leftIndex; i <= rightIndex; i++) {
			
			if (abs(avg - this.data[i]) < currDiff) {
				
				currDiff = abs(avg - this.data[i]);
				bestMatchIndex = i;
				
			}
			
		}
		
		return bestMatchIndex;
	
	}
	
	setup(leftIndex, rightIndex) {
	
		//Error exceptions
		if (typeof leftIndex != "number" || typeof rightIndex != "number") {
			return "pivotSort setup() ERROR: bounds not defined";
		}
		if (leftIndex > rightIndex) {return "pivotSort setup() ERROR: bounds reversed";}
		if ((rightIndex - leftIndex) < 2) {
			
			this.stateF("OFF");
			return "pivotSort setup() ERROR: bounds under 3";
			
		}
		
		this.iniIndex = leftIndex;
		this.endIndex = rightIndex;
		
		//Swap the index to the start of the working zone
		let currPIndex = this.findPivotIndex(leftIndex, rightIndex);
		this.swap(leftIndex + 1, currPIndex);
		this.pIndex = leftIndex + 1;
		this.eIndex = rightIndex - 1;
		return this.stateF("SET");
	
	}
	
	stateF(state = "NONE") {
	
		if (state == "OFF") {this.state = "OFF"; return "OFF";}
		if (state == "SET") {this.state = "SET"; return "SET";}
		if (state == "ON") {this.state = "ON"; return "ON";}
		if (state == "DONE") {this.state = "DONE"; return "DONE";}
		
		return this.state;
	
	}
	
	sort(leftIndex, rightIndex) {
		
		//OFF -> SET
		if (this.stateF() == "OFF") {return this.setup(leftIndex, rightIndex);}
		
		//SET -> ON
		if (this.stateF() == "SET") {return this.stateF("ON");}

		//ON -> STEP/DONE
		if (this.stateF() == "ON") {
			
			if (leftIndex != this.iniIndex || rightIndex != this.endIndex) {
				
				this.stateF("OFF");
				return "pivotSort sort() ERROR: Bounds unexpectedly changed";
				
			}
			
			if (this.pIndex >= this.eIndex) {return this.stateF("DONE");}
			
			if (this.data[this.pIndex + 1] < this.data[this.pIndex]) {
				
				this.swap(this.pIndex, this.pIndex + 1);
				this.pIndex++;
				
			} else {
				
				this.swap(this.eIndex, this.pIndex + 1);
				this.eIndex--;
				
			}
			
			return "STEP";
			
		}
		
		//DONE -> OFF
		if (this.stateF() == "DONE") {return this.stateF("OFF");}
	
	}

}
	