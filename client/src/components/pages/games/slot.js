import React from 'react';
import $ from 'jquery'; 
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {connect} from 'react-redux'
import item_image from '../../img/icons/vegetables_color.png'

var canvas_width = 200;
var canvas_height = 800;

var items = [
	{id: 'carrot', src: item_image, coord:[0, 0]},
	{id: 'onion', src: item_image, coord:[300, 0]},
	{id: 'potato', src: item_image, coord:[600, 0]},
	{id: 'radish', src: item_image, coord:[600, 300]},
	{id: 'cabbage', src: item_image, coord:[300, 600]},
	{id: 'garlic', src: item_image, coord:[600, 600]},
	{id: 'turnip', src: item_image, coord:[900, 900]},
];
var slots_canvas = [];
var slots_ctx = [];
var image_size = [100, 100]
var image_size_canvas = [290, 290, 5, 5, 80, 80];
var spin_time = 3000; // how long all slots spin before starting countdown
var spin_time_reel = spin_time/5 // how long each slot spins at minimum
var slot_speed = []; // how many pixels per second slots roll
var speed = 10;
var dispatch_nr = 0; //this prevents multiplication
var my_slot;

var ctx;
var socket;

function slot_game(props){
	var self = this;
	var lang = props.lang;
	this.reel = [$('#slot_canvas1'), $('#slot_canvas2'), $('#slot_canvas3'), $('#slot_canvas4'), $('#slot_canvas5')];	
	this.state = 0;
	this.images = [];
	this.images_pos = [];
	this.images_set = [];
    this.offset = [];
	var suffle_array = [];
	var win = [];
	this.lastUpdate = new Date();
	var now = new Date();
		
	this.ready = function(reason){
		self.fit();
		var payload = {id: props.user_id, reel:self.reel.length, items:items.length}		
		socket.emit('slots_send', payload);
		socket.on('slots_read', function(data){				
			suffle_array = data[0];
			win = data[1];
			self.start(reason);
		});
	}

	this.start = function(reason){
		$('body').off('click', '#slot_spin').on('click', '#slot_spin', function () {
			dispatch_nr = 0;		
			self.spin(spin_time, slot_speed);
		})

		if(reason != "resize"){
			var promises = [];
			for(var i in items){				
				promises.push(self.preaload_images(items[i]));
			}

			Promise.all(promises).then(function(result){
				self.images = result;	
				slots_canvas = [];
				$('.slot_machine canvas').css('width', image_size[0]);
				$('.slot_machine canvas').css('height', 2 * items.length * image_size[1]);		
				for(var i in self.reel){	
					self.images = self.create_suffle(i, self.images);
					self.offset.push(0);
					slots_canvas.push(self.reel[i][0]);
					self.createCanvas(slots_canvas[slots_canvas.length-1]);					
					self.draw_reel(slots_canvas[slots_canvas.length-1], self.images, reason);
				}
			});	
		} else {
			slots_canvas = [];
			$('.slot_machine canvas').css('width', image_size[0]);
			$('.slot_machine canvas').css('height', 2 * items.length * image_size[1]);		
			for(var i in self.reel){
				slots_canvas.push(self.reel[i][0]);
				self.createCanvas(slots_canvas[slots_canvas.length-1]);
				self.draw_reel(slots_canvas[slots_canvas.length-1], self.images_pos[i], reason);
			}
		}
	}

	this.fit = function(){
		speed = 10;
		image_size = [100, 100];
		image_size_canvas = [290, 290, 5, 5, 80, 80];
		slot_speed = [];
		if (window.innerWidth < 768){
			image_size = [50, 50];
			image_size_canvas = [290, 290, 3, 3, 40, 40];
			speed = 5;
		}
		for(var i in self.reel){
			slot_speed.push(speed)
		}	
	}

	this.create_suffle = function(i, images){
		var images01 = [];
		for(var j in suffle_array[i]){
			var t = suffle_array[i][j];
			images01.push(images[t]);
		}
		return images01;
	}

	this.preaload_images = function(item){
		return new Promise(function(resolve, reject){
			var image = new Image();
			image.id = item.id;
			image.src = item.src;
			image.setAttribute('coord_x', item.coord[0]);
			image.setAttribute('coord_y', item.coord[1]);
			image.addEventListener("load", function() {
				resolve(image)
			}, false);
		});
	}
	
	this.createCanvas = function(canvas){
		ctx = canvas.getContext("2d");
		slots_ctx.push(ctx)	
		
		canvas.width = image_size[0];
		canvas.height = 2 * items.length * image_size[1];

		canvas_width = canvas.width;
		canvas_height = canvas.height;		
		canvas.height = canvas_height;
    }

	this.draw_reel = function(canvas, assets, reason){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#ddd';
		var array = [];
		var length = assets.length;

		for (var i = 0 ; i < length ; i++) {			
			var img = assets[i];
			if(reason === "resize"){
				img = assets[i].img;
			}			
			ctx.fillRect(0, i * canvas.width, canvas.width, 2);
			ctx.fillRect(0, (i + length)  * canvas.width, canvas.width, 2);

			var sx = img.getAttribute( "coord_x" )
			var sy = img.getAttribute( "coord_y" )
			var swidth = image_size_canvas[0];
			var sheight = image_size_canvas[1];
			var x = image_size_canvas[2];
			var y = image_size_canvas[3]+i*image_size[1];
			var width = image_size_canvas[4];
			var height = image_size_canvas[5];
			ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
			ctx.drawImage(img, sx, sy, swidth, sheight, x, (i + length) * canvas.width, width, height);

			var elem = {i:i, img:img, pos:i * canvas.width}
			array.push(elem)	
			var elem = {i:i + length, img:img, pos:(i + length) * canvas.width}
			array.push(elem)		
		}

		// img - Specifies the image, canvas, or video element to use	 
		// sx - Optional. The x coordinate where to start clipping	
		// sy - Optional. The y coordinate where to start clipping	
		// swidth - Optional. The width of the clipped image	
		// sheight - Optional. The height of the clipped image	
		// x - The x coordinate where to place the image on the canvas	
		// y - The y coordinate where to place the image on the canvas	
		// width - Optional. The width of the image to use (stretch or reduce the image)	
		// height - Optional. The height of the image to use (stretch or reduce the image)

		array = sort_array(array, "i");
		if(reason != "resize"){
			self.images_pos.push(array)
		}		
	}

	this.rotate = function(i, slot_speed){
		self.offset[i] = self.offset[i] - slot_speed;
		var max_height = -(self.reel[i][0].height - items.length * image_size[1])
		if(self.offset[i] < max_height){
			self.offset[i] = 0;
		}
		self.reel[i].css('transform', 'translate(0px, '+self.offset[i]+'px)')
	}

	this.reset = function(){
		self.running = true;
		self.state = 0;
		self.stopped = [];
		slot_speed = [];
		for(var i in self.reel){
			self.stopped.push(false);
			slot_speed.push(speed)
		}
	}

	this.spin = function(){
		self.reset();
		dispatch_nr++
		var same = false;	
		var result;	
		var matrix_result;
		var pos;

		window.requestAnimFrame = (function(){
			return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
			  window.setTimeout(callback, 1000 / 60);
			};
	  	})();

	  	function spin_slot() {
			

			self.update(self.state);
			if(self.running){
				window.requestAnimFrame(spin_slot);
			} else {
				window.cancelAnimationFrame(spin_slot);
				result = self.win_lose(self.get_results_pos());
				same = result[0];
				matrix_result = result[1];
				pos = result[2];
				console.log('result', result)				
			}
		}

		if(dispatch_nr === 1){
			spin_slot();
		}	
	}

	this.update = function(state){
		now = new Date();
		function check_slot() {
			if ( now - self.lastUpdate > spin_time_reel ) {
				return true; // done
			}
			return false;
		}

		switch (state) {
			case 0: // all slots spinning
				if (now - self.lastUpdate > spin_time) {
					self.state = 1;
					self.lastUpdate = now;
				}
				break;
			case 6:
				self.running = false;
				break;
			default: //stop slots one after the other
				self.stopped[state-1] = check_slot();
				if (self.stopped[state-1]) {
					slot_speed[state-1] = 0;
					self.state++;
					self.lastUpdate = now;
				}
				break;			
		}
		for(var i in self.reel){
			self.rotate(i, slot_speed[i]);
		}
		for(var i in self.reel){
			if(slot_speed[i] == 0){
				if(self.offset[i]%100 !== 0){
					self.running = true;
					self.rotate(i, 10);
				}
			}
		}
	}

	this.win_lose = function(results){		
		var win_results = [];
		var same;
		var my_matrix = [];

		for(var i=0; i<3;i++){
			var array = [];
			for(var j=0; j<results.length; j++){
				var obj = {i:i, j:j, img:results[j][i].img.id}
				array.push(obj)
			}
			win_results.push(array)
		}
			
		for(var i in win){			
			if(win[i].matrix.length !== 0){
				var x = win[i].matrix[0][0];
				var y = win[i].matrix[0][1];
				var elem = win_results[x][y];
				for(var j=1; j<win[i].matrix.length; j++){
					same = true;	
					x = win[i].matrix[j][0];
					y = win[i].matrix[j][1];
					my_matrix = win[i].matrix;
					if (elem.img !== win_results[x][y].img) {
						same = false;
						my_matrix = [];				
						if(same){
							break;
						}
					}
				}
				
			}
		}
		
		return [same, my_matrix, results];
	}

	this.get_results_pos = function(){
		var results = [];
		for(var i in self.reel){
			for(var j in self.images_pos[i]){
				if(self.images_pos[i][j].pos === -self.offset[i]){
					var k = j-1;
					var result = [];
					for(var t=0; t<3; t++){	
						k++;
						if(k > self.images_pos[i].length-1 ){
							k = 0;
						}
						
						result.push(self.images_pos[i][k]);	
					}
					results.push(result);
				}
			}
		}
		return results;
	}
}

