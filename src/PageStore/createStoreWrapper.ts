import { createStore as reduxCreateStore, applyMiddleware, AnyAction, compose, Store, Reducer } from 'redux';
import thunk from 'redux-mid-async-func';
import { omit, get, set } from 'lodash-es';
import { internalActionType } from './constants';
import { bindActions, bindThunks, createWatchReducer, flattenData, isPrimitive } from './utils';
// import { routerMiddleware, routerReducer } from 'react-router-redux';
import validatingReducer from './reducers/validatingReducer';
import forceUpdateReducer from './reducers/forceUpdateReducer';
import stateChangeReducer from './reducers/stateChangeReducer';
import createValidateSubscription from './createValidateSubscription';
import mergeStateReducer from './reducers/mergeStateReducer';
import addFieldReducer from './reducers/addFieldReducer';
import validatorRunnerMiddleware from './middlewares/validatorRunnerMiddlware';
import asyncThunksCallMiddleware from './middlewares/asyncThunksCallMiddleware';

export interface StoreWrapper {
  visibleFunc: any;
  visibleCfg: any;
  store: Store<any>;
  form?: any;
  getError: any;
  dispatchActions?: any;
  dispatchThunks?;
  getters: { [key: string]: () => any };
  // history?: History;
}

function mergeReducer(...reducers) {
  if (reducers.length === 0) {
    return v => v;
  }
  const rs = reducers.filter(r => typeof r === 'function');
  return (state, action) => {
    return rs
      .reduce((preState, reducer) => {
        return reducer(preState, action);
      }, state);
  };
}

export interface AdditionalOpts {
  reducers: Function[];
  middlewares: Function[];
}

