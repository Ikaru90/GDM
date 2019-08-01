import {debounceFunc} from './Utils';
import '../styles/form.css';
import * as PIXI from 'pixi.js';

const socket = io();
let nickName = "Кот Борис";




window.onload = () => {
  let Application = PIXI.Application,
    loader = PIXI.loader,
    Sprite = PIXI.Sprite;

    // Create a Pixi Application.
  const app = new PIXI.Application({
    width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1
  });
  const {renderer} = app;

  renderer.backgroundColor= 0xdddddd;
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

//   /**
//    * Должен следить за сообщениями в блоке.
//    */
//   const maintainMessages = () => {
//     const messages = document.getElementById('messages');
// // нихера не работает надо почитать как удалять ноды
//     if (messages.childElementCount > 11) {
//       messages.childNodes = messages.childNodes.slice(messages.childNodes.length - 11);
//     }
//   };
}

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

PIXI.loader
  .add('playerImage', '../images/player.png')
  .on('progress', handleLoadProgress)
  .load(setup);

function setup() {
  // Не наю зачем, но оно зачем-то понадобится
  let player = new Sprite(loader.resources.playerImage.texture);

  player.position.set(100, 96);
  player.anchor.set(0.5, 0.5);

  app.stage.addChild(player);
  console.log('All files are loaded.')
}

