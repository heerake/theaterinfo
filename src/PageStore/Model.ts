import createStoreWrapper from "./createStoreWrapper";
import { internalActionType } from "./constants";
import { call } from './actions';
import createPageView from "./createPageView";
import { getContainer } from './containerInst';

export class Model<T> {
  static namespace?: string;
  merge: (partialState: any) => Promise<any>;
  state: T;
  visible: { [key: string]: (state: T) => boolean }
  watch: { [key: string]: (cur, prev, curState, prevState) => any };
  validators: Array<{ fields: string[]; rules: any }>;
  form: {
    setInitialState: Function;
    validateFields: Function;
    getVisibleState: Function;
    getLastState: Function;
  };
  getModel: (namespace: string) => {
    state: any;
    call: (methodName: string, args?: any[]) => Promise<void>;
  };
}

export const modelDecorator = <T extends Function>(
  klass: Model<T> | FunctionConstructor,
  enhancer?: PageStoreEnhander,
) =>
  (View: T) => {
    const cls: Model<T> = typeof klass === 'function' ? (new klass() as any) : klass;
    const proto = Object.getPrototypeOf(cls);
    const allPropertyNames = [...Object.getOwnPropertyNames(cls), ...Object.getOwnPropertyNames(Object.getPrototypeOf(cls))];
    const thunks = allPropertyNames
      .filter(d => d !== 'constructor' && typeof cls[d] === 'function')
      .reduce((rtn, key) => {
        // 屏蔽掉 dispatch 和 getState，model 模式不需要
        rtn[key] = (...args) => (_dispatch, _getState) => { return cls[key].apply(cls, args); };
        return rtn;
      }, {} as any);

    // 合成 getter 属性访问器，作为 props 传入组件
    const getters: { [key: string]: () => any } = {};
    allPropertyNames.forEach(d => {
      const descriptor = Object.getOwnPropertyDescriptor(cls, d) || Object.getOwnPropertyDescriptor(proto, d);
      if (descriptor && typeof descriptor.get === 'function') {
        Object.defineProperty(getters, d, {
          configurable: false,
          enumerable: true,
          get: descriptor.get.bind(cls),
        });
      }
    });

    const storeWrapper = createStoreWrapper({
      initialState: cls.state || {},
      watch: cls.watch,
      validators: cls.validators || [],
      thunks,
      visible: cls.visible,
      getters,
      ...enhancer,
    });

    Object.defineProperties(cls, {
      state: {
        get() {
          return storeWrapper.store.getState();
        },
      },
      merge: {
        get() {
          return (partialState: any) => {
            return storeWrapper.store.dispatch({ type: internalActionType.merge, payload: partialState });
          }
        }
      },
      form: {
        get() {
          return storeWrapper.form;
        }
      },
      dispatch: {
        get() {
          return (action) => storeWrapper.store.dispatch(action);
        }
      },
      getModel: {
        get() {
          return (ns: string) => {
            const model = getContainer().getModule(ns).model;
            return {
              get state() { return model.state; },
              call(methodName: string, args: any[]) {
                return model[methodName](...args);
              }
            };
          }
        }
      }
    });

    return createPageView(storeWrapper, View,
      {
        getError: storeWrapper.getError,
        visibleFunc: storeWrapper.visibleFunc,
      },
      {
        model: cls,
      },
    );
  }

/**
 * connect 的 mapDispatchToProps 中用来生成调用 Model 中定义的 async 成员函数的工具方法
 *
 * @export
 * @param {any} dispatch
 * @param {'string'} name
 * @returns
 */
export function getCallThunkFuncs(names: string[]) {
  return () => {
    const rtn: { [key: string]: Function } = {};
    names.forEach(name => {
      rtn[name] = (...args: any[]) => {
        call(name, args);
      }
    });
    return rtn;
  }
}
