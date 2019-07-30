import express from 'express';
import http from 'http';
import socket from 'socket.io';

const app = express();
const server = http.Server(app);
const io = socket(server);
const port = process.env.PORT || 3000;

app.set('port', port);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket){
	console.log('connection', socket.id);

	socket.on('disconnect', function () {
		console.log('disconnect', socket.id);
		io.emit('chat message', socket.id + ' ушел баиньки...');
	});
});

server.listen(port, function () {
	console.log('listening on *:3000');
});

io.on('connection', (socket) => {
	socket.on('chat message', (message) => {
		console.log('message: ' + message);
		io.emit('chat message', message);
	})
});

console.log('Server Started at port:', port);
