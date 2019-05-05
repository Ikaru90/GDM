import express from 'express';
import http from 'http';
import socket from 'socket.io';

const app = express();
const server = http.Server(app);
const io = socket(server);
const port = process.env.PORT || 3000;

app.set('port', port);

server.listen(app.get('port'));

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket){
	console.log('connection', socket.id);

	socket.on('disconnect', function () {
		console.log('disconnect', socket.id);
	});
});

console.log('Server Started');
