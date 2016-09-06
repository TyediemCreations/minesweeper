
function randRange(range){	//returns random integer between 0 and range-1;
							//used primarily to randomly select from an array
	return Math.floor(Math.random() * range);						
	
}

function distance(posi,posf){	//determines distance between position i, and position f		
								//used for mine placement
	var xVal = Math.pow((posf.x-posi.x),2);
	var yVal = Math.pow((posf.y-posi.y),2);
	
	return Math.sqrt(xVal+yVal);
}

var minesweeper = {	//a model of the game board
	grid:[],
	height:16,
	width:30,
	mines:99,
	minesLeft:99,
	gameOver:false,
	gameWon:false,
	
	setVals:function(height,width,mines){
		this.height = height;
		this.width = width;
		this.mines = mines;
		this.minesLeft = mines;
		this.gameOver = false;
		this.gameWon = false;
	},
	createGrid:function(){	//creates a default grid with 'height' rows and 'width' columns
		this.grid = [];
		
		for (var i=0;i<this.height;i++){
			var gridRow = [];
			for (var j=0;j<this.width;j++){
				var cell = {mine:false,clicked:false,flagged:false};
				gridRow.push(cell);
			}
			this.grid.push(gridRow);
		}
	},
	resetGrid:function(){	//resets all grid elements to default values
							//(not currently used; conceeivably helpful for optimizing grid reset)
		for (var i=0;i<this.height;i++){
			for (var j=0;j<this.width;j++){
				grid[i][j].mine = false;
				grid[i][j].clicked = false;
				grid[i][j].flagged = false;
			}
		}
	},
	maxDist:function(){	//determines the maximum distance allotted by the current grid	
						//used in mine placement
		var posi = {x:0,y:0};
		var posf = {x:(this.width-1),y:(this.height-1)}
		
		return distance(posi,posf);
	},
	setMines:function(row,col){	//sets the mines, given the user's first input	
								/*
								Note: other proposed mine-setting algorithms do not require user's input for 100%
								of mine placement. If lag is noticeable, switch to such an algorithm
								*/
		var counter = this.mines;
		var posi = {x:col,y:row};	//user's first input position
		
		var maxDist = this.maxDist();
		
		while (counter > 0){	//while not all mines have been placed
			var posRow = randRange(this.height);
			var posCol = randRange(this.width);	//choose random position on grid
			
			if (this.grid[posRow][posCol].mine) continue;	//ignore cell which already contains mine
			
			var posf = {x:posCol,y:posRow};	//possible position for new mine
			
			var distPercent = distance(posi,posf)/maxDist;
			
			var chance = Math.random();
			if (distPercent > chance){	//0% chance of mine placement acceptance if on user's position		
										//~100% chance of acceptance if maximum distance away
				this.grid[posRow][posCol].mine = true;
				counter--;
			}
		}
		return;
	},
	numAdj:function(row,col){	//returns the number of cells adjacent to (row,col) containing mines
		var counter = 0;
		for (var i=-1;i<=1;i++){
			if ((row+i) < 0 || (row+i) >= this.height)	//ignore invalid row
				continue;
			for (var j=-1;j<=1;j++){
				if (i===j && i===0)	//ignore (row,col); technically unecessary
					continue;
				if ((col+j) < 0 || (col+j) >= this.width)	//ignore invalid column
					continue;
				if (this.grid[row+i][col+j].mine)
					counter++;
			}
		}
		return counter;
	},
	clicked:function(row,col){	//handles click event for (row,col)
		this.grid[row][col].clicked = true;
		
		if (this.grid[row][col].mine){	
			this.gameOver = true;
			//any other game-overy things if applicable
			return;
		}
	},
	rclicked:function(row,col){	//handles right-click event for (row,col)
		if (this.grid[row][col].flagged){
			this.grid[row][col].flagged = false;
			this.minesLeft++;
		}
		else{
			this.grid[row][col].flagged = true;
			this.minesLeft--;
		}
	},
	victoryCheck:function(){	//checks for victory (every grid element that doesn't contain a mine has been clicked)
		for (var i=0;i<this.height;i++){
			for (var j=0;j<this.width;j++){
				var cell = this.grid[i][j];
				if (!cell.mine && !cell.clicked)
					return false;
			}
		}
		this.gameOver = true;
		this.gameWon = true;
		return true;
	},
	TESTprintGrid:function(){	//prints grid to console; used for testing purposes
		for (var i=0;i<this.height;i++){
			var str = "";
			for(var j=0;j<this.width;j++){
				if (this.grid[i][j].mine){
					str += "1";
				}
				else{
					str += "0";
				}
			}
			console.log(str + "\n");
		}
	}
}

