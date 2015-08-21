$(function(){

	var socket = io();
	var clientID;
	var clients = [];
	var asters = [];
	var bullets = [];
	var asterangle = 0;
	var TO_RADIANS = Math.PI/180;
	var player = new Image();
	var bullet = new Image();
	var enemy = new Image();
	var aster = new Image();
	var background = new Image();
	var angle = 0;
	var countBullet = true;

	player.src = '/images/player.png';
	enemy.src = '/images/enemy.png';
	aster.src = '/images/aster.png';
	background.src = '/images/background.jpg';
	bullet.src = '/images/bullet.png';

	var Keyboarder = function(){
		var KeyState = {};
		window.onkeydown = function(e){KeyState[e.keyCode] = true;}
		window.onkeyup = function(e){KeyState[e.keyCode] = false;}
		this.isDown = function(keyCode){return KeyState[keyCode] === true;}
		this.KEYS = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32};
	}

	function drawRotatedImage(image, x, y, angle) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle * TO_RADIANS);
		ctx.drawImage(image, -(image.width/2), -(image.height/2));
		ctx.restore();
	}

	var Keyboarder = new Keyboarder();

	canvas = document.getElementById("screen");
	ctx = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	socket.on('connect',function(){

		socket.on('actorId', function (id) {
			clientID = id;
		});

		socket.on('clientsInfo', function (data) {
			clients = data[0];
			asters = data[1];
			bullets = data[2];
			asterangle += 1;
			for(var i=0;i<clients.length;i++) {
				if (clients[i] != null){
					if (clients[i].id == clientID) {
						document.getElementById('hp').innerHTML = clients[i].hp;
						toCenterX = canvas.width/2 - clients[i].x;
						toCenterY = canvas.height/2 - clients[i].y;
					}
				}
			}

			for(var i=0;i<asters.length;i++) {
				asters[i].angle += asterangle;
				asters[i].x += toCenterX;
				asters[i].y += toCenterY;
			}
			for(var i=0;i<bullets.length;i++) {
				bullets[i].x += toCenterX;
				bullets[i].y += toCenterY;
			}

			ctx.clearRect(0,0,canvas.width,canvas.height);
			ctx.drawImage(background,0,0);
			for(var i=0;i<asters.length;i++) {
				drawRotatedImage(aster,asters[i].x,asters[i].y,asters[i].angle);
			}
			for(var i=0;i<bullets.length;i++) {
				ctx.drawImage(bullet,bullets[i].x,bullets[i].y);
			}

			ctx.beginPath();
			ctx.moveTo(-25+toCenterX, -25+toCenterY);
			ctx.lineTo(2025+toCenterX, -25+toCenterY);
			ctx.moveTo(-25+toCenterX, -25+toCenterY);
			ctx.lineTo(-25+toCenterX, 2025+toCenterY);
			ctx.moveTo(2025+toCenterX, -25+toCenterY);
			ctx.lineTo(2025+toCenterX, 2025+toCenterY);
			ctx.moveTo(-25+toCenterX, 2025+toCenterY);
			ctx.lineTo(2025+toCenterX, 2025+toCenterY);
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#ff0000';
			ctx.stroke();

			for(var i=0;i<clients.length;i++) {
				if (clients[i] != null){
					if (clients[i].id == clientID) {
						drawRotatedImage(player,clients[i].x+toCenterX,clients[i].y+toCenterY,clients[i].angle);
						angle = clients[i].angle;
					} else {
						if (clients[i].hp > 0){
							drawRotatedImage(enemy,clients[i].x+toCenterX,clients[i].y+toCenterY,clients[i].angle);
						}
					}
				}
			}

			if (clients[clientID].hp > 0){
				if (Keyboarder.isDown(Keyboarder.KEYS.RIGHT)) {
					socket.emit('changeAngleClient',[clientID,angle,'RIGHT']);
				}
				if (Keyboarder.isDown(Keyboarder.KEYS.LEFT)) {
					socket.emit('changeAngleClient',[clientID,angle,'LEFT']);
				}
				if (Keyboarder.isDown(Keyboarder.KEYS.UP)) {
					socket.emit('moveClient',[clientID,'foward']);
				}
				if (Keyboarder.isDown(Keyboarder.KEYS.DOWN)) {
					socket.emit('moveClient',[clientID,'back']);
				}
				if (clients[clientID].permissionForShooting == true){
					if (Keyboarder.isDown(Keyboarder.KEYS.SPACE)) {
						socket.emit('fireClient',clientID);
						
					}
				}
			} else {
				var lose = document.getElementById('lose');
				lose.style.display = 'block';
			}
		});
	});
});
function resizeGame(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
};
window.addEventListener('resize', resizeGame, false);