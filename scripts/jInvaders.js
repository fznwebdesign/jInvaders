/**
 * Pedro Carrazco | jInvaders 1.0
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
// Game Object
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
	grid: [50,35],
	$grid:null,
	cannon:null,
	invaders:[],
	lasers:[],
	level: null,
	limit:0,
	keys:[],
	dir: "l",
	init:function(){
		this.genCSS();
		this.renderGrid();
		this.cannon = new $.Invaders.Cannon(this);
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
		this.$grid.append("<input type='text' class='GRIDControl' />");
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
			css += "#GRID .cell.user{background-color:#0A2;}";
			css += "#GRID .cell.lsr{background-color:#A20;}";
			css += "#GRID .col {float:left;}";
			css += "#GRID input.GRIDControl{opacity:0;filter:alpha(opacity=0);position:absolute;top:0;left:0;cursor:pointer !important}";
			$el = $("<style>");
			$el.attr("id","GRIDCSS").append(css);
			$("body").append($el);
		}
	},
	go:function(){
		var i,len,inv,next,lsr;
		if(!this.vals.start){
			return false;
		}
		// Move Invaders
		next = this.levelNextStep();
		if(next){
			if(next[0]){
				this.checkDir();
			}
			for(i=0,len=this.invaders.length;i<len;i++){
				inv = this.invaders[i];
				if(!inv.dead){
					if(inv.life>0){
						inv.go(next);
					}else{
						inv.die();
					}
				}
			}
		}
		// Move User
		if(this.keys.length>0){
			if(this.keys[37]){
				this.cannon.move("l");
			}else if(this.keys[39]){
				this.cannon.move("r");
			}
			if(this.keys[32]){
				this.cannon.shoot();
				delete this.keys[32];
			}
		}
		// Move Lasers
		for(i=0,len=this.lasers.length;i<len;i++){
			lsr = this.lasers[i];
			if(lsr && !lsr.off){
				lsr.move();
			}else{
				//lsr = false;
			}
		}
		this.begin();
	},
	gameOver: function(){
		console.log("game over");
		this.vals.start = false;
	},
	levelNextStep: function(){
		var anim = false,
			move = false;
		if(this.level.animation.mCount>0){
			this.level.animation.mCount--;
		}else{
			this.level.animation.mCount = this.level.animation.mDelay;
			move = true;
		}
		if(this.level.animation.sCount>0){
			this.level.animation.sCount--
		}else{
			this.level.animation.sCount = this.level.animation.sDelay;
			anim = true;
		}
		return (move || anim) ? [move,anim] : false
	},
	checkDir: function(){
		var reached = false,
			last = this.vGrid.length-2,
			i,len;
		console.log("check dir start",this.dir)
		if(this.dir == "l" || this.dir == "b"){
			for(i=0,len=this.vGrid[0].length;i<len;i++){
				if(this.vGrid[1][i].state().indexOf("inv")>=0){
					reached = "r";
					break;
				}
			}
		}
		if(this.dir == "r" || this.dir == "b"){
			for(i=0,len=this.vGrid[last].length;i<len;i++){
				if(this.vGrid[last][i].state().indexOf("inv")>=0){
					reached = "l";
					break;
				}
			}
		}
		if(reached){
			if(this.dir != "b"){
				for(i=0,len=this.vGrid[last].length;i<len;i++){
					if(this.vGrid[i][this.limit].state().indexOf("inv")>=0){
						this.gameOver();
						break;
					}
				}
				this.dir = "b";
			}else{
				this.dir = reached;
			}
		}
		console.log("check dir end",this.dir,reached)
	},
	begin: function(){
		var self = this;
		this.vals.t = setTimeout(function(){
			self.go();
		},this.vals.speed);
	},
	attachEvents: function(){
		var self = this;
		if(self.cannon){
			self.vals.$el.find(".GRIDControl").off("keydown").keydown(function(e){
				self.keys[e.which] = true;
			});
			self.vals.$el.find(".GRIDControl").off("keyup").keyup(function(e){
				if(e.which!=32){
					delete self.keys[e.which];
				}
			});
		}
	}
}
// Game Items Objects
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
	this.dead = false;
	this.pos = inv.pos;
	this.kind = inv.kind;
	this.kindData = [];
	this.cells = [];
	this.grid = [];
	this.game = game;
	this.hit = false;
	this.level = game.level;
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
		this.life = this.kindData.life;
		this.setCells();
		this.redraw(this.kindData.initial);
	},
	go: function(next){
		if(next[0]){
			this.move();
		}else if(next[1]){
			this.anim();
		}
	},
	anim: function(){
		if(this.hit){
			this.hit = false;
			this.redraw(this.kindData.initial);
		}else{
			this.redraw(this.kindData.variation);
		}
	},
	move: function(){
		this.clear();
		this.nextMove(this.game.dir)
		this.redraw(this.kindData.initial);
	},
	hurt: function(){
		this.life--;
		this.hit = true;
		this.clear();
		if(this.life<1){
			this.redraw(this.kindData.death);
		}
	},
	die: function(){
		this.dead = true;
		this.clear();
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
	clear: function(){
		var i,j;
		for(i=0;i<this.kindData.size[0];i++){
			for(j=0;j<this.kindData.size[1];j++){
				this.grid[i][j].state("off");
			}
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
$.Invaders.Lasser = function(pos,dir,game){
	this.pos = pos;
	this.game = game;
	this.dir = dir;
	this.step = 2;
	this.off = false;
	this.init();
};
$.Invaders.Lasser.prototype = {
	init: function(){
		this.kindData = $.Invaders.kinds.laser;
		this.setCells();
		this.redraw(this.kindData.initial);
	},
	move: function(dir){
		dir = dir || this.dir;
		this.clear();
		this.nextMove(dir);
		if(!this.off){
			this.redraw(this.kindData.initial);
		}
	},
	nextMove: function(dir){
		switch(dir){
			case "t":
				if(this.pos[1]>2){
					this.pos[1] = this.pos[1]-this.step;
				}else{
					this.off = true;
				}
			break;
			case "d":
				if(this.pos[1]<(this.game.grid[1]-(this.kindData.size[1]+2))){
					this.pos[1] = this.pos[1]+this.step;
				}else{
					this.off = true;
				}
			break;
			
		}
		this.setCells();
	},
	setCells: function(){
		var i,j,vC,vR;
		this.grid=[];
		for(i=0;i<this.kindData.size[0];i++){
			vC = [];
			for(j=0;j<this.kindData.size[1];j++){
				vR = this.game.vGrid[i+this.pos[0]][j+this.pos[1]];
				if(vR.state()!="off"){
					this.colition(vR.state());
				}
				vR.state("off");
				vC.push(vR);
			}
			this.grid.push(vC);
		}
	},
	colition: function(cS){
		var cSar,i,len,
			crash = {
				inv: false,
				usr: false,
				lsr: false,
				type:false,
				id:"",
			};
		cSar = cS.split(" ");
		if(cS.indexOf("inv")>=0){
			crash.inv = true;
			crash.id = parseInt(cSar[1].replace("id",""));
			crash.type = cSar[2];
			this.game.invaders[crash.id].hurt();
		}else if(cS.indexOf("user")>=0){
			console.log("user")
		}else if(cS.indexOf("lsr")>=0){
			console.log("lsr")
		}
		this.off = true;
	},
	clear: function(){
		var i,j;
		for(i=0;i<this.kindData.size[0];i++){
			for(j=0;j<this.kindData.size[1];j++){
				this.grid[i][j].state("off");
			}
		}
	},
	redraw: function(data){
		var i,len,coord,cell;
		for(i=0,len=data.length;i<len;i++){
			coord = data[i];
			cell = this.grid[coord[0]][coord[1]];
			if(cell.state() == "off"){
				cell.state("lsr");
			}else{
				cell.state("off");
			}
		}
	}
};
$.Invaders.Cannon = function(game){
	this.life = 1;
	this.kindData = $.Invaders.kinds["cannon"];
	this.cells = [];
	this.pos = [0,0];
	this.game = game;
	this.init();
};
$.Invaders.Cannon.prototype = {
	init: function(){
		this.pos[0] = Math.floor(this.game.grid[0]/2);
		this.pos[1] = this.game.grid[1]-(this.kindData.size[1]);
		this.game.limit = this.pos[1]-3;
		this.life = this.kindData.life;
		if($.isEmptyObject(this.kindData)){
			return false;
		}
		this.setCells();
		this.redraw(this.kindData.initial);
	},
	move: function(dir){
		this.clear();
		this.nextMove(dir)
		this.redraw(this.kindData.initial);
	},
	shoot: function(){
		var nX,nY,lsr;
		nX = this.pos[0]+this.kindData.gun[0];
		nY = this.pos[1]-2;
		lsr = new $.Invaders.Lasser([nX,nY],"t",this.game);
		this.game.lasers.push(lsr);
	},
	hurt: function(){
		this.life--;
		this.clear();
		this.redraw(this.kindData.death);
		if(this.life<1){
			this.game.gameOver();
		}
	},
	die: function(){
		this.clear();
	},
	nextMove: function(dir){
		switch(dir){
			case "l":
				this.pos[0] = (this.pos[0]>2) ? this.pos[0]-1 : this.pos[0];
			break;
			case "r":
				this.pos[0] = (this.pos[0]<(this.game.grid[0]-(this.kindData.size[0]+2))) ? this.pos[0]+1 : this.pos[0];
			break;
			
		}
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
	clear: function(){
		var i,j;
		for(i=0;i<this.kindData.size[0];i++){
			for(j=0;j<this.kindData.size[1];j++){
				this.grid[i][j].state("off");
			}
		}
	},
	redraw: function(data){
		var i,len,coord,cell;
		for(i=0,len=data.length;i<len;i++){
			coord = data[i];
			cell = this.grid[coord[0]][coord[1]];
			if(cell.state() == "off"){
				cell.state("user");
			}else{
				cell.state("off");
			}
		}
	}
};
//Game Data
$.Invaders.kinds = {
	"c1": {
		size:[11,8],
		life:2,
		gun:[5,0],
		initial:[[2,0],[8,0],[3,1],[7,1],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[1,3],[2,3],[4,3],[5,3],[6,3],[8,3],[9,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[0,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[10,5],[0,6],[2,6],[8,6],[10,6],[3,7],[4,7],[6,7],[7,7]],
		variation:[[0,1],[10,1],[0,2],[10,2],[0,3],[10,3],[0,5],[1,5],[9,5],[10,5],[0,6],[10,6],[1,7],[3,7],[4,7],[6,7],[7,7],[9,7]],
		death:[[0,0],[3,0],[7,0],[10,0],[1,1],[4,1],[6,1],[9,1],[2,2],[8,2],[0,3],[10,3],[2,4],[8,4],[1,5],[4,5],[6,5],[9,5],[0,6],[3,6],[7,6],[10,6]]
	},
	"cannon": {
		size:[11,7],
		life:2,
		gun:[5,0],
		initial:[[5,0],[4,1],[5,1],[6,1],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6]],
		death:[[4,0],[9,1],[4,2],[6,2],[8,2],[1,3],[4,3],[3,4],[5,4],[6,4],[8,4],[9,4],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6]]
	},
	"laser": {
		size:[1,2],
		initial:[[0,0],[0,1]],
		death:[]
	}
};
$.Invaders.levels = {
	0: {
		speed: 50,
		animation: {
			sDelay:4,
			sCount:4,
			mDelay:9,
			mCount:9
		},
		enemies: [
			{kind:"c1",pos:[25,11]},
			{kind:"c1",pos:[13,11]},
			{kind:"c1",pos:[1,11]},
			{kind:"c1",pos:[25,0]},
			{kind:"c1",pos:[13,0]},
			{kind:"c1",pos:[1,0]}
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
