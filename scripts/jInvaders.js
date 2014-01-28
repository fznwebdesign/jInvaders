/**
 * Pedro Carrazco | jInvaders 1.0
 * 
 * This project is just a hobby, created by Pedro Carrazco,
 * reproduction is totally allowed as this code is just for fun.
 * 
 * Este proyecto es solamente un hobby, creado por Pedro Carrazco,
 * cualquier reproduccion es permitida debido a que este codigo tiene 
 * fines unicamente de entretenimiento.
 * 
 * @version 0.1
 * @author Pedro Jose Carrazco Rivera
 */
$.Invaders = function(el,values){
	/* Defaults */
	var defaults = {
		start: true,    // Start after load / Iniciar despues de cargar
		level: 0,     // Speed in miliseconds / Velocidad en milisegundos
		$el: el,        // The jQuery container / El contenedor como objeto jQuery
		t: null
	};
	this.vals = defaults;
	$.extend(this.vals,values);
	// Initialize / Comenzar
	this.init();
};
$.Invaders.prototype = {
	vGrid:[],
	grid: [50,30],
	animation: {
		sDelay:0,
		sCount:0,
		mDelay:1,
		mCount:1
	},
	$grid:null,
	invaders:[],
	level: null,
	dir: "r",
	init:function(){
		this.genCSS();
		this.renderGrid();
		this.loadLevel();
		this.attachEvents();
		if(this.vals.start){
			this.begin();
		}
	},
	update: function(params){
		/*
		var validParams = false,
			nParam = {},
			tmp;
		switch(typeof params){
			case "undefined":
				return;
			break;
			case "string":
				switch(params){
					case "start":
						validParams = true;
						nParam.start = true;
					break;
					case "stop":
						validParams = true;
						nParam.start = false;
					break;
					case "toggle":
						validParams = true;
						nParam.start = (this.vals.start) ? false : true;
					break;
					case "walls":
						this.turnWalls(true);
					break;
					case "noWalls":
						this.turnWalls();
					break;
					case "toggleWalls":
						tmp = (this.vals.walls) ? false : true;
						this.turnWalls(tmp);
					break;
					case "toggleScore":
						tmp = (this.vals.score) ? false : true;
						if(!tmp){
							this.$grid.addClass("noBoard");
						}else{
							this.$grid.removeClass("noBoard");
						}
						this.vals.score = tmp;
					break;
					case "newEnemy":
						this.vals.enemies++;
						this.newNPCSnake();
					break;
					case "newKiller":
						this.vals.killers++;
						this.newNPCSnake(true);
					break;
					case "reset":
						this.vals.start = false;
						this.init();
					break;
					default:
					break;
				}
			break;
			case "number":
				params = {speed:params};
			break;
			case "object":
				if(this.validateGrid(params)){
					params = {grid:params};
				}
			break;
		}
		if(validParams){
			params = nParam;
		}
		if(typeof params == "object"){
			$.extend(this.vals,params);
			
			// Update grid size
			if(!$.isEmptyObject(params.grid)){
				this.renderGrid();
				this.reloadSnakes();
				this.fruit();
				this.attachEvents();
			}
			// Update start
			if(typeof params.start != "undefined"){
				if(params.start){
					this.begin();
				}else{
					this.vals.t = null;
				}
			}
		}
		*/
	},
	renderGrid:function(){
		var c = 0,
			r = 0,
			self = this,
			i,j,$c,$r,vC,vR,width,height,cell;
		
		c = this.grid[0];
		r = this.grid[1];
		this.vGrid = [];
		this.$grid = $("<div>");
		this.$grid.attr("id","GRID");
		for(i=0;i<c;i++){
			vC = [];
			$c = $("<div>");
			$c.addClass("col");
			for(j=0;j<r;j++){
				$r = $("<div>");
				$r.addClass("cell");
				vR = new $.Invaders.Cell(i+","+j,$r);
				$c.append($r);
				vC.push(vR);
			}
			this.$grid.append($c);
			this.vGrid.push(vC);
		}
		this.vals.$el.html(this.$grid);
		
		setTimeout(function(){
			// Fix grid size / Fijar el tamaño de la cuadricula
			width = (parseInt(self.$grid.find(".cell").css("width"))*self.grid[0]);
			height = (parseInt(self.$grid.find(".cell").css("height"))*self.grid[1]);
			self.$grid.css({width:width+"px",height:height+"px"});
			self.vals.$el.find(".GRIDControl").css({width:width+"px",height:height+"px"});
		},10)
	},
	loadLevel: function(){
		var i,len,inv;
		this.invaders = [];
		this.level = (typeof $.Invaders.levels[this.vals.level] != "undefined") ? $.Invaders.levels[this.vals.level] : this.level;
		this.vals.speed = this.level.speed;
		
		for(i=0,len=this.level.enemies.length;i<len;i++){
			inv = this.level.enemies[i];
			this.invaders[i] = new $.Invaders.Invader(inv,this,i);
		}
		
		this.vals.speed = this.level.speed;
		
	},
	genCSS: function(){
		var css = "",$el=null;
		if($("GRIDCSS").length<=0){
			css += "#GRID{background-color:#F9F9F9;border:1px solid #CCC;padding:0 1px 1px 0;position:relative;overflow:visible;}";
			css += "#GRID .cell{height:3px;width:3px;background-color:#FFF;}";
			css += "#GRID .cell.inv{background-color:#000;}";
			css += "#GRID .col {float:left;}";
			css += "#GRID input.GRIDControl{opacity:0;filter:alpha(opacity=0);position:absolute;top:0;left:0;cursor:pointer !important}";
			$el = $("<style>");
			$el.attr("id","GRIDCSS").append(css);
			$("body").append($el);
		}
	},
	go:function(){
		var i,len,
			anim = false,
			move = false;
		if(this.animation.mCount>0){
			this.animation.mCount--
		}else{
			this.animation.mCount = this.animation.mDelay;
			move = true;
			this.checkDir();
		}
		if(this.animation.sCount>0){
			this.animation.sCount--
		}else{
			this.animation.sCount = this.animation.sDelay;
			anim = true;
		}
		for(i=0,len=this.invaders.length;i<len;i++){
			if(anim){
				this.invaders[i].anim();
			}
			if(move){
				this.invaders[i].move();
			}
		}
		this.begin();
	},
	checkDir: function(){
		var reached = false,
			last = this.vGrid.length-2,
			i,len,newDir;
		for(i=0,len=this.vGrid[1].length;i<len;i++){
			if(this.vGrid[1][i].state() != "off"){
				reached = "l";
				break;
			}
		}	
		for(i=0,len=this.vGrid[last].length;i<len;i++){
			if(this.vGrid[last][i].state() != "off"){
				reached = "r";
				break;
			}
		}
		if(reached){
			switch(this.dir){
				case "b":
					newDir = (reached == "r") ? "l" : "r";
				break;
				default:
					newDir = "b";
			}
			console.log(newDir);
			this.dir = newDir;
		}
	},
	begin: function(){
		var self = this;
		this.vals.t = setTimeout(function(){
			self.go();
		},this.vals.speed);
	},
	attachEvents: function(){
	/*
		var target = this.defSnake;
		if(target){
			this.vals.$el.find(".GRIDControl").off("keydown").keydown(function(e){
				switch(e.keyCode){
					case 37:
						target.changeDir("l");
					break;
					case 38:
						target.changeDir("u");
					break;
					case 39:
						target.changeDir("r");
					break;
					case 40:
						target.changeDir("d");
					break;
					default:
						return false;
				}
			});
		}
	*/
	}
}
$.Invaders.Cell = function(id,$el){
        this.id = id;
        this.$el = $el;
        this.st = "off";
};
$.Invaders.Cell.prototype = {
        state: function(s){
                s = s || "get";
                if (s == "get"){
                        return this.st
                }else{
                        this.st = s;
                        if(!this.wall){
                                this.refresh();
                        }
                }
        },
        refresh: function(){
                this.$el.removeClass().addClass("cell")
                if(this.st != "off"){
                        this.$el.addClass(this.st);
                }
        },
        getCoords: function(){
                var coords;
                coords = this.id.split(",");
                coords[0] = parseInt(coords[0]);
                coords[1] = parseInt(coords[1]);
                return coords;
        }
};
$.Invaders.Invader = function(inv,game,id){
	this.id = id;
	this.life = 1;
	this.step = 0;
	this.pos = inv.pos;
	this.kind = inv.kind;
	this.kindData = [];
	this.cells = [];
	this.grid = [];
	this.game = game;
	this.init();
};
$.Invaders.Invader.prototype = {
	init: function(){
		var kind = $.Invaders.kinds[this.kind];
		if(!$.isEmptyObject(kind)){
			this.kindData = kind;
		}else{
			return false;
		}
		this.setCells();
		this.redraw(this.kindData.initial);
	},
	anim: function(){
		this.redraw(this.kindData.variation);
	},
	move: function(){
		this.clear();
		this.nextMove(this.game.dir)
		this.redraw(this.kindData.initial);
	},
	nextMove: function(dir){
		switch(dir){
			case "t":
				this.pos[1]--;
			break;
			case "b":
				this.pos[1] = this.pos[1]+2;
			break;
			case "l":
				this.pos[0]--;
			break;
			case "r":
				this.pos[0]++;
			break;
			
		}
		console.log("nextMove", this.pos,dir)
		this.setCells();
	},
	setCells: function(){
		var i,j,vC,vR;
		this.grid=[];
		for(i=0;i<this.kindData.size[0];i++){
			vC = [];
			for(j=0;j<this.kindData.size[1];j++){
				vR = this.game.vGrid[i+this.pos[0]][j+this.pos[1]];
				vR.state("off");
				vC.push(vR);
			}
			this.grid.push(vC);
		}
	},
	redraw: function(data){
		var i,len,coord,cell;
		for(i=0,len=data.length;i<len;i++){
			coord = data[i];
			cell = this.grid[coord[0]][coord[1]];
			if(cell.state() == "off"){
				cell.state("inv id"+this.id+" "+this.kind);
			}else{
				cell.state("off");
			}
		}
	}
};
$.Invaders.kinds = {
	"c1": {
		size:[13,8],
		life:1,
		initial:[[3,0],[9,0],[4,1],[8,1],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[2,3],[3,3],[5,3],[6,3],[7,3],[9,3],[10,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[1,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[11,5],[1,6],[3,6],[9,6],[11,6],[4,7],[5,7],[7,7],[8,7]],
		variation:[[1,1],[11,1],[1,2],[11,2],[1,3],[11,3],[1,5],[2,5],[10,5],[11,5],[1,6],[11,6],[2,7],[4,7],[5,7],[7,7],[8,7],[10,7]]
	}
};
$.Invaders.levels = {
	0: {
		speed: 300,
		enemies: [
			{kind:"c1",pos:[0,0]}/*,
			{kind:"c1",pos:[12,0]},
			{kind:"c1",pos:[24,0]},
			{kind:"c1",pos:[0,9]},
			{kind:"c1",pos:[12,9]},
			{kind:"c1",pos:[24,9]}*/
		]
	}
};
// jQuery Plugin
$.fn.extend({
	Invaders: function(params) {
		return this.each(function() {
			var $this = $(this), Invaders = $this.data("Invaders");
			if (!Invaders){
				params = params || {};
				Invaders = new $.Invaders($this,params);
				$this.data("Invaders", Invaders);
			}else{
				$this.data("Invaders").update(params);
			}
		});
	}
});
