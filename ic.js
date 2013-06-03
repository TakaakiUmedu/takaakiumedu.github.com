/*
#
# Copyright 2013-2013 Takaaki Umedu. All rights reserved.
#
# Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
# 1.Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
# 2.Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY Takaaki Umedu ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Takaaki Umedu OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#
# The views and conclusions contained in the software and documentation are those of the authors and should not be interpreted as representing official policies, either expressed or implied, of Takaaki Umedu.
#
*/



var state = 0;

var canvas = null;
var context = null;

var CHIP_WIDTH = 50;
var CHIP_HEIGHT = 80;
var CHIP_LEFT = 20;
var CHIP_TOP = 20;
var CHIP_BORDER = 5;

var CHIP_PADDING = 10;

var CHIP_COUNT_X = 5;
var CHIP_COUNT_Y = 5;

var MASK1 = [[0, 0], [CHIP_WIDTH, 0], [CHIP_WIDTH, CHIP_HEIGHT], [0, CHIP_HEIGHT]];
var MASK2 = [[CHIP_WIDTH, 0], [CHIP_WIDTH * 3, 0], [CHIP_WIDTH * 3, CHIP_HEIGHT], [CHIP_WIDTH, CHIP_HEIGHT]];
var MASK3 = [[0, CHIP_HEIGHT], [CHIP_WIDTH * 3, CHIP_HEIGHT], [CHIP_WIDTH * 3, CHIP_HEIGHT * (2.5 - 0.2)], [0, CHIP_HEIGHT * (2.5 + 1.0)]];
var MASK4 = [[CHIP_WIDTH * 3, 0], [CHIP_WIDTH * 5, 0], [CHIP_WIDTH * 5, CHIP_HEIGHT * (2.5 - 1.0)], [CHIP_WIDTH * 3, CHIP_HEIGHT * (2.5 - 0.2)]];


var OUTPUT_X = CHIP_LEFT + CHIP_WIDTH * CHIP_COUNT_X + CHIP_WIDTH;
var OUTPUT_Y = CHIP_TOP + CHIP_HEIGHT * CHIP_COUNT_Y;
var OUTPUT_COUNT_X = 10;

var TMP1_X = CHIP_LEFT + CHIP_WIDTH * CHIP_COUNT_X;
var TMP1_Y = CHIP_TOP;

var TMP2_X = CHIP_LEFT + CHIP_WIDTH * CHIP_COUNT_X + CHIP_WIDTH;
var TMP2_Y = CHIP_TOP + CHIP_HEIGHT;

var TMP3_X = CHIP_LEFT + CHIP_WIDTH * CHIP_COUNT_X + CHIP_WIDTH * 2;
var TMP3_Y = CHIP_TOP;

var RETURN_OFFSET = CHIP_HEIGHT * (2.5 - 1.0) - CHIP_HEIGHT * (2.5 - 0.2) + CHIP_HEIGHT;

var turn = null;
var step = null;
var offset = null;

function progress(){
	switch(step){
	case null:
		var offsetting = document.getElementById("offsetting");
		if(offsetting.checked){
			offset = RETURN_OFFSET;
		}else{
			offset = 0;
		}
		offsetting.disabled = "disabled";
		turn = 0;
		step = 0;
	case 0:
		move_polygon(MASK1, CHIP_LEFT, CHIP_TOP + offset * turn, OUTPUT_X + (CHIP_WIDTH + CHIP_PADDING) * (turn % OUTPUT_COUNT_X), OUTPUT_Y + CHIP_HEIGHT * parseInt(turn / OUTPUT_COUNT_X) * 1.5);
		step ++;
		break;
	case 1:
		move_polygon(MASK2, CHIP_LEFT, CHIP_TOP + offset * turn, TMP1_X, TMP1_Y);
		step ++;
		break;
	case 2:
		move_polygon(MASK3, CHIP_LEFT, CHIP_TOP + offset * turn, TMP2_X, TMP2_Y);
		step ++;
		break;
	case 3:
		move_polygon(MASK4, CHIP_LEFT, CHIP_TOP + offset * turn, TMP3_X, TMP3_Y);
		step ++;
		break;
	case 4:
		move_polygon(MASK3, TMP2_X, TMP2_Y, CHIP_LEFT + CHIP_WIDTH * 2, CHIP_TOP - CHIP_HEIGHT + offset * (turn + 1));
		break;
	case 5:
		move_polygon(MASK4, TMP3_X, TMP3_Y, CHIP_LEFT - CHIP_WIDTH * 3, CHIP_TOP + CHIP_HEIGHT + offset * (turn + 1));
		step ++;
		break;
	case 6:
		move_polygon(MASK2, TMP1_X, TMP1_Y, CHIP_LEFT - CHIP_WIDTH, CHIP_TOP + offset * (turn + 1));
		step = 0;
		turn ++;
		break;
	}
	rasterize();
}


