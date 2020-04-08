var discoveredKey = "discovered";
var previousKey = "previousKey";

async function DFSearch(grid, cur, end, first){
	if (first){
		grid.setAllNodeAttrib(discoveredKey, false);
	}
	//console.log(end);

	if (end.getAttrib(discoveredKey)){
		return;
	}

	var adjToStart = grid.getAdjacentPassages(cur.vert, cur.hor);
	cur.setAttrib(discoveredKey, true);
	cur.setColor("Gold");
	await new Promise(r => setTimeout(r, 10));
	for (var i = 0; i < adjToStart.length; i++) {
		if (!adjToStart[i].getAttrib(discoveredKey)) {
			adjToStart[i].setAttrib(discoveredKey, true);
			adjToStart[i].setAttrib(previousKey, cur);

			await DFSearch(grid, adjToStart[i], end, false);
		}
	}
	if (!end.getAttrib(discoveredKey)) {
		cur.setColor("LightCoral");
	}

}


async function BFSearch(grid, cur, end, first){
	if (first){
		grid.setAllNodeAttrib(discoveredKey, false);
	}
	//console.log(end);

	if (end.getAttrib(discoveredKey)){
		return;
	}

	var adjToStart = grid.getAdjacentPassages(cur.vert, cur.hor);
	cur.setAttrib(discoveredKey, true);
	cur.setColor("red");
	await new Promise(r => setTimeout(r, 10));
	for (var i = 0; i < adjToStart.length; i++) {
		if (!adjToStart[i].getAttrib(discoveredKey)) {
			adjToStart[i].setAttrib(discoveredKey, true);
			adjToStart[i].setAttrib(previousKey, cur);
			BFSearch(grid, adjToStart[i], end, false);
		}
	}
	if (!end.getAttrib(discoveredKey)) {
		cur.setColor("green");
	}

}