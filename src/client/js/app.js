import Phaser from 'phaser';
import {debounceFunc} from './Utils';
import '../styles/form.css';

let nickName = "Кот Борис";

window.onload = () => {
  const socket = io();
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

  const maintainMessages = () => {
    const messages = document.getElementById('messages');

    if (messages.childElementCount > 11) {
      messages.childNodes = messages.childNodes.slice(messages.childNodes.length - 11);
    }
  }
}


