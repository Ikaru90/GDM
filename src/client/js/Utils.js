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