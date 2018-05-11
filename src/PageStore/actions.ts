import { internalActionType } from './constants';

/**
 * 注册字段
 *
 * @export
 * @param {string} fieldName
 * @param {any} [value=null]
 * @returns
 */
export function addField(fieldName: string, value = null) {
  return { type: internalActionType.addField, payload: { fieldName, value } };
}

/**
 * 调用 Model 定义的方法
 *
 * @param methodName 调用的方法名
 * @param args 调用的传参
 */
export function call(methodName: string, args: any[] = []) {
  return { type: internalActionType.call, name: methodName, args };
}

/**
 * 合并 state
 *
 * @export
 * @param {any} [partialState={}]
 * @returns
 */
export function mergeState(partialState = {}) {
  return {
    type: internalActionType.merge,
    payload: partialState,
    full: false,
  };
}

/**
 * 替换 state
 *
 * @export
 * @param {any} [partialState={}]
 * @returns
 */
export function replaceState(state = {}) {
  return {
    type: internalActionType.merge,
    payload: state,
    full: true,
  };
}

export default {
  addField,
  call,
  mergeState,
  replaceState,
}
