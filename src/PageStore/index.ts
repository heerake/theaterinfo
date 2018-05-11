import _createPageView from './createPageView';
import _createStoreWrapper, { StoreWrapper } from './createStoreWrapper';

export { default as formItemHOC } from './formItemHOC';
export { default as Field, fieldHOC } from './Field';
export { internalActionType } from './constants';
export { modelDecorator, Model, getCallThunkFuncs } from './Model';

export const createPageStore = (config: any, additionOptions?: { getChildContext?: (sw: StoreWrapper) => any; history?: any }) => {
  const storeWrapper = _createStoreWrapper(config);
  return View => {
    let context: any = {};
    if (!additionOptions || !additionOptions.getChildContext) {
      context = {
        getError: storeWrapper.getError,
        pageProps: { ...storeWrapper.dispatchThunks, ...storeWrapper.dispatchActions },
        visibleFunc: storeWrapper.visibleFunc,
      }
    } else {
      context = additionOptions.getChildContext(storeWrapper);
    }
    return _createPageView(storeWrapper, View, context/*, additionOptions ? additionOptions.history : undefined*/);
  };
}

export { default as actions } from './actions';

export { default as pageInject } from './pageInject';

export { default as Container } from './Container';