export default function createStoreWrapper(config, _options?: Partial<AdditionalOpts>): StoreWrapper {
  const local: Partial<StoreWrapper> = {
    visibleFunc(field: string) {  // 控制 xformitem 是否渲染
      const fields = field.split('.');
      if (!local.store) return false;

      const state = local.store.getState();
      // 从子元素往父元素遍历，只要有一个为 false，则为隐藏
      for (let i = fields.length; i >= 1; i--) {
        const f = fields.slice(0, i).join('.');
        if (local.visibleCfg && typeof local.visibleCfg[f] === 'function' && local.visibleCfg[f](state) === false) {
          return false;
        }
      }
      return true;
    },
    visibleCfg: null,
    form: null,
    getError: null,
    dispatchActions: null,
    dispatchThunks: null,
    // history: config.history,
  };
  // const flattenedData = flattenData(config.initialState);
  const flattenedData = config.initialState;
  const initialState: any = {};

  Object.keys(flattenedData).forEach(f => {
    initialState[f] = flattenedData[f];
  });

  local.visibleCfg = Object.keys(config.visible || {}).reduce((rtn, cur) => {
    rtn[cur] = config.visible[cur];
    // 为 RE 留的特殊逻辑
    const tmpFields = cur.split('&_&');
    if (tmpFields.length > 1) {
      tmpFields.forEach(d => {
        if (!rtn[d]) {
          rtn[d] = rtn[cur];
        }
      });
    }
    return rtn;
  }, {});

  local.getters = config.getters;

  local.form = {
    setInitialState(_value) {  // 重设初始状态
      throw new Error('form can\'t be used until store is created');
    },
    validateFields(_fields: string[], _options: { scroll?: boolean }) {
      throw new Error('form can\'t be used until store is created');
    },
    getState() {
      throw new Error('form can\'t be used until store is created');
    },
    getVisibleState() {
      throw new Error('form can\'t be used until store is created')
    },
  };

  /**
   * 合并页面 store 配置的 actions 成 reducer
   */
  const actions = config.actions || {};
  const customReducer = (state, action: AnyAction) => {
    const { type, payload } = action;
    const callback = actions[type];
    if (typeof callback !== 'function') {
      return state;
    }
    const nextState = callback.apply(null, [state, ...payload]);
    return nextState;
  };

  let internalStateHistory: any[] = [];

  // watches 需要知道之前的数据
  const reducerStatefulArgs = {
    getLastState() { return internalStateHistory[1]; }
  };
  const watchReducer = createWatchReducer(config.watch, reducerStatefulArgs);

  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const extraArgument = { form: local.form, actions: {}, thunks: {} };
  const validateRunner = {
    run: () => { throw new Error('cannot call validator before store\'s been created.'); },
  } as any;

  const middlewares = [
    ...(config.middlewares || []),
    asyncThunksCallMiddleware(config.thunks),
    thunk.withExtraArgument(extraArgument),
    validatorRunnerMiddleware(validateRunner),
  ];

  const reducers = [
    addFieldReducer,
    forceUpdateReducer,
    stateChangeReducer,
    mergeStateReducer,
    validatingReducer,
    customReducer,
    watchReducer,
  ];

  /*
  if (config.history) {
    middlewares.unshift(routerMiddleware(config.history));
    reducers.unshift(routerReducer);
  }
  */

  let mergedReducer: Reducer<any> = mergeReducer(
    ...reducers,
  );
  if (config.replaceReducer) {
    mergedReducer = config.replaceReducer(mergedReducer);
  }

  const store = reduxCreateStore(
    mergedReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(
        ...middlewares,
      ),
    ),
  );

  // 保存最后一次变更的 state
  store.subscribe(() => {
    internalStateHistory.unshift(store.getState());
    if (internalStateHistory.length >= 3) {
      internalStateHistory.splice(2);
    }
  });

  const validateWrapper = createValidateSubscription(config.validators, local);
  validateRunner.run = validateWrapper.run;

  local.getError = validateWrapper.getError;

  local.dispatchActions = bindActions(actions)(store.dispatch);
  local.dispatchThunks = bindThunks(config.thunks)(store.dispatch);
  extraArgument.actions = local.dispatchActions;
  extraArgument.thunks = local.dispatchThunks;

  local.form.setInitialState = (value, isReplace?: boolean) => {
    store.dispatch({
      type: internalActionType.merge,
      payload: value,
      full: isReplace,
    });
  };

  local.form.getLastState = reducerStatefulArgs.getLastState();

  local.form.getState = (names: string[] = []) => {
    const state = { ...store.getState() };
    return omit(state, Object.keys(state).filter(d => names.indexOf(d) !== -1));
  };

  local.form.validateFields = (...args) => {
    let cb: Function;
    let fields: string[];
    let options: any = {};
    const currentState = local.form.getVisibleState();
    if (args.length <= 1) {
      cb = args[0];
      fields = Object.keys(currentState);
    } else if (args.length === 2) {
      [fields, cb] = args;
    } else {
      [fields, options, cb] = args;
    }

    validateWrapper.run();
    store.dispatch({ type: internalActionType.forceUpdate });
    const invisibleFields = fields.filter(f => local.visibleFunc(f) === false);
    validateWrapper.getError((errList: null | Array<{ field: string; message: string; }>) => {
      let errs: any | null = [];
      if (errList) {
        errList.forEach(e => {
          if (fields.indexOf(e.field) >= 0 && invisibleFields.indexOf(e.field) === -1) {
            errs.push(e);
          }
        });
      }
      if (errs.length === 0) {
        errs = null;
      }
      if (typeof cb === 'function') {
        cb(errs, currentState);
      }
    });
  };

  local.form.getVisibleState = (names: string[] = []) => {
    const rtn = { ...local.form.getState(names) };

    // 获取所有值类型的字段名
    const primitiveFields = Object.keys(flattenData(rtn)).filter(d => isPrimitive(get(rtn, d)));
    const res = {};
    primitiveFields.forEach(f => {
      // 为 RE 留的特殊逻辑
      // 把 RE 的 VisibleContoller 注入的字段名分解成为各个字段
      const _fields = f.split('&_&');
      if (!_fields.length) {
        return;
      }
      if (local.visibleFunc(f)) {
        _fields.forEach(d => {
          set(res, d, get(rtn, d));
        });
      }
    });
    return res;
  };

  local.store = store;
  return local as StoreWrapper;
}