//	move_polygon(MASK3, CHIP_LEFT, CHIP_TOP, OUTPUT_X, OUTPUT_Y);


function move_polygon(polygon, ox, oy, dx, dy){
	context.save();

	context.beginPath();
	context.moveTo(dx + polygon[0][0], dy + polygon[0][1]);
	for(var i = 1; i < polygon.length; i ++){
		context.lineTo(dx + polygon[i][0], dy + polygon[i][1]);
	}
	context.closePath();
	context.clip();
	context.drawImage(canvas, dx - ox, dy - oy);
	
	context.restore();
	
	context.fillStyle = "rgb(255,255,255)";
	context.beginPath();
	context.moveTo(ox + polygon[0][0], oy + polygon[0][1]);
	for(var i = 1; i < polygon.length; i ++){
		context.lineTo(ox + polygon[i][0], oy + polygon[i][1]);
	}
	context.closePath();
	context.fill();
	
}

function rasterize(){
	var image_data = context.getImageData(0, 0, canvas.width, canvas.height);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.putImageData(image_data, 0, 0);
}

function start_draw(){
	
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	for(var x = 0; x < CHIP_COUNT_X; x ++){
		for(var y = 0; y < CHIP_COUNT_Y; y ++){
			context.fillStyle = "rgb(130,42,42)";
			context.beginPath();
			context.rect(CHIP_LEFT + CHIP_WIDTH * x, CHIP_TOP + CHIP_HEIGHT * y, CHIP_WIDTH, CHIP_HEIGHT);
			context.closePath();
			context.fill();

			context.fillStyle = "rgb(200,100,100)";
			context.beginPath();
			context.moveTo(CHIP_LEFT + CHIP_WIDTH * x,                             CHIP_TOP + CHIP_HEIGHT * y);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_WIDTH,                CHIP_TOP + CHIP_HEIGHT * y);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_WIDTH - CHIP_BORDER, CHIP_TOP + CHIP_HEIGHT * y + CHIP_BORDER);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_BORDER,              CHIP_TOP + CHIP_HEIGHT * y + CHIP_BORDER);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_BORDER,              CHIP_TOP + CHIP_HEIGHT * y + CHIP_HEIGHT - CHIP_BORDER);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x,                             CHIP_TOP + CHIP_HEIGHT * y + CHIP_HEIGHT);
			context.closePath();
			context.fill();

			context.fillStyle = "rgb(60,20,20)";
			context.beginPath();
			context.moveTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_WIDTH,               CHIP_TOP + CHIP_HEIGHT * y);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_WIDTH,               CHIP_TOP + CHIP_HEIGHT * y + CHIP_HEIGHT);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x,                            CHIP_TOP + CHIP_HEIGHT * y + CHIP_HEIGHT);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_BORDER,              CHIP_TOP + CHIP_HEIGHT * y + CHIP_HEIGHT - CHIP_BORDER);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_WIDTH - CHIP_BORDER, CHIP_TOP + CHIP_HEIGHT * y + CHIP_HEIGHT - CHIP_BORDER);
			context.lineTo(CHIP_LEFT + CHIP_WIDTH * x + CHIP_WIDTH - CHIP_BORDER, CHIP_TOP + CHIP_HEIGHT * y + CHIP_BORDER);
			context.closePath();
			context.fill();
		}
	}
	
}
