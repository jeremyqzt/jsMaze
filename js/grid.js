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

		var individualXCount = Math.floor(positionInfo.width / this.width);
		var individualYCount = Math.floor(positionInfo.height / this.height);

		this.initializeArrs(individualXCount, individualYCount);
		this.renderGrid(individualXCount, individualYCount, this.width, this.height);
		this.clicked = false;
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
		for (var i = 0; i < x; i++) {
			this.grid[i] = [];
			for (var j = 0; j < y; j++) {
				this.grid[i][j] = null;
			}
		}
	}

	renderGrid(xCount, yCount, individualWidth, individualHeight) {

		console.log("Creating " + xCount + " By " + yCount + " Size: " + individualWidth);
		for (var i = 0; i < xCount; i++) {
			for (var j = 0; j < yCount; j++) {
				this.grid[i][j] = new GridNode(this.locat, this, individualWidth, individualHeight);
				//this.grid[i][j].addEventListener("click", evt => this.getMove(evt));
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

	clicked(evt) {
		if (this.parentEl.getClicked()) {
			this.color = (this.color == "black") ? "white": "black";
			this.node.style.backgroundColor = this.color;
		}
	}

	renderSelf() {
		var child = document.createElement('div');
		this.node = this.parentLocation.appendChild(child);
		this.node.style.width = this.width - 2 + "px";
		this.node.style.height = this.height - 2 + "px";
		this.node.style.backgroundColor = this.color;
		this.node.setAttribute("class","gridNode");
		this.node.addEventListener("mouseenter", evt => this.clicked(evt));
	}
}