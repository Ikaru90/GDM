import {debounceFunc, handleKeyPressing} from './Utils';
import '../styles/form.css';
import * as PIXI from 'pixi.js';
import tileSet from '../images/tileset.png';
import playerImage from '../images/player.png';
import {SPEED_X_Y} from './Consts';
import background from '../images/background.jpg';

// Пока определяет направление вращения\движения.
let direction;
const socket = io();
let nickName = "Кот Борис";

window.onload = () => {
  let Application = PIXI.Application,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

    // Create a Pixi Application.
  const app = new PIXI.Application({
    width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1
  });
  const {renderer, loader} = app;

  // renderer.backgroundColor= 0xdddddd;
  renderer.autoDensity = true;
  renderer.view.style.display = "block";
  renderer.view.style.position = "absolute";
  renderer.resize(window.innerWidth, window.innerHeight);

  const form = document.getElementsByTagName('form')[0];
  const button = document.getElementsByTagName('button')[0];
  const input = document.getElementById('m');

  socket.on('connect', function () {
    console.log('connected');
    socket.emit('chat message', nickName + ' слушает нас...')
  });
  socket.on('chat message', (msg) => {
    viewUserMessage(msg);
  });
  socket.on('disconnect', () => {
    socket.emit('chat message', `[ ${nickName} ]: покинул хоромы...`);
  });
  socket.on('typing', (msg) => {
    viewUserMessage(msg);
  })

  button.addEventListener('click', (e) => handleClickButton(e));
  form.addEventListener('submit', (e) => handleSubmitForm(e));
  input.addEventListener('keypress', (e) => handleTyping(e));

  /**
   * Подтверждение формы.
   */
  const handleSubmitForm = (e) => {
    const message = document.getElementById('m');
    const value = `[ ${nickName} ]: ${message.value}`;

    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', value);
    message.value = '';

    return false;
  };

  /**
   * Обработчик нажатия на кнопку отправки.
   *
   * @param {*} e Событие.
   */
  const handleClickButton = (e) => {
    nickName = document.getElementById('m').value;
  }

  /**
   * Обработчик набора текста.
   *
   * @param {*} e Событие.
   */
  const handleTyping = debounceFunc((e) => {
    const value = `[ ${nickName} ]: печатает...`;

    socket.emit('typing', value);
  });

  /**
   * Отобразит сообщение пользователя.
   * @param {string} message Сообщение пользователя. 
   */
  const viewUserMessage = (message) => {
    const messages = document.getElementById('messages');
    const li = document.createElement('li');

    li.textContent = message;
    messages.appendChild(li);
    maintainMessages();
  };

  document.body.appendChild(app.view);

  /**
   * Должен следить за сообщениями в блоке.
   */
  const maintainMessages = () => {
    const messages = document.getElementById('messages');
// нихера не работает надо почитать как удалять ноды
    if (messages.childElementCount > 11) {
      messages.childNodes = messages.childNodes.slice(messages.childNodes.length - 11);
    }
  };

  /**
   * Обработчик загрузки изображений.
   *
   * @prop {any} loader Загрузчик.
   * @prop {any} resource Ресурс.
   */
  const handleLoadProgress = (loader, resource) => {
    console.log('loading' + resource.url);
    console.log('progress: ' + loader.progress + " %");
  }

  loader
    .add('playerImage', playerImage)
    // .add('tileSet', tileSet)
    .add('background', background)
    .on('progress', handleLoadProgress)
    .load(setup);
  let player;
  // let bomb;

  function setup() {
  const background = new Sprite(loader.resources.background.texture);
  background.width = app.screen.width*2;
  background.height = app.screen.height*4;
  app.stage.addChild(background);
    // let texture = TextureCache[tileSet];
    // let rectangle = new Rectangle(160, 160, 32, 32);
    
    player = new Sprite(loader.resources.playerImage.texture);

    // player.blendMode = PIXI.BLEND_MODES.ADD;

    // texture.frame = rectangle;

    // bomb = new Sprite(texture);
    // bomb.position.set(10, 10);
    // bomb.anchor.set(0.5, 0.5);

    player.position.set(100, 96);
    player.vx = 0;
    player.vy = 0;
    player.vd = 0;

    player.anchor.set(0.5, 0.5);

    app.stage.addChild(player);
    // app.stage.addChild(bomb);
    app.renderer.render(app.stage);

    app.ticker.add(delta => gameLoop(delta));
  }

  /**
   * Движение вперед.
   */
  let moveForward = handleKeyPressing('ArrowUp');
  moveForward.press = () => {
    player.vx = direction * SPEED_X_Y * Math.cos(player.rotation);
    player.vy = direction * SPEED_X_Y *Math.sin(player.rotation);
  }
  moveForward.release = () => {
    player.vx = 0;
    player.vy = 0;
  }

  /**
   * Движение назад.
   */
  let moveBack = handleKeyPressing('ArrowDown');
  moveBack.press = () => {
    player.vx = direction * SPEED_X_Y * Math.cos(player.rotation);
    player.vy = direction * SPEED_X_Y *Math.sin(player.rotation);
  }
  moveBack.release = () => {
    player.vx = 0;
  }

  /**
   * Поворот вправо.
   */
  let moveRight = handleKeyPressing('ArrowRight');
  moveRight.press = () => {
    player.vd = 0.2;
  }
  moveRight.release = () => {
    player.vd = 0;
  }

  /**
   * Поворот влево.
   */
  let moveLeft = handleKeyPressing('ArrowLeft');
  moveLeft.press = () => {
    player.vd = -0.2;
  }
  moveLeft.release = () => {
    player.vd = 0;
  }

  // Собственно здесь происходит все действо игры.
  function gameLoop(delta) {
    direction = player.vd >= 0 ? 1 : - 1;
    if(moveForward.isDown && moveRight.isDown) {
      player.vx = direction * SPEED_X_Y * Math.cos(player.rotation);
      player.vy = direction * SPEED_X_Y *Math.sin(player.rotation);
    } else if (moveForward.isDown && moveLeft.isDown) {
      player.vx = SPEED_X_Y * Math.cos(player.rotation);
      player.vy = SPEED_X_Y *Math.sin(player.rotation);
    }
    player.x += player.vx;
    player.y += player.vy;
    player.rotation += player.vd;
  }
}
