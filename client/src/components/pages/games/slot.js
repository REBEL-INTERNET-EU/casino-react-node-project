import React from 'react';
import $ from 'jquery'; 
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {slot_calculate_money, slot_get_history} from '../../actions/actions'
import {connect} from 'react-redux'
import { bigText, showResults } from '../../utils';

import item_image from '../../img/icons/vegetables_color.png'

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
var results_array = [];
var slot_type = "";
var reel = [];
var ctx;
var socket;
var user_info;

function slot_game(props, id){
	var self = this;
	var slot_id = "#"+id;
	this.lang = props.lang;
	this.state = 0;
	this.images = [];
	this.images_pos = [];
	this.images_set = [];
    this.offset = [];
	var suffle_array = [];
	var win = [];
	this.lastUpdate = new Date();
	var now = new Date();
	slot_type = props.type;	
	var reason = "";
	const dispatch = props.dispatch;
	var game_pay = 0;

	user_info = {money: props.money};	
	if(props.slot !== -1){
		user_info = props.slot[0];			
	}
	if($('#user_money').length>0 && $('#user_money span').length>0){
		$('#user_money span').text(user_info.money);
	}	
		
	this.ready = function(r){
		reason = r;
		self.fit();
		self.choose_slot_type();
		var payload = {id: props.user_id, reel:reel.length, items:items.length, reason: reason}		
		socket.emit('slots_send', payload);
		socket.on('slots_read', function(data){				
			suffle_array = data[0];
			win = data[1];
			self.start(reason);
		});
	}

	this.choose_slot_type = function(){
		switch(slot_type) {
			case 'type1':
				if($('#slot_machine').length>0){
					$('#slot_machine').addClass('color_5');
				}
				reel = self.get_reel(5);
			  	break;
			case 'type2':
				if($('#slot_machine').length>0){
					$('#slot_machine').addClass('color_3');
				}
				reel = self.get_reel(5);
			  	break;
			default: 
				if($('#slot_machine').length>0){
					$('#slot_machine').addClass('color_5');
				}
				reel = self.get_reel(5);
		  }
		
	}

	this.get_reel = function(t){
		if(reason !== "resize"){
			if($(slot_id+' .slot_machine .box').length === 0){
				for(var i=0; i<t; i++){
					$(slot_id+' .slot_machine').append('<div class="box"><canvas class="slot_canvas" id="slot_canvas'+i+'"></canvas></div>');
				}
				reel = [];
				$(slot_id+' .slot_canvas').each(function(x, y){
					reel.push($(this))
				});
			}
		}
		return reel;
	}

	this.start = function(reason){
		$('body').off('click', '#slot_spin').on('click', '#slot_spin', function () {
			if($('#slot_bet').val() !== '0'){
				game_pay = parseInt($('#slot_bet').val())
				dispatch_nr = 0;		
				self.spin(spin_time, slot_speed);
			} else {
				if(self.lang === "ro"){
					showResults("Eroare", "Ceva s-a intamplat. Va rog restartati jocul!");
				} else {
					showResults("Error", "Something went wrong. Please restart the game!");
				}
			}			
		})
		$('body').off('click', '#slot_rules').on('click', '#slot_rules', function () {
			if(self.lang === "ro"){
				var text = bigText("slot_rules", self.lang);
				showResults("Reguli", text, 600);
			} else {      
				var pay_table = `
					<h1>Pay table</h1>
					<div id="pay_table" class="rules_box">
						<table>
							<thead>
								<tr>
									<th>Matrix</th>
									<th>Pay</th>
								</tr>
							</thead>
							<tbody class="pay_table_info"></tbody>	
						</table>
					</div>
				`;
				var text = bigText("slot_rules", self.lang, pay_table);
				showResults("Rules", text, 400);
				for(var i in win){
					var my_matrix = win[i].matrix;
					var my_prize = win[i].prize;
					$('.pay_table_info').append("<tr><td id='pay_table_info_"+i+"' class='pay_table_matrix'></td><td class='pay_table_prize'>"+my_prize+"</td></tr>");
					$('#pay_table_info_'+i).append("<div class='my_matrix'></div>");
					
					var x = -1;
					for(var j=0; j<3; j++){
						for(var k=0; k<5; k++){
							x++;
							if(x>4){ x=0 }
							if(my_matrix[x][0] === j && my_matrix[x][1] === k){
								$('#pay_table_info_'+i+' .my_matrix').append("<div class='color' x='"+j+"' y='"+k+"'></div>");
							} else {
								$('#pay_table_info_'+i+' .my_matrix').append("<div x='"+j+"' y='"+k+"'></div>");
							}											
						}
					}
				}				
			}
		})

		if(reason !== "resize"){
			var promises = [];
			for(var i in items){				
				promises.push(self.preaload_images(items[i]));
			}

			Promise.all(promises).then(function(result){
				self.images = result;	
				slots_canvas = [];
				$('.slot_machine .slot_canvas').css('width', image_size[0]);
				$('.slot_machine .slot_canvas').css('height', 2 * items.length * image_size[1]);
				$('#slot_canvas_results').css('width', image_size[0]*reel.length)	
				for(var i in reel){	
					self.images = self.create_suffle(i, self.images);
					self.offset.push(0);
					slots_canvas.push(reel[i][0]);
					self.createCanvas(slots_canvas[slots_canvas.length-1]);					
					self.draw_reel(slots_canvas[slots_canvas.length-1], self.images, reason);
				}
			});	
		} else {
			slots_canvas = [];
			$('.slot_machine .slot_canvas').css('width', image_size[0]);
			$('.slot_machine .slot_canvas').css('height', 2 * items.length * image_size[1]);
			$('#slot_canvas_results').css('width', image_size[0]*reel.length)		
			for(var i in reel){
				slots_canvas.push(reel[i][0]);
				self.createCanvas(slots_canvas[slots_canvas.length-1]);
				self.draw_reel(slots_canvas[slots_canvas.length-1], self.images_pos[i], reason);
			}
		}

		self.createResultsArray();
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
		for(var i in reel){
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

		canvas_height = canvas.height;		
		canvas.height = canvas_height;

		var canvas_lines = $('#slot_machine_lines')[0];
		canvas_lines.width = image_size[0] * $('.slot_machine .slot_canvas').length;
		canvas_lines.height = 3 * image_size[1];
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
			elem = {i:i + length, img:img, pos:(i + length) * canvas.width}
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
		if(reason !== "resize"){
			self.images_pos.push(array)
		}		
	}

	this.rotate = function(i, slot_speed){
		self.offset[i] = self.offset[i] - slot_speed;
		var max_height = -(reel[i][0].height - items.length * image_size[1])
		if(self.offset[i] < max_height){
			self.offset[i] = 0;
		}
		reel[i].css('transform', 'translate(0px, '+self.offset[i]+'px)')
	}

	this.reset = function(){
		self.running = true;
		self.state = 0;
		self.stopped = [];
		slot_speed = [];
		for(var i in reel){
			self.stopped.push(false);
			slot_speed.push(speed)
		}
		var canvas_lines = $('#slot_machine_lines')[0];
		var ctx_lines = canvas_lines.getContext("2d");
		ctx_lines.clearRect(0, 0, canvas_lines.width, canvas_lines.height);
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
				self.drawResultsArray(result);		
			}
		}
		
		spin_slot();
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
		}
		for(var i in reel){
			self.rotate(i, slot_speed[i]);
		}
		for(var i in reel){
			if(slot_speed[i] === 0){
				if(self.offset[i]%100 !== 0){
					self.running = true;
					self.rotate(i, 10);
				}
			}
		}
	}

	this.win_lose = function(results){
		var same = true;
		var my_matrix = [];
		var win_results = [];
		var t = -1;
		for(var i in win){	
			if(win[i].matrix.length !== 0){
				my_matrix = win[i].matrix;
				same = true;
				for(var j=0; j<my_matrix.length-1; j++){
					var x1 = my_matrix[j][0];
					var y1 = my_matrix[j][1];
					var x2 = my_matrix[j+1][0];
					var y2 = my_matrix[j+1][1];
					var my_veggy = results[x1][y1].img.id === "carrot" || results[x2][y2].img.id === "carrot" || results[x1][y1].img.id === "potato" || results[x2][y2].img.id === "potato"					
					if(results[x1][y1].img.id === results[x2][y2].img.id || my_veggy){
						win_results = my_matrix;
						t = i;
					} else {
						same = false;
						win_results = [];
						break;
					}
				}
			}
		}
		
		return [same, win_results, results, t];
	}

	this.get_results_pos = function(){
		var results = [];
		var result_offset = self.offset
		for(var t=0; t<3; t++){
			var result = [];
			for(var i in result_offset){
				for(var j in self.images_pos[i]){
					if(self.images_pos[i][j].pos === -result_offset[i]){
						result.push(self.images_pos[i][j]);	
					}
				}
			}
			results.push(result);
		}
		return results;
	}

	this.createResultsArray = function(){
		results_array = [];
		for(var j=0; j<3; j++){
			for(var i=0; i<reel.length; i++){
				var elem = {i:i, j:j, x:image_size[0]*i, y:image_size[1]*j};
				results_array.push(elem)
			}
		}
    }

	this.drawResultsArray = function(result){
		var canvas = $('#slot_machine_lines')[0];
		ctx = canvas.getContext("2d");
		if(result[0]){
			ctx.beginPath();
			ctx.moveTo(image_size[0]/2, image_size[1]/2);
			ctx.strokeStyle = "red";
			ctx.lineWidth = 5;

			for(var i=1; i<result[1].length; i++){				
				ctx.lineTo(result[1][i][1] * image_size[1] + image_size[1]/2, result[1][i][0] * image_size[1] + image_size[1]/2);
			}
			ctx.stroke();
			ctx.closePath();

			for(var i=0; i<result[1].length; i++){	
			 	draw_dot(canvas, result[1][i][1] * image_size[1] + image_size[1]/2, result[1][i][0] * image_size[1] + image_size[1]/2, 8, 0, 2 * Math.PI, false, 'red', 1, 'red');
			}

			self.pay(game_pay, true);
			
		} else {
			self.pay(game_pay, false);
		}

		var slot_payload_server = {
			user_id: props.user_id,
			user: props.user, 
			user_table: props.user_table, 
			user_type: props.type,
			money: user_info.money
		}		
		socket.emit('slot_results_send', slot_payload_server);
    }

	this.pay = function(pay, win){
		if(win){
			user_info.money = user_info.money + pay;
		} else {
			user_info.money = user_info.money - pay;
		}
		
		dispatch(slot_calculate_money(user_info.money));
		if($('span#money_total')){console.log(win, user_info.money, $('#user_money'))
			$('span#money_total').text(user_info.money);
		}

		if(win){
			if(self.lang === "ro"){
				showResults("Results", "Ai castigat " + game_pay + "morcovi");
			} else {
				showResults("Results", "You won " + game_pay + "carrots!");
			}
		} else {
			if(self.lang === "ro"){
				showResults("Results", "Ai pierdut " + game_pay + "morcovi");
			} else {
				showResults("Results", "You lost " + game_pay + "carrots!");
			}
		}		
	}
}

