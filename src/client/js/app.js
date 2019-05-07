import Phaser from 'phaser';

window.onload = () => {
  const socket = io();

  socket.on('connect',function(){
    console.log('connect');
  });
}
