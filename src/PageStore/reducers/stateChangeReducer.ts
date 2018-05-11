import { set } from 'lodash-es';
import { internalActionType } from '../constants';
import { refreshTreePath } from '../utils';

/**
 * 字段数据变更
 *
 * @param {any} state
 * @param {any} action
 * @returns
 */
export default function stateChangeReducer(state, action) {
  if (action.type === internalActionType.stateChange && action.field) {
    set(state, action.field, action.payload);
    return refreshTreePath(state, action.field);
  }
  return state;
}
