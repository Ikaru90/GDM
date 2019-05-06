function getRandomArbitary(min, max){
	return Math.round(Math.random() * (max - min) + min);
}

var clientID = 0;
var clients = [];
var asters = [];
var bullets = [];

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'));

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var Client = function(ID) {
	this.id = clientID;
	this.socketID = ID;
	this.hp = 30;
	this.x = getRandomArbitary(18,182)*5;
	this.y = getRandomArbitary(18,142)*5;
	this.angle = 270;
	this.width = 50;
	this.height = 50;
	this.permissionForShooting = true;
}

var colliding = function (b1, b2) {
	return !(b1 == b2 ||
	b1.x + b1.width / 2 < b2.x - b2.width / 2 ||
	b1.y + b1.height / 2 < b2.y - b2.height / 2 ||
	b1.x - b1.width / 2 > b2.x + b2.width / 2 ||
	b1.y - b1.height / 2 > b2.y + b2.height / 2);
}

var Aster = function() {
	this.x = getRandomArbitary(50,950);
	this.y = getRandomArbitary(50,950);
	this.moveX = getRandomArbitary(-2,2);
	this.moveY = getRandomArbitary(-2,2);
	this.angle = getRandomArbitary(0,360);
	this.width = 50;
	this.height = 50;
}

var Bullet = function(x,y,angle){
	this.x = x;
	this.y = y;
	this.width = 10;
	this.height = 10;
	this.speed = 10;
	this.angle = angle;
}

setInterval(function(){
	if (asters.length <= 30){
		var aster = new Aster();
		asters.push(aster);
	}
}, 5000);

setInterval(function(){
	for(var i=0;i<asters.length;i++) {
		asters[i].x += asters[i].moveX;
		asters[i].y += asters[i].moveY;
		if (asters[i].x > 2000){
			asters[i].x = 0;
		}
		if (asters[i].x < 0){
			asters[i].x = 2000;
		}
		if (asters[i].y > 2000){
			asters[i].y = 0;
		}
		if (asters[i].y < 0){
			asters[i].y = 2000;
		}
	}
}, 30);

setInterval(function(){
	for(var i=0;i<clients.length;i++) {
		if (clients[i] != null){
			for(var j=0;j<asters.length;j++) {
				if (colliding(clients[i],asters[j])){
					asters.splice(j,1);
					clients[i].hp -= 10;
				}
			}
		}
	}
}, 30);

setInterval(function(){
	for(var i=0;i<clients.length;i++) {
		if (clients[i] != null){
			for(var j=0;j<bullets.length;j++) {
				if (colliding(clients[i],bullets[j])){
					bullets.splice(j,1);
					clients[i].hp -= 5;
				}
			}
		}
	}
}, 10);

setInterval(function(){
	for(var i=0;i<bullets.length;i++) {
		bullets[i].x += bullets[i].speed * Math.cos(bullets[i].angle * Math.PI/180);
		bullets[i].y += bullets[i].speed * Math.sin(bullets[i].angle * Math.PI/180);
		if ((bullets[i].x < 0)||(bullets[i].x > 2000)||(bullets[i].y < 0)||(bullets[i].y > 2000)) {
			bullets.splice(i,1);
		}
	}
}, 10);

io.sockets.on('connection',function (socket){
	var client = new Client(socket.id);
	clients.push(client);
	console.log('Client '+clientID+' connected');
	socket.emit('actorId', clientID);
	clientID++;

	socket.on('disconnect', function () {
		for(var i=0;i<clients.length;i++) {
			if (clients[i] != null){
				if (clients[i].socketID == socket.id){
					console.log('Client '+clients[i].id+' disconnected');
					delete clients[i];
				}
			}
		}
	});

	socket.on('changeAngleClient', function (data) {
		changeAngleClient = data[0];
		angle = data[1];
		if (data[2] == 'RIGHT'){
			clients[changeAngleClient].angle += 3;
		}
		if (data[2] == 'LEFT'){
			clients[changeAngleClient].angle -= 3;
		}
	});
	socket.on('fireClient', function (data) {
		var bullet = new Bullet(clients[data].x + (60 * Math.cos(clients[data].angle * Math.PI/180)),clients[data].y+ (60 * Math.sin(clients[data].angle * Math.PI/180)),clients[data].angle);
		bullets.push(bullet);
		clients[data].permissionForShooting = false;
	});

	socket.on('moveClient', function (data) {
		moveClient = data[0];
		move = data[1];
		if (move == 'foward'){
			clients[moveClient].x += 5 * Math.cos(clients[moveClient].angle * Math.PI/180);
			clients[moveClient].y += 5 * Math.sin(clients[moveClient].angle * Math.PI/180);

			if (clients[moveClient].x > 2000){
				clients[moveClient].x = 2000;
			}
			if (clients[moveClient].x < 0){
				clients[moveClient].x = 0;
			}
			if (clients[moveClient].y > 2000){
				clients[moveClient].y = 2000;
			}
			if (clients[moveClient].y < 0){
				clients[moveClient].y = 0;
			}
		}
		if (move == 'back'){
			clients[moveClient].x -= 5 * Math.cos(clients[moveClient].angle * Math.PI/180);
			clients[moveClient].y -= 5 * Math.sin(clients[moveClient].angle * Math.PI/180);
			if (clients[moveClient].x > 2000){
				clients[moveClient].x = 2000;
			}
			if (clients[moveClient].x < 0){
				clients[moveClient].x = 0;
			}
			if (clients[moveClient].y > 2000){
				clients[moveClient].y = 2000;
			}
			if (clients[moveClient].y < 0){
				clients[moveClient].y = 0;
			}
		}
	});

	setInterval(function(){ 
		socket.emit('clientsInfo', [clients,asters,bullets]);
	}, 10);
});

setInterval(function(){ 
	for(var i=0;i<clients.length;i++) {
		if (clients[i] != null){
			clients[i].permissionForShooting = true;
		}
	}
}, 333);

console.log('Server Started');