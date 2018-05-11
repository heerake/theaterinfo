import { has, set } from 'lodash-es';
import { internalActionType } from '../constants';

export default function addFieldReducer(state, action) {
  if (internalActionType.addField === action.type && !has(state, action.payload.fieldName)) {
    return set(
      { ...state },
      action.payload.fieldName,
      action.payload.value !== undefined ? action.payload.value : null,
    );
  }
  return state;
}
