import { internalActionType } from '../constants';

export default function forceUpdateReducer(state, action) {
  if (action.type === internalActionType.forceUpdate) {
    return JSON.parse(JSON.stringify(state));
  }
  return state;
}
