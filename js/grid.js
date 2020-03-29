class Maze {
	constructor() {
		this.grid = new Grid("grid", 10);
		this.generationAlgo = new subDivider(this.grid);
	}
}

class subDivider{
	constructor(gridToDivide) {
		this.grid = gridToDivide;
		var prevEntryPoints = [0, 0, 0, 0];
		this.recursiveDivide(0, 0 ,this.grid.individualHorizontalCount, this.grid.individualVerticalCount, prevEntryPoints, false);
	}

	randInt(start,end){
		return Math.floor(Math.floor(Math.random()*(end-start+1))+start);
	}

	isEntry(toTry, prevEntries) {
		for (var i = 0; i < prevEntries.length; i++) {
			if (toTry == prevEntries[i]) {
				return true;
			}
		}
		return false;
	}

	randIntWithExclusion(start, end, exclude) {
		var ret = this.randInt(start, end);

		while (this.isEntry(ret, exclude)) {
			ret = this.randInt(start, end);
		}

		return ret;
	}

	floorWithExclusion(start, end, exclude) {
		var ret = Math.floor(((end-start) / 2) + start);

		while (this.isEntry(ret, exclude)) {
			ret += 1;
		}

		return ret;
	}

	async recursiveDivide(firstHorizontal, firstVertical, horizontalCount, verticalCount, prevEntries, breakNow) {

		if (horizontalCount < 4 || verticalCount < 4) {
			return;
		}

		//Do not place a divider on a entry point from previous round
		var horizontalHalfPoint = this.floorWithExclusion(firstHorizontal, (firstHorizontal + horizontalCount), prevEntries);
		var verticalHalfPoint = this.floorWithExclusion(firstVertical, (firstVertical + verticalCount), prevEntries);

		//Quadrasect the grid
		var horizontalHalfCount = Math.ceil(horizontalCount/2);
		var verticalHalfCount = Math.ceil(verticalCount/2);


		//console.log("Horizontally From: " + firstHorizontal + " TO : " + (firstHorizontal + horizontalCount) + " Half @:" + horizontalHalf);
		//console.log("Vertically From: " + firstVertical + " TO : " + (firstVertical + verticalCount) + " Half @:" + verticalHalf);
		var horizontalDiv0 = this.randInt(firstHorizontal + 1, firstHorizontal + (horizontalCount/2) - 1);
		var horizontalDiv1 = this.randInt(firstHorizontal + (horizontalCount/2) + 1, (firstHorizontal + horizontalCount) - 1);
		var verticalDiv0 = this.randInt(firstVertical + 1, firstVertical + (verticalCount/2) - 1);
		var verticalDiv1 = this.randInt(firstVertical + (verticalCount/2) + 1, (firstVertical + verticalCount) - 1);

		var prevEntriesForNextRound = [horizontalDiv0, horizontalDiv1, verticalDiv0, verticalDiv1];
		//var prevEntriesForNextRound = [0, 0, 0, 0];

		//console.log(prevEntriesForNextRound);
		//Draw Horizontal Line
		for (var i = firstHorizontal; i < (firstHorizontal + horizontalCount) && i < this.grid.individualHorizontalCount; i++) {
			if (horizontalDiv0 === i || horizontalDiv1 === i) {
				continue;
			}
			//console.log("First " + verticalHalf + "," + i);
			this.grid.setObs(verticalHalfPoint, i);
			await new Promise(r => setTimeout(r, 15));
		}

		//Draw Vertical Line
		for (var i = firstVertical; i < (firstVertical + verticalCount) && i < this.grid.individualVerticalCount; i++) {
			if (verticalDiv0 === i || verticalDiv1 === i) {
				continue;
			}
			//console.log("Second " + i + "," + horizontalHalf);
			this.grid.setObs(i, horizontalHalfPoint);
			await new Promise(r => setTimeout(r, 15));
		}

		if (!breakNow) {
			this.recursiveDivide(firstHorizontal, firstVertical, horizontalHalfCount , verticalHalfCount, prevEntriesForNextRound, false);
			this.recursiveDivide(horizontalHalfPoint, firstVertical, horizontalHalfCount , verticalHalfCount, prevEntriesForNextRound, false);
			this.recursiveDivide(firstHorizontal, verticalHalfPoint, horizontalHalfCount, verticalHalfCount, prevEntriesForNextRound, false);
			this.recursiveDivide(horizontalHalfPoint, verticalHalfPoint, horizontalHalfCount, verticalHalfCount, prevEntriesForNextRound, false);
		}


	}
}

class Grid{
	constructor(location, squareSize){
		this.grid = [];        //Grid is the empty checker grid
		this.locat = document.getElementById(location);
		this.locat.setAttribute("class","grid");
		var positionInfo = this.locat.getBoundingClientRect();

		this.locat.addEventListener("mousedown", evt => this.mouseClickedDown(evt));
		this.locat.addEventListener("mouseup", evt => this.mouseClickedUp(evt));

		this.height = squareSize;
		this.width = squareSize;

		this.individualHorizontalCount = Math.floor(positionInfo.width / this.width);
		this.individualVerticalCount = Math.floor(positionInfo.height / this.height);

		this.initializeArrs(this.individualHorizontalCount, this.individualVerticalCount);
		this.renderGrid(this.individualHorizontalCount, this.individualVerticalCount, this.width, this.height);
		this.clicked = false;
	}

	setObs(vert, hor) {
		this.grid[vert][hor].setAsObs();
	}

	mouseClickedUp(evt) {
		this.clicked = false;
	}

	mouseClickedDown(evt) {
		this.clicked = true;
	}

	getClicked() {
		return this.clicked;
	}

	initializeArrs(x, y) {
		for (var i = 0; i < y; i++) {
			this.grid[i] = [];
			for (var j = 0; j < x; j++) {
				this.grid[i][j] = null;
			}
		}
	}

	renderGrid(xCount, yCount, individualWidth, individualHeight) {
		//console.log("Creating " + xCount + " By " + yCount + " Size: " + individualWidth);
		for (var i = 0; i < yCount; i++) {
			for (var j = 0; j < xCount; j++) {
				this.grid[i][j] = new GridNode(this.locat, this, individualWidth, individualHeight);
				this.grid[i][j].setAttrib("Cord", [i,j]);
			}
		}
	}
}

class GridNode{
	constructor(parentLocation, parentEl, width, height) {
		this.parentEl = parentEl;
		this.parentLocation = parentLocation;
		this.width = width;
		this.height = height;
		this.myAttribs = {};
		this.renderSelf();
		this.color = "white"
	}

	setAttrib(key, val) {
		this.myAttribs[key] = val;
	}

	getAttrib(key) {
		return this.myAttribs[key];
	}

	dragged(evt) {
		if (this.parentEl.getClicked()) {
			this.flipColor();
		}
	}

	clicked(evt) {
		console.log("Clicked on " + this.myAttribs["Cord"]);
		this.flipColor();
	}

	setAsObs() {
		this.color = "black";
		this.node.style.backgroundColor = this.color;
	}

	flipColor() {
		this.color = (this.color == "black") ? "white": "black";
		this.node.style.backgroundColor = this.color;
	}

	renderSelf() {
		var child = document.createElement('div');
		this.node = this.parentLocation.appendChild(child);
		this.node.style.width = this.width - 2 + "px";
		this.node.style.height = this.height - 2 + "px";
		this.node.style.backgroundColor = this.color;
		this.node.setAttribute("class","gridNode");
		this.node.addEventListener("mouseenter", evt => this.dragged(evt));
		this.node.addEventListener("mousedown", evt => this.clicked(evt));

	}
}