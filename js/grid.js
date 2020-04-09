class mazeMaker{
	constructor(gridToDivide) {
		this.grid = gridToDivide;
		var prevEntryPoints = [0, 0, 0, 0];
		this.count = 0;
		//this.recursiveDivide(0, 0 ,this.grid.individualHorizontalCount, this.grid.individualVerticalCount, prevEntryPoints, false);
		//this.setAllAsObs();
	}

	makeMaze() {
		this.primRandomAlgo(this.grid.individualHorizontalCount, this.grid.individualVerticalCount);
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

		//while (this.isEntry(ret, exclude)) {
		//	ret += 1;
		//}

		return ret;
	}

	async setAllAsObs(individualHorizontalCount, individualVerticalCount) {
		for (var i = 0; i < individualVerticalCount ; i++){
			for (var j = 0; j < individualHorizontalCount; j++){
				this.grid.setObs(i, j);
			}
			await new Promise(r => setTimeout(r, 15));
		}

	}

	logArr(arr){
		for (var i = 0; i< arr.length; i++) {
			console.log(arr[i]);
		}
	}

	async primRandomAlgo(individualHorizontalCount, individualVerticalCount) {
		await this.setAllAsObs(individualHorizontalCount, individualVerticalCount);
		var directions =["left", "right", "up", "down"];

		var start = [0, 0]; //this.grid.getStart();
		this.grid.setPass(start[0], start[1]);
		var adj = this.grid.getFrontierCells(start[0], start[1]);
		var toProcess = [];
		toProcess = toProcess.concat(adj);

		var toLookAtNext = null;
		var direction = null;
		var currentDirectionNode = null;
		var nextNode = null;
		var valid = false;

		while (toProcess.length > 0){
			var idx = Math.floor(Math.random() * toProcess.length);
			var node = toProcess[idx]; //Random frontier cell

			valid = false;
			var neighbours = this.grid.getNeighbourCells(node.vert, node.hor);
			//this.logArr(neighbours);
			var neighbourNode = null;
			if (neighbours.length != 0 && node.isObs){
				this.grid.setPass(node.vert, node.hor);
				var neighbourIdx = Math.floor(Math.random() * neighbours.length);
				neighbourNode = neighbours[neighbourIdx];
				this.grid.setPass(neighbourNode.newPassage.vert, neighbourNode.newPassage.hor);
				adj = this.grid.getFrontierCells(node.vert, node.hor);
				toProcess = toProcess.concat(adj);
			}

			toProcess.splice(idx, 1);

			await new Promise(r => setTimeout(r, 1));
			//this.count++;
			//if (this.count > 3)
			//	break;
		}
		if (this.grid.heightIsEven()){
			console.log("Handling Vertical Even");
			for (var i = 0; i< individualHorizontalCount; i++){
				if (!this.grid.isObs(individualVerticalCount - 2, i)) {
					this.grid.setPass(individualVerticalCount -1 , i);
				}
			}
		}
		if (this.grid.widthIsEven()){
			console.log("Handling Horizontal Even");
			for (var i = 0; i< individualVerticalCount; i++){
				if (!this.grid.isObs(i, individualHorizontalCount - 2)) {
					this.grid.setPass(i, individualHorizontalCount-1);
				}
			}

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

	setAllNodeAttrib(attrib, val){
		for (var i = 0; i < this.individualVerticalCount; i++) {
			for (var j = 0; j < this.individualHorizontalCount; j++) {
				this.grid[i][j].setAttrib(attrib, val);
			}
		}
	}

	cleanAll(){
		for (var i = 0; i < this.individualVerticalCount; i++) {
			for (var j = 0; j < this.individualHorizontalCount; j++) {
				this.grid[i][j].setAsPassage();
			}
		}
	}

	countVerticies(){
		var ret = 0;
		for (var i = 0; i < this.individualVerticalCount; i++) {
			for (var j = 0; j < this.individualHorizontalCount; j++) {
				if (!this.grid[i][j].isObs) {
					ret++;
				}
			}
		}
		return ret;
	}

	cleanAllPass(){
		for (var i = 0; i < this.individualVerticalCount; i++) {
			for (var j = 0; j < this.individualHorizontalCount; j++) {
				if (!this.grid[i][j].isObs) {
					this.grid[i][j].setColor("White");
				}
			}
		}
	}

	getAdjacentObs(vert, hor) {
		var left = null;
		var right = null;
		var up = null;
		var down = null;;
		var avail = 0;
		if (hor - 1 >= 0) {
			if (this.grid[vert][hor - 1].isObs){
				left = this.grid[vert][hor - 1];
				avail++;
			}
		}
		if (hor + 1 < this.individualHorizontalCount) {
			if (this.grid[vert][hor + 1].isObs){
				right = this.grid[vert][hor + 1];
				avail++;
			}
		}

		if (vert - 1 >= 0) {
			if (this.grid[vert - 1][hor].isObs){
				up = this.grid[vert - 1][hor];
				avail++;
			}
		}
		if (vert + 1 < this.individualVerticalCount) {
			if (this.grid[vert + 1][hor].isObs){
				down = this.grid[vert + 1][hor];
				avail++;
			}
		}
		return {
			left: left,
			right: right,
			up: up,
			down: down,
			avail: avail,
			me: this.grid[vert][hor],
		};
	}

	//Frontier cells, from POV of passage is len 2 obstacle
	getFrontierCells(vert, hor) {
		var avail = [];

		if (hor - 2 >= 0) {
			if (this.grid[vert][hor - 2].isObs){
				avail.push(this.grid[vert][hor - 2]);
			}
		}
		if (hor + 2 < this.individualHorizontalCount) {
			if (this.grid[vert][hor + 2].isObs){
				avail.push(this.grid[vert][hor + 2]);
			}
		}

		if (vert - 2 >= 0) {
			if (this.grid[vert - 2][hor].isObs){
				avail.push(this.grid[vert - 2][hor]);
			}
		}

		if (vert + 2 < this.individualVerticalCount) {
			if (this.grid[vert + 2][hor].isObs){
				avail.push(this.grid[vert + 2][hor]);
			}
		}
		return avail;
	}

	//Neighbour cells, from POV of frontier is len 2 passage
	getNeighbourCells(vert, hor) {
		var left = null;
		var right = null;
		var up = null;
		var down = null;
		var toPush = null;
		var avail = [];

		if (hor - 2 >= 0) {
			if (!this.grid[vert][hor - 2].isObs){
				toPush = {
					neighbour: this.grid[vert][hor - 2],
					newPassage: this.grid[vert][hor - 1]
				}
				avail.push(toPush);
			}
		}
		if (hor + 2 < this.individualHorizontalCount) {
			if (!this.grid[vert][hor + 2].isObs){
				toPush = {
					neighbour: this.grid[vert][hor + 2],
					newPassage: this.grid[vert][hor + 1]
				}
				avail.push(toPush);
			}
		}

		if (vert - 2 >= 0) {
			if (!this.grid[vert - 2][hor].isObs){
				toPush = {
					neighbour: this.grid[vert - 2][hor],
					newPassage: this.grid[vert - 1][hor]
				}
				avail.push(toPush);
			}
		}
		if (vert + 2 < this.individualVerticalCount) {
			if (!this.grid[vert + 2][hor].isObs){
				toPush = {
					neighbour: this.grid[vert + 2][hor],
					newPassage: this.grid[vert + 1][hor]
				}
				avail.push(toPush);
			}
		}
		return avail;
	}

	getAdjacentPassages(vert, hor){
		var avail = [];

		if (hor - 1 >= 0) {
			if (!this.grid[vert][hor - 1].isObs){
				avail.push(this.grid[vert][hor - 1]);
			}
		}
		if (hor + 1 < this.individualHorizontalCount) {
			if (!this.grid[vert][hor + 1].isObs){
				avail.push(this.grid[vert][hor + 1]);
			}
		}

		if (vert - 1 >= 0) {
			if (!this.grid[vert - 1][hor].isObs){
				avail.push(this.grid[vert - 1][hor]);
			}
		}

		if (vert + 1 < this.individualVerticalCount) {
			if (!this.grid[vert + 1][hor].isObs){
				avail.push(this.grid[vert + 1][hor]);
			}
		}
		return avail;
	}

	getStart(){
		return this.startNode;
	}

	getEnd(){
		return this.endNode;
	}

	setObs(vert, hor) {
		this.grid[vert][hor].setAsObs();
	}

	isObs(vert, hor) {
		return this.grid[vert][hor].isObs;
	}

	setPass(vert, hor) {
		this.grid[vert][hor].setAsPassage();
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

	heightIsEven(){
		return (this.individualVerticalCount % 2) == 0
	}
	widthIsEven(){
		return (this.individualHorizontalCount % 2) == 0
	}

	renderGrid(xCount, yCount, individualWidth, individualHeight) {
		console.log("Creating " + xCount + " By " + yCount + " Size: " + individualWidth + " Total Render: " + yCount*xCount);
		for (var i = 0; i < yCount; i++) {
			for (var j = 0; j < xCount; j++) {
				this.grid[i][j] = new GridNode(this.locat, this, individualWidth, individualHeight, i, j);
				this.grid[i][j].setAttrib("Cord", [i,j]);

			}
		}

		this.grid[0][0].setAsStart();
		this.startNode = this.grid[0][0];

		this.grid[yCount - 1][xCount - 1].setAsEnd();
		this.endNode = this.grid[yCount - 1][xCount - 1];
	}
}

class GridNode{
	constructor(parentLocation, parentEl, width, height, vert, hor) {
		this.vert = vert;
		this.hor = hor;
		this.parentEl = parentEl;
		this.parentLocation = parentLocation;
		this.width = width;
		this.height = height;
		this.myAttribs = {};
		this.renderSelf();
		this.color = "white"
		this.isStart= false;
		this.isEnd= false;
		this.isObs = false;
	}

	setAttrib(key, val) {
		this.myAttribs[key] = val;
	}

	getAttrib(key) {
		if (key in this.myAttribs) {
			return this.myAttribs[key];
		}

		return null;
	}

	dragged(evt) {
		if (this.parentEl.getClicked()) {
			this.evalPassObs();
		}
	}
	
	evalPassObs(){
		if (this.isObs) {
			this.setAsPassage();
		} else {
			this.setAsObs();
		}
	}

	clicked(evt) {
		console.log("Clicked on " + this.myAttribs["Cord"]);
		this.evalPassObs();
	}

	setAsObs() {
		if (!(this.isStart || this.isEnd)) {
			this.color = "black";
			this.isObs = true;
			this.setAttrib("weight", Infinity);
			this.node.style.backgroundColor = this.color;
		}
	}

	setAsPassage() {
		this.color = "white";
		this.setAttrib("weight", 1);
		this.isObs = false;
		this.node.style.backgroundColor = this.color;
	}

	flipColor() {
		this.color = (this.color == "black") ? "white": "black";
		this.node.style.backgroundColor = this.color;
	}

	setColor(color) {
		this.color = color;
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

	setAsStart() {
		this.node.style.backgroundImage = "url('img/startFlag.PNG')";
		this.isStart= true;
	}

	setAsEnd() {
		this.node.style.backgroundImage = "url('img/endFlag.PNG')";
		this.isEnd = true;
	}
}