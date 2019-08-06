import debounce from 'lodash.debounce';
import {WAITING_TIME, DEBOUNCE_CONFIG} from './Consts';

/**
 * Оборачивает функцию в debounce.
 *
 * @param {Function} function Оборачиваемая функция.
 */
export const debounceFunc = (funcToWrap) => {
  return debounce(funcToWrap, WAITING_TIME, DEBOUNCE_CONFIG)
};

/**
* Обрабатывает события нажатия и отпуска клавиши.
*
* @param {*} value 
*/
export const handleKeyPressing = (value) => {
 let key = {
   value: value,
   isDown: false,
   isUp: true,
   press: undefined,
   release: undefined,
 };

 /**
  * Обработчик нажатия клавиши.
  *
  * @param {*} event Событие обрабатываемое.
  */
 const handleKeyDown = (event) => {
   if (event.key === key.value) {
     if (key.isUp && key.press) key.press();
     
     key.isDown = true;
     key.isUp = false;
     event.preventDefault();
   }
 }

 /**
  * Обработчик отжатия.
  *
  * @param {*} event 
  */
 const handleKeyUp = (event) => {
   if (event.key === key.value) {
     if (key.isDown && key.release) key.release();
     
     key.isDown = false;
     key.isUp = true;
     event.preventDefault();
   }
 };

 key.upHandler = handleKeyUp;
 key.downHandler = handleKeyDown;
 key.unsubscribe = handleUnsubscribe;

 /**
  * Отписываемся от мониторинга событий.
  */
 const handleUnsubscribe = () => {
   window.removeEventListener('keydown', key.downHandler);
   window.removeEventListener('keyup', key.upHandler);
 }

 window.addEventListener(
   'keydown', key.downHandler, false
 );

 window.addEventListener(
   'keyup', key.upHandler, false
 );
 
 return key;
}