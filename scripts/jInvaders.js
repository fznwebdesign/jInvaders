/**
 * Pedro Carrazco | jInvaders 0.1
 * 
 * This project is just a hobbie, created by Pedro Carrazco,
 * reproduction is totally allowed as this code is just for fun.
 * 
 * Este proyecto es solamente un hobbie, creado por Pedro Carrazco,
 * cualquier reproduccion es permitida debido a que este codigo tiene 
 * fines unicamente de entretenimiento.
 * 
 * @version 0.1
 * @author Pedro Jose Carrazco Rivera
 */
$.Invaders = function(el,values){
	/* Defaults */
	var defaults = {
		grid: [50,20],  // Grid size / Tamaño de cuadricula
		start: true,    // Start after load / Iniciar despues de cargar
		speed: 300,     // Speed in miliseconds / Velocidad en milisegundos
		$el: el,        // The jQuery container / El contenedor como objeto jQuery
		t: null
	};
	this.vals = defaults;
	$.extend(this.vals,values);
	if(!this.validateGrid(this.vals.grid)){
		this.vals.grid = defaults.grid;
	}
	// Initialize / Comenzar
	this.init();
};
$.Invaders.prototype = {
	vGrid:[],
	$grid:null,
	invaders:[],
	init:function(){
		this.genCSS();
		this.renderGrid();
		
		// test
		this.invaders[0] = new $.Invaders.Invader("c1",[0,0],this,0);
		this.invaders[1] = new $.Invaders.Invader("c1",[12,0],this,1);
		this.invaders[2] = new $.Invaders.Invader("c1",[24,0],this,2);
		this.invaders[3] = new $.Invaders.Invader("c1",[0,9],this,3);
		this.invaders[4] = new $.Invaders.Invader("c1",[12,9],this,4);
		this.invaders[5] = new $.Invaders.Invader("c1",[24,9],this,5);
		
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
		// Min / Max grid sizes (private)
		// Tamaños Maximo y Minimo de la cuadricula (variable privada)
		gridLimits = [5,150];
		// Apply Min / Max size limits
		// Ajustar el tamaño dentro de los limites
		this.vals.grid[0] = (this.vals.grid[0] < gridLimits[0]) ? gridLimits[0] : (this.vals.grid[0] > gridLimits[1]) ? gridLimits[1] : this.vals.grid[0];
		this.vals.grid[1] = (this.vals.grid[1] < gridLimits[0]) ? gridLimits[0] : (this.vals.grid[1] > gridLimits[1]) ? gridLimits[1] : this.vals.grid[1];
		
		c = this.vals.grid[0];
		r = this.vals.grid[1];
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
			width = (parseInt(self.$grid.find(".cell").css("width"))*self.vals.grid[0]);
			height = (parseInt(self.$grid.find(".cell").css("height"))*self.vals.grid[1]);
			self.$grid.css({width:width+"px",height:height+"px"});
			self.vals.$el.find(".GRIDControl").css({width:width+"px",height:height+"px"});
		},10)
	},
	validateGrid: function(grid){
		// Check format / Revisar el formato
		var res = (!grid instanceof Array || grid.length != 2 || typeof grid[0] != "number" || typeof grid[1] != "number") ? false : true;
		// Validate position / Revisar que la posicion sea valida
		res = (grid[0] < 0) ? false : res;
		res = (grid[1] < 0) ? false : res;
		return res;
	},
	genCSS: function(){
		var css = "",$el=null;
		if($("GRIDCSS").length<=0){
			css += "#GRID{background-color:#F9F9F9;border:1px solid #CCC;padding:0 1px 1px 0;position:relative;overflow:visible;}";
			css += "#GRID .cell{height:5px;width:5px;background-color:#FFF;}";
			css += "#GRID .cell.inv{background-color:#000;}";
			css += "#GRID .col {float:left;}";
			css += "#GRID input.GRIDControl{opacity:0;filter:alpha(opacity=0);position:absolute;top:0;left:0;cursor:pointer !important}";
			$el = $("<style>");
			$el.attr("id","GRIDCSS").append(css);
			$("body").append($el);
		}
	},
	go:function(){
		var i,len;
		for(i=0,len=this.invaders.length;i<len;i++){
			this.invaders[i].turn();
		}
		this.begin();
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
$.Invaders.Invader = function(kind,pos,game,id){
	this.id = id;
	this.life = 1;
	this.animation = {
		sDelay:1,
		sCount:1,
		mDelay:3,
		mCount:3
	};
	this.step = 0;
	this.pos = pos;
	this.kind = kind;
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
	turn: function(){
		if(this.animation.sCount>0){
			this.animation.sCount--
		}else{
			this.animation.sCount = this.animation.sDelay;
			this.redraw(this.kindData.variation);
		}
	},
	setCells: function(){
		var i,j,vC,vR;
		for(i=0;i<this.kindData.size[0];i++){
			vC = [];
			for(j=0;j<this.kindData.size[1];j++){
				vR = this.game.vGrid[i+this.pos[0]][j+this.pos[1]];
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
		size:[11,8],
		initial:[[2,0],[8,0],[3,1],[7,1],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[1,3],[2,3],[4,3],[5,3],[6,3],[8,3],[9,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[0,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[10,5],[0,6],[2,6],[8,6],[10,6],[3,7],[4,7],[6,7],[7,7]],
		variation:[[0,1],[10,1],[0,2],[10,2],[0,3],[10,3],[0,5],[1,5],[9,5],[10,5],[0,6],[10,6],[1,7],[3,7],[4,7],[6,7],[7,7],[9,7]]
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