function sort_array(list_element, sort_by) {
	if(typeof sort_by == "undefined"){
		sort_by = ""
	}
	var tmp;
	var done = false;
	switch (sort_by) {
		case "i":
			done = false;
			while (!done) {
				done = true;
				for (var i = 1; i < list_element.length; i += 1) {
					if (list_element[i - 1].i > list_element[i].i) {
						done = false;
						tmp = list_element[i - 1];
						list_element[i - 1] = list_element[i];
						list_element[i] = tmp;
					} 
				}
			}
		  break;            
		  case "":
			done = false;
			while (!done) {
				done = true;
				for (var i = 1; i < list_element.length; i += 1) {
					if (parseFloat(list_element[i - 1]) > parseFloat(list_element[i])) {
						done = false;
						tmp = list_element[i - 1];
						list_element[i - 1] = list_element[i];
						list_element[i] = tmp;
					}
				}
			}                
		  break;            
	}        
  
	return list_element;
}

function draw_dot(canvas, x, y, r,sAngle,eAngle,counterclockwise, fillStyle, lineWidth, strokeStyle){
	ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
	ctx.fillStyle = fillStyle;
	if(strokeStyle !== ""){
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = strokeStyle;
		ctx.stroke();
	}		
	ctx.fill();
	ctx.closePath();
}