var UI = {	//The view; interracts with the model
	height:-1,
	width:-1,
	mines:-1,
	first:true,
	startTime:-1,
	gameOver:false,
	
	init:function(nheight=10,nwidth=10,nmines=10){	//initializes the UI
		var uheight = document.getElementById("height").value;
		var uwidth = document.getElementById("width").value;
		var umines = document.getElementById("mines").value;	//user-defined values. If valid, replace the default values
		
		if (!isNaN(uheight) && uheight > 0)	//NOTE: add an upper bound when a practical one is found
			nheight = uheight;
		if (!isNaN(uwidth) && uwidth > 0)
			nwidth = uwidth;
		if (!isNaN(umines) && umines > 0 && umines < (nheight * nwidth))
			nmines = umines;
		else 
			nmines = Math.min(nmines,(nheight*nwidth)-1);
		
		this.mines=nmines;
		this.first=true;
		this.startTime=-1;
		this.gameOver=false;
		minesweeper.setVals(nheight,nwidth,nmines);
		minesweeper.createGrid();	//set the model grid
		
		for (var i=0;i<Math.max(this.height,nheight);i++){	//add/remove buttons as necessary
			if (i >= this.height){	//new grid out-reaches old grid; add new row
				var newRow = document.createElement("div");
				newRow.id = "div" + i.toString();
				document.getElementById("grid").appendChild(newRow);
			}
			for (var j=0;j<Math.max(this.width,nwidth);j++){
				if (i >= nheight || j >= nwidth){	//old grid out-reaches new grid; remove element
					var elem = document.getElementById(i.toString()+"_"+j.toString());
					if (elem != null)
						elem.parentNode.removeChild(elem);
					continue;
				}
				if (i < this.height && j < this.width){	//reset existing button
					this.buttonReset(i,j);
					continue;
				}
				
				var cell = document.createElement("BUTTON");
				cell.id = i.toString() +"_"+ j.toString();
				cell.setAttribute("class","");
				cell.setAttribute("onclick","UI.clicked("+i+","+j+","+"true)");
				cell.setAttribute("onContextMenu","UI.rclicked(event,"+i+","+j+")");
				document.getElementById("div" + i.toString()).appendChild(cell);	//add new default button
			}
			var div = document.getElementById("div"+i.toString());
			if (i >= nheight){	//old grid out-reaches new grid; remove excess spacing
				div.parentNode.removeChild(div);
			}
			else{	//set div min-width to prevent resizing errors
				var cellWidth = 20;
				var fullWidth = (nwidth*cellWidth).toString() + "px";
				div.style.minWidth = fullWidth;
			}
		}
		this.height = nheight;
		this.width = nwidth;
	},
	buttonReset:function(row,col){	//resets button at (row,col) to default
		var id = row.toString()+"_"+col.toString();
		var cell = document.getElementById(id);
		cell.innerHTML = "";
		cell.disabled = false; 
		cell.setAttribute("class","");
	},
	formatNumber:function(num){	//returns a string representing the formatted number, num
								//formatted numbers are 3 characters long; if the number is less than 3 characters, 0's preceed. formatted numbers do not exceed 999
		var formatted = "000";
		if (num <= 0) 
			return formatted;
		if (num >= 1000)
			return "999";
		
		formatted = formatted + num.toString();
		var len = formatted.length;
		//substring[startIndex, endIndex)
		//substr[startIndex, numChars]
		formatted = formatted.substring(len-3,len);
		
		return formatted;
	},
	update:function(){	//updates the 'timer' and 'mines left' section of the UI
		if (this.gameOver) return;
		
		var timer = document.getElementById("timer");
		var minesLeft = document.getElementById("minesLeft");
		
		if (minesweeper.gameOver){
			//timer.innerHTML = "YOU";
			var setClass;
			if (minesweeper.gameWon){
				setClass = "flagged victory";
				minesLeft.innerHTML = "000";
				//minesLeft.innerHTML = "WON";
			}
			else{
				setClass = "mine";
				//minesLeft.innerHTML = "LOSE";
			}
			
			for (var i=0;i<this.height;i++){	//user has won/lost; mine locations are displayed
				for (var j=0;j<this.width;j++){
					if (minesweeper.grid[i][j].mine){
						var cell = document.getElementById(i.toString()+"_"+j.toString());
						if (cell.className != "mine failed")
							cell.setAttribute("class",setClass);
						//cell.innerHTML = "M";
					}
				}
			}
			
			return;
		}	
		
		if (!this.first){
			var time = Date.parse(new Date()) - this.startTime;
			var seconds = Math.floor((time/1000));
		
			timer.innerHTML = UI.formatNumber(seconds);
		}
		else
			timer.innerHTML = "000";
		
		minesLeft.innerHTML = UI.formatNumber(minesweeper.minesLeft);
		
	},
	rclicked:function(event,row,col){	//called when user right-clicks a button
										//flags/unflags button at (row,col)
		event = event || window.event;
		if (event.preventDefault){
			event.preventDefault();
		}
		else{
			event.returnValue = false;
		}	//remove context window from buttons to prevent imediment to gameplay
	
		if (event.which != 3) return;	//return if not actually a right-click
	
		if (minesweeper.gameOver) return;
		if (minesweeper.grid[row][col].clicked) return;
		
		var cell = document.getElementById(row.toString()+"_"+col.toString());
		if (minesweeper.grid[row][col].flagged){
			cell.setAttribute("class","");
			//cell.innerHTML = "";
		}
		else {
			cell.setAttribute("class","flagged");
			//cell.innerHTML = "F";
		}
		minesweeper.rclicked(row,col);
	},
	clicked:function(row,col,topLevel=false){	/*called when user left-clicks a button
												
												*/
		if (minesweeper.gameOver) return;
		if (minesweeper.grid[row][col].flagged) return;
		
		if (this.first){	//user's first relevant input; mines are set based on this position
			minesweeper.setMines(row,col);
			this.first = false;
			this.startTime = Date.parse(new Date());
			
			//minesweeper.TESTprintGrid();
		}
		
		minesweeper.clicked(row,col);
		
		var cell = document.getElementById(row.toString()+"_"+col.toString());
		cell.disabled = true;
		if (minesweeper.grid[row][col].mine){
			cell.setAttribute("class", "mine failed");
			return;
		}
		
		var adj = minesweeper.numAdj(row,col);
		if (adj === 0){	//if (row,col) has no mines adjacent to it, 'clicked' is called recursively on all adjacent buttons
			for (var i=-1;i<=1;i++){
				if ((row+i) < 0 || (row+i) >= this.height){
					continue;
				}
				for (var j=-1;j<=1;j++){
					if (i===j && i===0) {
						continue;
					}
					if ((col+j) < 0 || (col+j) >= this.width){
						continue;
					}
					if (!minesweeper.grid[row+i][col+j].clicked){
						this.clicked(row+i,col+j);
					}
				}
			}
		}
		else{
			cell.setAttribute("class","_"+adj.toString());
			cell.innerHTML = adj.toString();
		}
		
		if (topLevel)	//check for victory condition only once per user input
			minesweeper.victoryCheck();
	}
}

function clicked(row,column){	//just a test; ignore it.
	console.log("CLICKED! row:"+row+", column:"+column);
}

function createGrid(height=16,width=30,mines=99){	//called at program's start to initiate all elements
	
	var timer = document.createElement("text");
	timer.id = "timer";
	timer.className = "counter";
	timer.innerHTML = "000";
	timer.style.float = "left";
	
	var resetButton = document.createElement("BUTTON");
	resetButton.id = "reset";
	resetButton.setAttribute("onclick","UI.init()");
	resetButton.innerHTML = "RESET";
	
	var minesLeft = document.createElement("text");
	minesLeft.id = "minesLeft";
	minesLeft.className = "counter";
	minesLeft.innerHTML = "000";
	minesLeft.style.float = "right";
	
	document.getElementById("view").appendChild(timer);
	document.getElementById("view").appendChild(resetButton);
	document.getElementById("view").appendChild(minesLeft);
	
	UI.init(height,width,mines);
	window.setInterval(function(){UI.update();},100);
	
	return;
}


createGrid(10,10,10);