function show_results(message){
	$('.show_results_container').show();
	$('.show_results p').text(message);
	$( ".show_results_container" ).click(function() {
		$('.show_results_container').hide();
	});
}

function sort_array(list_element, sort_by) {
	if(typeof sort_by == "undefined"){
		sort_by = ""
	}
	switch (sort_by) {
		case "i":
			var done = false;
			while (!done) {
				done = true;
				for (var i = 1; i < list_element.length; i += 1) {
					if (list_element[i - 1].i > list_element[i].i) {
						done = false;
						var tmp = list_element[i - 1];
						list_element[i - 1] = list_element[i];
						list_element[i] = tmp;
					} 
				}
			}
		  break;            
		  case "":
			var done = false;
			while (!done) {
				done = true;
				for (var i = 1; i < list_element.length; i += 1) {
					if (parseFloat(list_element[i - 1]) > parseFloat(list_element[i])) {
						done = false;
						var tmp = list_element[i - 1];
						list_element[i - 1] = list_element[i];
						list_element[i] = tmp;
					}
				}
			}                
		  break;            
	}        
  
	return list_element;
}

function Slot(props) {	
	setTimeout(function(){ 
		$('.full-height').attr('id', 'slots')		
		my_slot = new slot_game(props);
		my_slot.ready();		
		$(window).resize(function(){
			my_slot.ready("resize");	
		});
	}, 0);
	
	socket = props.socket;
	var lang = props.lang;
	var money = props.money;	
	return (
		<>
			<p>Still under construction.</p>
			<div className="slot_header_container">
				<div className="slot_header">
					{lang === "ro" ? <h1>Pacanele</h1> : <h1>Slots Machine</h1>}	
					{lang === "ro" ? <h3>Joaca si castiga</h3> : <h3>Play and Win</h3>}
				</div>
			</div>
			<div className="slot_machine_container">
				<div className="slot_machine">
					<div className="box">
						<canvas id="slot_canvas1"></canvas>
					</div>
					<div className="box">
						<canvas id="slot_canvas2"></canvas>
					</div>
					<div className="box">
						<canvas id="slot_canvas3"></canvas>
					</div>
					<div className="box">
						<canvas id="slot_canvas4"></canvas>
					</div>
					<div className="box">
						<canvas id="slot_canvas5"></canvas>
					</div>
				</div>
			</div>
			<div className="slot_buttons_container">
				<div className="slot_buttons">
					<Row>
						<Col sm={5}>
							<p>Carrots</p>
							<input className="slot_input" type="number" id="slot_balance" min="1" defaultValue={money} max="5000"></input>
						</Col>
						<Col sm={5}>
							<p>BET</p>
							<input className="slot_input" type="number" id="slot_bet" min="1" defaultValue="1" max="3"></input>
						</Col>
						<Col sm={2} className="slot_spin_container">
							<button className="slot_spin shadow_convex" id="slot_spin">SPIN</button>
						</Col>
					</Row>
				</div>
			</div>
			<div className="show_results_container">
				<div className="show_results">
					<h1>{lang === "ro" ? <span>Rezultate</span> : <span>Results</span>}</h1>
					<p></p>
				</div>
			</div>
		</>
	);
}

function mapStateToProps(state) {	
	return { ...state }
}

export default connect(mapStateToProps)(Slot)