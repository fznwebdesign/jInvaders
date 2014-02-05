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
// Game Object
$.Invaders = function(el,values){
	/* Defaults */
	var defaults = {
		start: true,    // Start after load / Iniciar despues de cargar
		level: 1,     // Speed in miliseconds / Velocidad en milisegundos
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
	grid: [100,100],
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
		this.loadLevel();
		this.cannon = new $.Invaders.Cannon(this);
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
			css += "#GRID .cell.cannon{background-color:#0A2;}";
			css += "#GRID .cell.laser{background-color:#A20;}";
			css += "#GRID .col {float:left;}";
			css += "#GRID input.GRIDControl{opacity:0;filter:alpha(opacity=0);position:absolute;top:0;left:0;cursor:pointer !important}";
			$el = $("<style>");
			$el.attr("id","GRIDCSS").append(css);
			$("body").append($el);
		}
	},
	go: function(){
		var i,len,inv,next,lsr,
			count=0;
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
						count++;
						inv.go(next);
					}else{
						inv.die();
					}
				}
			}
			if(count<1){
				this.gameWin();
			}
		}
		// Move User
		if(this.keys.length>0){
			if(this.keys[37]){
				this.cannon.go("l");
			}else if(this.keys[39]){
				this.cannon.go("r");
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
				lsr.go();
			}else{
				//lsr = false;
			}
		}
		this.begin();
	},
	gameOver: function(){
		alert("Game Over");
		this.vals.start = false;
	},
	gameWin: function(){
		alert("You Win!");
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
};
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
// Game Items
$.Invaders.Invader = function(inv,game,id){
	this.id = id;
	this.life = 1;
	this.dead = false;
	this.kind = inv.kind;
	this.game = game;
	this.hit = false;
	this.level = game.level;
	this.actions = new $.Invaders.Actions(this,inv.pos,this.game.level.step);
	this.init();
};
$.Invaders.Invader.prototype = {
	init: function(){
		this.life = this.actions.kindData.life;
		this.actions.setCells();
		this.actions.redraw();
	},
	go: function(next){
		if(next[0]){
			this.actions.dir = this.game.dir;
			this.actions.move();
		}else if(next[1]){
			this.anim();
		}
	},
	anim: function(){
		if(this.hit){
			this.hit = false;
			this.actions.redraw();
		}else{
			this.actions.redraw("variation");
		}
		if(this.actions.kindData.chance > Math.random()){
			this.shoot();
		}
	},
	shoot: function(){
		var lsr,
			pos = this.actions.getCenter();
		lsr = new $.Invaders.Lasser(pos,"b",this.game,"inv");
		this.game.lasers.push(lsr);
	},
	hurt: function(){
		if(!this.hit){
			this.life--;
			this.hit = true;
			this.actions.clear();
			if(this.life<1){
				this.actions.redraw("death");
			}
		}
	},
	die: function(){
		this.dead = true;
		this.actions.clear();
	}
};
$.Invaders.Lasser = function(pos,dir,game,source){
	this.game = game;
	this.off = false;
	this.kind = "laser";
	this.avoid = source;
	this.actions = new $.Invaders.Actions(this,pos,2);
	this.actions.dir = dir;
	this.init();
};
$.Invaders.Lasser.prototype = {
	init: function(){
		this.actions.setCells();
		this.actions.redraw();
	},
	go: function(){
		this.actions.move();
	},
	colition: function(cS){
		var cSar,i,len,
			crash = false;
		cSar = cS.split(" ");
		if(cS.indexOf("inv")>=0 && this.avoid != "inv"){
			crash = parseInt(cSar[1].replace("id",""));
			this.game.invaders[crash].hurt();
		}else if(cS.indexOf("cannon")>=0){
			this.game.cannon.hurt();
		}else if(cS.indexOf("laser")>=0){
			console.log("laser")
			crash = true;
		}
		if(crash){
			this.off = true;
		}
	}
};
$.Invaders.Cannon = function(game){
	this.life = 0;
	this.kind = "cannon";
	this.hit = false;
	this.game = game;
	this.actions = new $.Invaders.Actions(this);
	this.init();
};
$.Invaders.Cannon.prototype = {
	init: function(){
		this.game.limit = this.actions.pos[1]-this.game.level.step;
		this.life = this.actions.kindData.life;
		this.actions.setCells();
		this.actions.redraw();
	},
	go: function(dir){
		this.actions.dir = dir;
		this.actions.move();
		this.hit = false;
	},
	shoot: function(){
		var lsr,
			pos = this.actions.getCenter();
		this.hit = false;
		lsr = new $.Invaders.Lasser(pos,"t",this.game,"cannon");
		this.game.lasers.push(lsr);
	},
	hurt: function(){
		if(!this.hit){
			this.hit = true;
			this.life--;
			this.actions.clear();
			this.actions.redraw("death");
			if(this.life<1){
				this.game.gameOver();
			}
		}
	},
	die: function(){
		this.actions.clear();
	}
};
$.Invaders.Actions = function(caller,pos,step){
	this.alive = true;
	this.caller = caller;
	this.kind = this.caller.kind;
	this.game = this.caller.game;
	this.step = step || 1;
	this.grid = [];
	this.dir = "r";
	this.st = (this.kind != "cannon" && this.kind != "laser") ? "inv id" + this.caller.id + " " + this.kind : this.kind ;
	this.init(this.kind,pos)
};
$.Invaders.Actions.prototype = {
	init: function(name,pos){
		var kind = $.Invaders.kinds[name];
		if(!$.isEmptyObject(kind)){
			this.kindData = kind;
		}else{
			return false;
		}
		this.pos = pos || [Math.floor(this.game.grid[0]/2),Math.floor(this.game.grid[1]-this.kindData.size[1])];
	},
	move: function(){
		this.clear();
		this.nextMove(this.dir);
		this.setCells();
		this.redraw("initial");
	},
	nextMove: function(dir){
		var limits = false,
			pos = this.pos;
		switch(dir){
			case "l":
				pos[0] = (pos[0]>0) ? pos[0]-1 : pos[0];
			break;
			case "r":
				pos[0] = (pos[0]<(this.game.grid[0]-this.kindData.size[0])) ? pos[0]+1 : pos[0];
			break;
			case "t":
				if(pos[1]>1){
					pos[1] = pos[1]-this.step;
				}else{
					limits = true;
				}
			break;
			case "b":
				if(pos[1]<(this.game.grid[1]-(this.kindData.size[1]+1))){
					pos[1] = pos[1]+this.step;
				}else{
					limits = true;
				}
			break;
		}
		this.pos = pos;
		this.caller.off = limits;
	},
	getCenter: function(){
		var nX,nY,lsr;
		nX = this.pos[0] + Math.floor(this.kindData.size[0] / 2);
		nY = (this.kind == "cannon") ? this.pos[1]-2 : this.pos[1] + this.kindData.size[1] ;
		return [nX,nY];
	},
	setCells: function(){
		var i,j,vC,vR;
		this.grid=[];
		for(i=0;i<this.kindData.size[0];i++){
			vC = [];
			for(j=0;j<this.kindData.size[1];j++){
				vR = this.game.vGrid[i+this.pos[0]][j+this.pos[1]];
				if(this.kind == "laser" && vR.state() != "off"){
					this.caller.colition(vR.state());
				}
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
	redraw: function(pattern){
		var i,len,coord,cell,
			pattern = pattern || "initial",
			data = this.kindData[pattern];
		if(this.caller.off || typeof data == "undefined"){
			return false;
		}
		for(i=0,len=data.length;i<len;i++){
			coord = data[i];
			cell = this.grid[coord[0]][coord[1]];
			if(cell.state() == "off"){
				cell.state(this.st);
			}else{
				cell.state("off");
			}
		}
	}
};
$.Invaders.kinds = {
	"c1": {
		size:[11,8],
		life:2,
		chance:0.01,
		initial:[[2,0],[8,0],[3,1],[7,1],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[1,3],[2,3],[4,3],[5,3],[6,3],[8,3],[9,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[0,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[10,5],[0,6],[2,6],[8,6],[10,6],[3,7],[4,7],[6,7],[7,7]],
		variation:[[0,1],[10,1],[0,2],[10,2],[0,3],[10,3],[0,5],[1,5],[9,5],[10,5],[0,6],[10,6],[1,7],[3,7],[4,7],[6,7],[7,7],[9,7]],
		death:[[0,0],[3,0],[7,0],[10,0],[1,1],[4,1],[6,1],[9,1],[2,2],[8,2],[0,3],[10,3],[2,4],[8,4],[1,5],[4,5],[6,5],[9,5],[0,6],[3,6],[7,6],[10,6]]
	},
	"c2": {
		size:[8,8],
		life:1,
		chance:0.05,
		initial:[[3,0],[4,0],[2,1],[3,1],[4,1],[5,1],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[0,3],[1,3],[3,3],[4,3],[6,3],[7,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[1,5],[3,5],[4,5],[6,5],[0,6],[7,6],[1,7],[6,7]],
		variation:[[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[0,6],[1,6],[3,6],[4,6],[6,6],[7,6],[0,7],[1,7],[2,7],[5,7],[6,7],[7,7]],
		death:[[0,0],[3,0],[4,0],[7,0],[1,1],[6,1],[2,2],[5,2],[0,3],[7,3],[2,4],[5,4],[1,5],[6,5],[0,6],[3,6],[4,6],[7,6]]
	},
	"c3": {
		size:[12,8],
		life:5,
		chance:0,
		initial:[[4,0],[5,0],[6,0],[7,0],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[0,3],[1,3],[2,3],[5,3],[6,3],[9,3],[10,3],[11,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[2,5],[3,5],[4,5],[7,5],[8,5],[9,5],[1,6],[2,6],[5,6],[6,6],[9,6],[10,6],[2,7],[3,7],[8,7],[9,7]],
		variation:[[2,5],[9,5],[1,6],[3,6],[8,6],[10,6],[0,7],[1,7],[2,7],[3,7],[8,7],[9,7],[10,7],[11,7]],
		death:[[0,0],[3,0],[7,0],[10,0],[1,1],[4,1],[6,1],[9,1],[2,2],[8,2],[0,3],[10,3],[2,4],[8,4],[1,5],[4,5],[6,5],[9,5],[0,6],[3,6],[7,6],[10,6]]
	},
	"cannon": {
		size:[11,7],
		life:2,
		initial:[[5,0],[4,1],[5,1],[6,1],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6]],
		variation:[],
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
		step:5,
		animation: {
			sDelay:2,
			sCount:2,
			mDelay:5,
			mCount:5
		},
		enemies: [
			{kind:"c1",pos:[73,23]},
			{kind:"c1",pos:[61,23]},
			{kind:"c1",pos:[49,23]},
			{kind:"c1",pos:[37,23]},
			{kind:"c1",pos:[25,23]},
			{kind:"c1",pos:[13,23]},
			{kind:"c1",pos:[1,23]},
			{kind:"c1",pos:[73,11]},
			{kind:"c1",pos:[61,11]},
			{kind:"c1",pos:[49,11]},
			{kind:"c1",pos:[37,11]},
			{kind:"c1",pos:[25,11]},
			{kind:"c1",pos:[13,11]},
			{kind:"c1",pos:[1,11]},
			{kind:"c1",pos:[73,0]},
			{kind:"c1",pos:[61,0]},
			{kind:"c1",pos:[49,0]},
			{kind:"c1",pos:[37,0]},
			{kind:"c1",pos:[25,0]},
			{kind:"c1",pos:[13,0]},
			{kind:"c1",pos:[1,0]}
		]
	},
	1: {
		speed: 50,
		step:6,
		animation: {
			sDelay:2,
			sCount:2,
			mDelay:5,
			mCount:5
		},
		enemies: [
			{kind:"c2",pos:[74,35]},
			{kind:"c2",pos:[65,35]},
			{kind:"c2",pos:[56,35]},
			{kind:"c2",pos:[47,35]},
			{kind:"c2",pos:[38,35]},
			{kind:"c2",pos:[29,35]},
			{kind:"c2",pos:[20,35]},
			{kind:"c2",pos:[11,35]},
			{kind:"c2",pos:[2,35]},
			{kind:"c1",pos:[73,23]},
			{kind:"c1",pos:[61,23]},
			{kind:"c1",pos:[49,23]},
			{kind:"c1",pos:[37,23]},
			{kind:"c1",pos:[25,23]},
			{kind:"c1",pos:[13,23]},
			{kind:"c1",pos:[1,23]},
			{kind:"c1",pos:[73,11]},
			{kind:"c1",pos:[61,11]},
			{kind:"c1",pos:[49,11]},
			{kind:"c1",pos:[37,11]},
			{kind:"c1",pos:[25,11]},
			{kind:"c1",pos:[13,11]},
			{kind:"c1",pos:[1,11]},
			{kind:"c1",pos:[73,0]},
			{kind:"c1",pos:[61,0]},
			{kind:"c1",pos:[49,0]},
			{kind:"c1",pos:[37,0]},
			{kind:"c1",pos:[25,0]},
			{kind:"c1",pos:[13,0]},
			{kind:"c1",pos:[1,0]}
		]
	},
	2: {
		speed: 50,
		step:7,
		animation: {
			sDelay:2,
			sCount:2,
			mDelay:5,
			mCount:5
		},
		enemies: [
			{kind:"c3",pos:[68,35]},
			{kind:"c3",pos:[55,35]},
			{kind:"c3",pos:[42,35]},
			{kind:"c3",pos:[29,35]},
			{kind:"c3",pos:[16,35]},
			{kind:"c3",pos:[3,35]},
			{kind:"c2",pos:[74,23]},
			{kind:"c2",pos:[65,23]},
			{kind:"c2",pos:[56,23]},
			{kind:"c2",pos:[47,23]},
			{kind:"c2",pos:[38,23]},
			{kind:"c2",pos:[29,23]},
			{kind:"c2",pos:[20,23]},
			{kind:"c2",pos:[11,23]},
			{kind:"c2",pos:[2,23]},
			{kind:"c1",pos:[73,11]},
			{kind:"c1",pos:[61,11]},
			{kind:"c1",pos:[49,11]},
			{kind:"c1",pos:[37,11]},
			{kind:"c1",pos:[25,11]},
			{kind:"c1",pos:[13,11]},
			{kind:"c1",pos:[1,11]},
			{kind:"c1",pos:[73,0]},
			{kind:"c1",pos:[61,0]},
			{kind:"c1",pos:[49,0]},
			{kind:"c1",pos:[37,0]},
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
