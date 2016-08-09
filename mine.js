var person = {
	firstName:"John",
	lastname:"Doe",
	age:50,
	eyeColor:"blue",
	
	returnAge : function(){
		return age;
	}
	
}

var posn = {	//not using right now; delete if that continues to be the case
	x:0,
	y:0,
	
	set:function(x,y){
		this.x=x;
		this.y=y;
	}
}

function randRange(range){	//returns random integer between 0 and range-1;
							//used primarily to randomly select from an array
	return Math.floor(Math.random() * range);						
	
}

function distance(posi,posf){
	var xVal = Math.pow((posf.x-posi.x),2);
	var yVal = Math.pow((posf.y-posi.y),2);
	
	return Math.sqrt(xVal+yVal);
}

var minesweeper = {
	grid:[],
	height:16,
	width:30,
	mines:99,
	gameOver:false,
	
	setVals:function(height,width,mines){
		this.height = height;
		this.width = width;
		this.mines = mines;
		this.gameOver = false;
	},
	createGrid:function(){
		this.grid = [];
		
		for (var i=0;i<this.height;i++){
			var gridRow = [];
			for (var j=0;j<this.width;j++){
				var cell = {mine:false,clicked:false};
				gridRow.push(cell);
			}
			this.grid.push(gridRow);
		}
	},
	maxDist:function(){
		var posi = {x:0,y:0};
		var posf = {x:(this.width-1),y:(this.height-1)}
		
		return distance(posi,posf);
	},
	setMines:function(row,col){
		var TEST = 0;
		var counter = this.mines;
		var posi = {x:col,y:row};
		
		var maxDist = this.maxDist();
		
		while (counter > 0){
			var posRow = randRange(this.height);
			var posCol = randRange(this.width);
			
			if (this.grid[posRow][posCol].mine) continue;
			
			var posf = {x:posCol,y:posRow};
			
			var distPercent = distance(posi,posf)/maxDist;
			
			var chance = Math.random();
			if (distPercent > chance){
				this.grid[posRow][posCol].mine = true;
				counter--;
				
				TEST++;
			}
		}
		console.log(TEST);
		return;
	},
	numAdj:function(row,col){	//returns the number of adjacent cells containing mines
		var counter = 0;
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
				if (this.grid[row+i][col+j].mine){
					counter++;
				}
			}
		}
		return counter;
	},
	clicked:function(row,col){
		this.grid[row][col].clicked = true;
		
		if (this.grid[row][col].mine){
			this.gameOver = true;
			//any other game-overy things
			return;
		}
	},
	TESTprintGrid:function(){
		//this.setMines(4,20);
		
		//console.log("mines adjacent to row-1, col-2: "+this.numAdj(1,2));
		//this.grid[1][0].mine = true;
		
		for (var i=0;i<this.height;i++){
			var str = "";
			for(var j=0;j<this.width;j++){
				//str += this.grid[i][j].toString();
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

var UI = {
	height:16,
	width:30,
	mines:99,
	first:true,
	//minesweeper:null,
	
	init:function(height,width,mines){
		this.height=height;
		this.width=width;
		this.mines=mines;
		this.first=true;
		minesweeper.setVals(height,width,mines);
		minesweeper.createGrid();
		
		
		for (var i=0;i<height;i++){
			for (var j=0;j<width;j++){
				var cell = document.createElement("BUTTON");
				cell.id = i.toString() + j.toString();
				//cell.setAttribute("value", "Hai");
				cell.style.height = "20px";
				cell.style.width = "20px";
				cell.setAttribute("onclick","UI.clicked("+i+","+j+")");
				document.getElementById("grid").appendChild(cell);
			}
			var br = document.createElement("br");
			document.getElementById("grid").appendChild(br);
		}
	},
	clicked:function(row,col){
		if (this.first){
			minesweeper.setMines(row,col);
			this.first = false;
			
			minesweeper.TESTprintGrid();
		}
		minesweeper.clicked(row,col);
		if (minesweeper.grid[row][col].mine) return;
		//check for minesweeper.gameOver
		//set button to grey
		document.getElementById(row.toString() + col.toString()).disabled = true;
		var adj = minesweeper.numAdj(row,col);
		if (adj === 0){
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
			//document.getElementById(row.toString()+col.toString()).setAttribute("value",adj.toString());
			document.getElementById(row.toString()+col.toString()).innerHTML = adj.toString();
			//set button text to adj
		}
	}
}

function clicked(row,column){
	console.log("CLICKED! row:"+row+", column:"+column);
}

function createGrid(height=16,width=30,mines=99){
	
	UI.init(height,width,mines);
	
	//mineSweeper.setVals(height,width,99);
	//mineSweeper.createGrid();
	//mineSweeper.TESTprintGrid();
	
	return;
}

createGrid(10,10,10);

//to work on: UI.clicked