function Slot(props) {	
	socket = props.socket;
	var lang = props.lang;
	var money = props.money;	

	setTimeout(function(){ 
		$('.full-height').attr('id', 'slots')		
		my_slot = new slot_game(props, "slot_machine");
		my_slot.ready();		
		$(window).resize(function(){
			my_slot.ready("resize");	
		});
	}, 0);

	function handleChange(e){
		var bet = e.target.value;		
		if($('#money_total').length>0){
			$('#money_total').text(money-bet);
		}
	}
	
	
	return (
		<div id="slot_machine">
			<div className="slot_header_container">
				<div className="slot_header">
					{lang === "ro" ? <h1>Pacanele</h1> : <h1>Slots Machine</h1>}	
					{lang === "ro" ? <h3>Joaca si castiga</h3> : <h3>Play and Win</h3>}
				</div>
			</div>
			<div className="slot_machine_container">
				<div className="slot_machine">
					<canvas id="slot_machine_lines"></canvas>
				</div>
			</div>
			<div className="slot_buttons_container">
				<div className="slot_buttons">
					<Row>
						<Col className="slot_buttons_box" sm={5}>
							{lang === "ro" ? 
								<p className="slot_buttons_box_cell slot_buttons_box_text">Ai: <span id="money_total">{money-1}</span> morcovi</p> : 
								<p className="slot_buttons_box_cell slot_buttons_box_text">You have: <span id="money_total">{money-1}</span> carrots</p>
							}
						</Col>
						<Col className="slot_buttons_box" sm={5}>
							{lang === "ro" ? 
								<p className="slot_buttons_box_text">PARIAZA</p> : 
								<p className="slot_buttons_box_text">BET</p>
							}
							<input onChange={(e) => {handleChange(e)}} className="slot_input" type="number" id="slot_bet" min="1" defaultValue="1" max={money}></input>
						</Col>
						<Col sm={2} className="slot_spin_container">
							<button className="slot_spin shadow_convex" id="slot_spin">SPIN</button>
						</Col>
					</Row>
				</div>
			</div>
			{lang === "ro" ? 
				<p id="slot_rules">Click aici pentru a vedea regulile</p> : 
				<p id="slot_rules">Click here to see rules</p>
			}
			<div className="show_results_container">
				<div className="show_results">
					<h1></h1>
					<p></p>
				</div>
			</div>
		</div>
	);
}

function mapStateToProps(state) {	
	return { ...state }
}

export default connect(mapStateToProps)(Slot)