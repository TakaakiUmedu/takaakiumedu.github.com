/*
decoration.js Ver. 0.9 <https://github.com/TakaakiUmedu/decoration.js>
Copyright (C) 2013 Takaaki Umedu

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    at <https://github.com/TakaakiUmedu/decoration.js/blob/master/LICENSE>.
    If not, see <http://www.gnu.org/licenses/>.
*/

/*

For more information, see <https://github.com/TakaakiUmedu/decoration.js>.

*/

(function(){
	var DEBUG = false;
	
	var DEFAULT_INTERVAL = 100;
	
	var DecorationBase = {
		name: "decoration base",
		set_position: function(){
			this.canvas.style.top = (this.target.offsetTop + this.target.clientTop) + "px";
			this.canvas.style.left = (this.target.offsetLeft + this.target.clientLeft)+ "px";
			this.canvas.width = this.target.clientWidth;
			this.canvas.height = this.target.clientHeight;
			this.canvas.style.width = this.target.clientWidth + "px";
			this.canvas.style.height = this.target.clientHeight + "px"
		},
		start_draw_task: function(){
			try{
				debug_output(this.name + " starting");
				this.target.parentNode.insertBefore(this.canvas, this.target.nextSibling);
				if(this.initialize){
					this.set_position();
					this.initialize();
				}
				this.time = new Date();
				var decoration = this;
				function draw_task(){
					try{
						decoration.set_position();
						var time = new Date();
						decoration.draw(time - decoration.time);
						decoration.time = time;
						setTimeout(draw_task, decoration.param.interval);
					}catch(e){
						debug_output(e.message);
						throw e;
					}
				}
				draw_task();
				debug_output(this.name + " started");
			}catch(e){
				if(DEBUG){
					alert(e.message);
				}	
				debug_output(e.message);
				throw e;
			}
		}
	}
	var FilterDecorationBase = {
		name: "filter decoration base",
		draw: function(interval){
			var changed;
			
			if(this.w != this.canvas.width || this.h != this.canvas.height){
				this.w = this.canvas.width;
				this.h = this.canvas.height;
				if(!this.w || !this.h){
					return;
				}
				this.context.clearRect(0, 0, this.w, this.h);
				this.context.drawImage(this.target, 0, 0, this.w, this.h);
				this.image_src = this.context.getImageData(0, 0, this.w, this.h);
				this.image_buf = this.context.createImageData(this.image_src);
				changed = true;
			}else{
				changed = false;
			}
			if(this.filter_draw(interval, changed)){
				this.context.clearRect(0, 0, this.w, this.h);
				this.context.putImageData(this.image_buf, 0, 0);
			}
		}
	}
	var TransformFilterDecorationBase = {
		name: "transform filter decoration base",
		filter_draw : function(interval, changed){
			if(this.initialize_transform){
				this.initialize_transform(interval, changed);
			}
			var p1 = 0;
			var pos = {x : 0, y : 0};
			var h = this.canvas.height;
			var w = this.canvas.width;
			for(var y = 0; y < h; y ++){
				for(var x = 0; x < w; x ++){
					this.transform(x, y, pos);
					var x2 = parseInt(pos.x);
					var y2 = parseInt(pos.y);
					var p2 = ((x2 < 0 ? 0 : (x2 < w ? x2 : w - 1)) + (y2 < 0 ? 0 : (y2 < h ? y2 : h - 1)) * w) * 4;
					this.image_buf.data[p1++] = this.image_src.data[p2++];
					this.image_buf.data[p1++] = this.image_src.data[p2++];
					this.image_buf.data[p1++] = this.image_src.data[p2++];
					this.image_buf.data[p1++] = this.image_src.data[p2];
				}
			}
			return true;
		}
	}
	
	var Decorations = {
		enforce: {
			name: "enforce",
			default_parameter: {
				x : 0.0,
				y : 0.0,
				min : 0.4,
				max : 0.7,
				width : 2,
				skip : 8,
				color : 'rgba(255,255,255,0.7)'
			},
			draw: function(){
				this.context.fillStyle = this.param.color;
				var w = this.canvas.width;
				var h = this.canvas.height
				this.context.clearRect(0, 0, w, h);
				var x = w / 2;
				var y = h / 2;
				w = x / Math.sqrt(0.5);
				h = y / Math.sqrt(0.5);
				var angle = 0;
				var width_r = to_radian(this.param.width);
				var skip_r = to_radian(this.param.skip);
				var round = to_radian(360);
				while(round > angle){
					var a = Math.random() * width_r / 2;
					var l = proportional_distribution(this.param.min, this.param.max);
					
					this.context.beginPath();
					this.context.moveTo(x + w * Math.sin(angle - a), y + h * Math.cos(angle - a));
					this.context.lineTo(x + w * Math.sin(angle + a), y + h * Math.cos(angle + a));
					this.context.lineTo(x + proportional_distribution(this.param.x * w, w * Math.sin(angle), l),y + proportional_distribution(this.param.y * h, h * Math.cos(angle), l));
					this.context.fill();
					
					angle += (Math.random() * skip_r);
				}
			}
		},
		rain: {
			name: "rain",
			default_parameter: {
				color: "rgba(255,255,255,1)",
				lineWidth : 0.001,
				min: 0.5,
				max: 1.0,
				count: 20,
				width: 0.01,
				angle: 0
			},
			draw: function(){
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.context.strokeStyle = this.param.color;
				var sin = Math.sin(to_radian(this.param.angle));
				var cos = Math.cos(to_radian(this.param.angle));
				this.context.lineWidth = this.canvas.width * this.param.lineWidth;
				for(var i = 0; i < this.param.count; i ++){
					var l = proportional_distribution(this.param.min, this.param.max) * this.canvas.height;
					var lx = l * sin;
					var ly = l * cos;
					var x = proportional_distribution(-lx, this.canvas.width);
					var y = proportional_distribution(-ly, this.canvas.height);
					this.context.beginPath();
					this.context.moveTo(x, y);
					this.context.lineTo(x + lx, y + ly);
					this.context.closePath();
					this.context.stroke();
				}
			}
		},
		snow:{
			name: "snow",
			default_parameter: {
				color: "rgba(255,255,255,1)",
				count : 200,
				min: 0.005,
				max: 0.015,
				dx : 0.030,
				time: 5,
				k: 5,
				interval : 33
			},
			set_particle_size : function(particle){
				particle.size = this.canvas.height * proportional_distribution(this.param.min, this.param.max, Math.pow(Math.random(), this.param.k));
				particle.dx = (this.canvas.width * proportional_distribution(-this.param.dx, this.param.dx) / 1000) * particle.size / (this.canvas.height * this.param.max);
				particle.dy = (this.canvas.height / (this.param.time * 1000)) * particle.size / (this.canvas.height * this.param.max);
			},
			initialize: function(){
				this.particles = [];
				for(var i = 0; i < this.param.count; i ++){
					var particle = {};
					this.set_particle_size(particle);
					particle.x = proportional_distribution(-particle.size, this.canvas.width + particle.size);
					particle.y = proportional_distribution(-particle.size, this.canvas.height + particle.size);
					this.particles.push(particle);
				}
			},
			draw: function(interval){
				this.context.fillStyle = this.param.color;
				for(var i = 0; i < this.param.count; i ++){
					var particle = this.particles[i];
					particle.y += particle.dy * interval;
					particle.x += particle.dx * interval;
					if(particle.y > this.canvas.height + particle.size){
						this.set_particle_size(particle);
						particle.y = -particle.size;
					}else if(particle.x < -particle.size){
						particle.x = this.canvas.width + particle.size;
					}else if(particle.x >= this.canvas.width + particle.size){
						particle.x = -particle.size;
					}
					this.context.beginPath();
					this.context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2, false);
					this.context.closePath();
					this.context.fill();
				}
			}
		},
		ripple: { // too heavy
			name: "ripple",
			default_parameter: {
				cycle : 0.5,
				count : 5,
				width : 0.02,
				interval : 33
			},
			initialize: function(){
				this.offset = 0;
			},
			initialize_transform: function(interval, changed){
				if(changed){
					var w = this.image_src.width;
					var h = this.image_src.height;
					this.lmax = Math.sqrt(w * w + h * h) / 2;
					this.ripple_width = this.lmax * this.param.width;
					this.w2 = w / 2;
					this.h2 = h / 2;
					this.angle_ratio = this.param.count * Math.PI;
				}
				this.offset += Math.PI * interval / (1000 * this.param.cycle);
			},
			transform: function(x, y, pos){
				var lx = x - this.w2;
				var ly = y - this.h2;
				var l = Math.sqrt(lx * lx + ly * ly);
				if(l > 0){
					var l2 = l + this.ripple_width * Math.sin(this.offset + l * this.angle_ratio / this.lmax);
					pos.x = lx * l2 / l + this.w2;
					pos.y = ly * l2 / l + this.h2;
				}else{
					pos.x = x;
					pos.y = y;
				}
			}
		},
		star: {
			name: "star",
			default_parameter: {
				count : 20,
				color : "rgba(255,0,255,0.7)",
				circle_color : "rgba(255,0,255,0.3)",
				size_min : 0.05,
				size_max : 0.2,
				width_ratio : 0.01,
				duration : 300,
				interval : 33,

				l_g_r0 : 0.0,
				l_g_a0 : 1.0,
				l_g_r1 : 0.5,
				l_g_a1 : 0.5,
				l_g_r2 : 1.0,
				l_g_a2 : 0.0,
				l_width : 0.01,
				l_s_ratio : 0.3,
					
				c_g_r1 : 0.1,
				c_g_r2 : 0.15,
				c_g_r3 : 0.40,
				c_g_a0 : 1.0,
				c_g_a1 : 0.2
			},
			new_star : function(){
				return {
					duration : this.param.duration * Math.random(),
					x : this.canvas.width * Math.random(),
					y : this.canvas.height * Math.random(),
					size : this.canvas.width * proportional_distribution(this.param.size_min, this.param.size_max)
				};
			},
			initialize: function(){
				this.stars = [];
				for(var i = 0; i < this.param.count; i ++){
					this.stars[i] = this.new_star();
				}
			},
			draw: function(interval){
				for(var i = 0; i < this.stars.length; i ++){
					var star = this.stars[i];
					star.duration -= interval;
					if(star.duration < 0){
						this.stars[i] = star = this.new_star();
					}
					var alpha = star.duration / this.param.duration;
					
					var grad = this.context.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size);
					grad.addColorStop(this.param.l_g_r0, 'rgba(255,255,255,' + f_to_s(this.param.l_g_a0 * alpha) + ')');
					grad.addColorStop(this.param.l_g_r1, 'rgba(255,255,255,' + f_to_s(this.param.l_g_a1 * alpha) + ')');
					grad.addColorStop(this.param.l_g_r2, 'rgba(255,255,255,' + f_to_s(this.param.l_g_a2 * alpha) + ')');
					this.context.fillStyle = grad;
					this.context.beginPath();
					this.context.moveTo(star.x, star.y - star.size);
					this.context.lineTo(star.x + star.size * this.param.l_width, star.y - star.size * this.param.l_width);
					this.context.lineTo(star.x + star.size, star.y);
					this.context.lineTo(star.x + star.size * this.param.l_width, star.y + star.size * this.param.l_width);
					this.context.lineTo(star.x, star.y + star.size);
					this.context.lineTo(star.x - star.size * this.param.l_width, star.y + star.size * this.param.l_width);
					this.context.lineTo(star.x - star.size, star.y);
					this.context.lineTo(star.x - star.size * this.param.l_width, star.y - star.size * this.param.l_width);
					this.context.moveTo(star.x, star.y - star.size);
					this.context.closePath();
					this.context.fill();

					var size_s = star.size * this.param.l_s_ratio;
					var grad = this.context.createRadialGradient(star.x, star.y, 0, star.x, star.y, size_s);
					grad.addColorStop(this.param.l_g_r0, 'rgba(255,255,255,' + f_to_s(this.param.l_g_a0 * alpha) + ')');
					grad.addColorStop(this.param.l_g_r1, 'rgba(255,255,255,' + f_to_s(this.param.l_g_a1 * alpha) + ')');
					grad.addColorStop(this.param.l_g_r2, 'rgba(255,255,255,' + f_to_s(this.param.l_g_a2 * alpha) + ')');
					this.context.fillStyle = grad;
					this.context.beginPath();
					this.context.moveTo(star.x - size_s, star.y - size_s);
					this.context.lineTo(star.x, star.y - size_s  * this.param.l_width);
					this.context.lineTo(star.x + size_s, star.y - size_s);
					this.context.lineTo(star.x + size_s  * this.param.l_width, star.y);
					this.context.lineTo(star.x + size_s, star.y + size_s);
					this.context.lineTo(star.x, star.y + size_s  * this.param.l_width);
					this.context.lineTo(star.x - size_s, star.y + size_s);
					this.context.lineTo(star.x - size_s  * this.param.l_width, star.y);
					this.context.moveTo(star.x - size_s, star.y - size_s);
					this.context.closePath();
					this.context.fill();

					
					var r1 = star.size * this.param.c_g_r2;
					var r2 = star.size * this.param.c_g_r3;
					
					var grad = this.context.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size);
					grad.addColorStop(0,                                           'rgba(255,255,255,' + f_to_s(this.param.c_g_a0 * alpha) + ')');
					grad.addColorStop(this.param.c_g_r1,                           'rgba(255,255,255,0.0)');
					grad.addColorStop(this.param.c_g_r2,                           'rgba(255,255,255,0.0)');
					grad.addColorStop((this.param.c_g_r2 + this.param.c_g_r3) / 2, 'rgba(255,255,255,' + f_to_s(this.param.c_g_a1 * alpha) + ')');
					grad.addColorStop(this.param.c_g_r3,                           'rgba(255,255,255,0.0)');
					this.context.fillStyle = grad;
					
					this.context.beginPath();
					this.context.arc(star.x, star.y, r2, 0, Math.PI * 2, false);
					this.context.closePath();
					this.context.fill();
					
				}
			}
		}
	}
	
	function f_to_s(value){
		return parseInt(value * 1000) / 1000.0;
	}
	
	var decorated = false;
	function to_radian(a){
		return a * Math.PI / 180;
	}
	function proportional_distribution(a, b, r){
		if(r){
			return a + (b - a) * r;
		}else{
			return a + (b - a) * Math.random();
		}
	}
	
	
	function count_parenthesises(str){
		return str.split("(").length - str.split(")").length;
	}
	
	
	function parse_param(param_str){
		var param = [];
		var str = param_str;
		while(str.length > 0){
			if(str.match(/^([a-zA-Z_][a-zA-Z0-9_]*):([^,]+)(,|$)/)){
				var name = RegExp.$1;
				var value = RegExp.$2;
				str = RegExp.rightContext;
				var p_count = count_parenthesises(value);
				while(p_count > 0){
					if(str.match(/^(.*\)[^,]*)(,|$)/)){
						value += "," + RegExp.$1;
						str = RegExp.rightContext;
						p_count = count_parenthesises(value);
					}else{
						throw new Error("parse error : \"" + param_str + "\"");
					}
				}
				param[name] = value;
			}else{
				throw new Error("parse error : \"" + param_str + "\"");
			}
		}
		return param;
	}
	
	function get_decoration_list(item){
		var list = [];
		if(item.className){
			var classNames = item.className.split(/\s+/);
			var regexp = /^DECORATION\.([^ ]+)$/g;
			for(var j = 0; j < classNames.length; j ++){
				if(classNames[j].match(regexp)){
					var option = RegExp.$1;
					if(option.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\((.*)\))?$/)){
						var name = RegExp.$1;
						var param = parse_param(RegExp.$2);
						list.push([name, param]);
					}else{
						throw new Error("function error : \"" + option + "\"");
					}
				}
			}
		}
		return list;
	}
	
	function decorate_all(){
		if(decorated){
			return;
		}
		decorated = true;
		var items = document.getElementsByTagName("img");
		for(var i = 0; i < items.length; i ++){
			try{
				var item = items[i];
				if(item.className){
					var classNames = item.className.split(/\s+/);
					var regexp = /^DECORATION\.([^ ]+)$/g;
					for(var j = 0; j < classNames.length; j ++){
						if(classNames[j].match(regexp)){
							var option = RegExp.$1;
							if(option.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\((.*)\))?$/)){
								var name = RegExp.$1;
								var param = parse_param(RegExp.$2);
								apply(item, name, param);
							}else{
								throw new Error("function error : \"" + option + "\"");
							}
						}
					}
				}
			}catch(e){
				debug_output(e.message);
			}
		}
	}
	function apply(target, name, option){
		if(typeof(target) == "String"){
			target = document.getElementById(target);
		}
		if(name){
			if(!option){
				option = new Object();
			}
			apply_one(target, name, option);
		}else{
			var list = get_decoration_list(target);
			for(var i = 0; i < list.length; i ++){
				apply_one(target, list[0][0], list[0][1]);
			}
		}
	}
	
	function apply_one(target, name, option){
		if(target){
			var decoration_class = Decorations[name];
			if(decoration_class){
				var canvas = document.createElement('canvas');
				canvas.style.margin = "0px";
				canvas.style.padding = "0px";
				canvas.style.borderWidth = "0px";
				canvas.style.position = 'absolute';
				canvas.style.zIndex = target.style.zIndex + 1;

				// create parameter table
				var param = new Object();
				// copy default parameters, if exists
				if(decoration_class.default_parameter){
					for(var name in decoration_class.default_parameter){
						param[name] = decoration_class.default_parameter[name];
					}
				}
				// add options, if specified
				if(option){
					if(typeof(option) == "String"){
						option = parse_param(option);
					}
					for(var name in option){
						var type = typeof(decoration_class.default_parameter[name]);
						if(type == "number"){
							param[name] = parseFloat(option[name]);
						}else{
							param[name] = option[name];
						}
					}
				}
				// if interval parameter is not set, initialize by default
				if(!param.interval){
					param.interval = DEFAULT_INTERVAL;
				}
				
				// create decoration object, BY HAND
				var decoration = {
					target: target,
					canvas: canvas,
					context: canvas.getContext('2d'),
					param: param,
				};
				// copy basic member methods to the decoration object, BY HAND
				for(var func in DecorationBase){
					decoration[func] = DecorationBase[func];
				}
				// copy member methods of the decoration class to the decoration object, BY HAND
				for(var name in decoration_class){
					decoration[name] = decoration_class[name];
				}
				// if "transform" is specified instead of "draw", append "filter_draw" method of TransformFilterDecorationBase class(?)
				if(decoration.transform){
					decoration.filter_draw = TransformFilterDecorationBase.filter_draw;
				}
				// if "filter_draw" is specified instead of "draw", replace "draw" method by that of FilterDecorationBase class(?)
				if(decoration.filter_draw){
					decoration.draw = FilterDecorationBase.draw;
				}

				// start draw task after target loaded
				if(target.readyState == "complete" || target.complete){
					debug_output(decoration.name + " started directory : \"" + target.readyState + "\"");
					decoration.start_draw_task();
				}else{
					debug_output(decoration.name + " reserved to be started : \"" + target.readyState + "\"");
					
					// On IE, occasionally event handlers seems to be cleared by unknown reasons, as follows.
					//     set "load" event handler with readyState = "loading"
					//  -> event handlers are cleared (?)
					//  -> loading process progressing
					// Since the author cannot recognize what is going on, he adopted the polling process to avoid the trouble.
					if(navigator && navigator.userAgent && navigator.userAgent.match(/MSIE ([0-9]+)/)){
						function poll(){
							debug_output(decoration.name + " polling state : \"" + target.readyState + "\"");
							if(target.readyState == "complete"){
								decoration.start_draw_task();
							}else{
								setTimeout(poll, 10);
							}
						}
						poll();
						// target.addEventListener("readystatechange", function(e){ debug_output(decoration.name + " state changed to: " + target.readyState);}, false); // for debug
					}else{
						target.addEventListener("load", function(){
							decoration.start_draw_task();
						}, false);
					}
				}
			}
		}
	}
	
	// anyway, call "decorate_all" ASAP
	document.addEventListener("DOMContentLoaded", decorate_all, false);
	document.addEventListener("load", decorate_all, false);
	if(document.body && document.body.readyState == "complete"){
		decorate_all();
	}
	
	
	function debug_output(str){
		if(DEBUG){
			var p = document.createElement("p");
			p.appendChild(document.createTextNode(str));
			document.body.appendChild(p);
		}
	}
	function set_debug_mode(flag){
		DEBUG = flag;
	}
	
	// only when "DECORATION" has not defined yet by the previously loaded scripts, define "DECORATION" object.
	if(typeof(DECORATION) == "undefined"){
		DECORATION = {
			set_debug_mode: set_debug_mode,
			apply: apply
		}
	}
})();
