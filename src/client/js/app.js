import Phaser from 'phaser';
let nickName = "Кот Борис";

window.onload = () => {
    const socket = io();
    const form = document.getElementsByTagName('form')[0];
    const button = document.getElementsByTagName('button')[0];

    socket.on('connect', function () {
        console.log('connect');
        socket.emit('chat message', nickName +' слушает нас...')
    });
    socket.on('chat message', (msg) => {
        const messages = document.getElementById('messages');
        const li = document.createElement('li');
        li.textContent = msg;
        messages.appendChild(li);
    });
    socket.on('disconnect', () => {
        socket.emit('chat message', `[ ${nickName} ]: покинул хоромы...`);
    })

    button.addEventListener('click', (e) => handleClickButton(e));
    form.addEventListener('submit', (e) => handleSubmitForm(e));

    /**
     * Подтверждение формы.
     */
    const handleSubmitForm = (e) => {
        const message = document.getElementById('m');
        const value = `[ ${nickName} ]: ${message.value}`;

        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', value);
        message.setAttribute('value', '');

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
}


