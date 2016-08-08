var person = {
	firstName:"John",
	lastname:"Doe",
	age:50,
	eyeColor:"blue",
	
	returnAge : function(){
		return age;
	}
	
}

var posn = {
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

var mineSweeper = {
	grid:[],
	height:16,
	width:30,
	mines:99,
	
	setVals:function(height,width,mines){
		this.height = height;
		this.width = width;
		this.mines = mines;
	},
	createGrid:function(){
		this.grid = [];
		
		for (i=0;i<this.height;i++){
			var gridRow = [];
			for (j=0;j<this.width;j++){
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
	setMines:function(xi,yi){
		var counter = this.mines;
		var posi = {x:xi,y:yi};
		
		var maxDist = this.maxDist();
		
		while (counter > 0){
			var posRow = randRange(this.height);
			var posCol = randRange(this.width);
			
			var posf = {x:posCol,y:posRow};
			
			var distPercent = distance(posi,posf)/maxDist;
			
			var chance = Math.random();
			if (distPercent > chance){
				this.grid[posRow][posCol].mine = true;
				counter--;
			}
		}
		return;
	},
	TESTprintGrid:function(){
		this.setMines(4,20);
		
		//this.grid[1][0].mine = true;
		
		for (i=0;i<this.height;i++){
			var str = "";
			for(j=0;j<this.width;j++){
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

function clicked(row,column){
	console.log("CLICKED! row:"+row+", column:"+column);
}

function createGrid(height=16,width=30){
	for (i=0;i<height;i++){
		for (j=0;j<width;j++){
			var cell = document.createElement("BUTTON");
			cell.id = i.toString() + j.toString();
			//cell.setAttribute("value", "Hai");
			cell.style.height = "20px";
			cell.style.width = "20px";
			cell.setAttribute("onclick","clicked("+i.toString()+","+j.toString()+")");
			document.getElementById("grid").appendChild(cell);
		}
		var br = document.createElement("br");
		document.getElementById("grid").appendChild(br);
	}
	
	mineSweeper.setVals(height,width,99);
	mineSweeper.createGrid();
	mineSweeper.TESTprintGrid();
	
	return;
}

createGrid();