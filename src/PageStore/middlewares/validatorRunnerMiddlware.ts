import { internalActionType } from '../constants';

/**
 * middleware to run validator
 *
 * @export
 * @param {{ run: Function }} validatorRunner
 * @returns
 */
export default function validatorRunnerMiddleware(validatorRunner: { run: Function }) {
  let runAll = false;
  return (/*{ dispatch, getState }*/) => next => action => {
    const nextAction = next(action);
    if (action.type === internalActionType.validateFields) {
      runAll = true;
    }
    if (!runAll && !action.field) {
      return nextAction;
    }
    if (action.type === internalActionType.stateChange || action.type === internalActionType.merge) {
      validatorRunner.run(action.field);
    }
    return nextAction;
  };
}
