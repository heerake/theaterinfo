import { get, set } from 'lodash-es';
import { internalActionType } from './constants';

// tslint:disable-next-line:no-empty
export const noop = () => { };

/**
 * 是否是值数据
 *
 * @export
 * @param {any} v
 * @returns
 */
export function isPrimitive(v: any): boolean {
  return ['undefined', 'number', 'string', 'boolean']
    .indexOf(typeof v) !== -1 || v === null;
}

/**
 * 复杂数据对象平铺，用于简化 rc-form 处理复杂数据
 * example: flattenDataFields({a:[1], b: {c:'c', d: [{e:'e'}]}}) => {'a.[0]':1, 'b.c':'c', 'b.d.[0].e': 'e'}
 *
 * @export
 * @param {object} source
 * @param {(Number|String)[]} ns
 * @returns 平铺后的对象数据
 */
export function flattenData(value, ns = '', rtn = {}) {
  const fields = Object.keys(value);

  fields.forEach(f => {
    const _ns = Array.isArray(value) ? `.[${f}]` : `${ns ? '.' : ''}${f}`;
    rtn[ns + _ns] = value[f];
    if (isPrimitive(value[f])) {
      // rtn[ns + _ns] = value[f];
    } else if (value[f]) {
      flattenData(value[f], `${ns}${_ns}`, rtn);
    }
  });
  return rtn;
}

const IS_FIELD_ITEM = {};

/**
 * 判断是否是 field 数据
 *
 * @export
 * @param {any} d
 * @returns
 */
export function isField(d) {
  return !!d && d.is === IS_FIELD_ITEM;
}

export const bindActions = actions => dispatch => {
  if (!actions) {
    return {};
  }
  const keys = Object.keys(actions);
  const rtn = {} as any;
  keys.forEach(type => {
    rtn[type] = (...args) => {
      dispatch({
        type,
        payload: args,
      });
    };
  });
  return rtn;
};

export const bindThunks = thunks => dispatch => {
  if (!thunks) {
    return {};
  }
  const keys = Object.keys(thunks);
  return keys.reduce((rtn, key) => {
    rtn[key] = (...args) => dispatch(thunks[key](...args));
    return rtn;
  }, {} as any);
};

export function createWatchReducer(watches = {}, extraArgs: { getLastState: Function }) {
  const fields = Object.keys(watches);
  return (state, _action) => {
    const fieldsToDel: string[] = [];
    const res = fields.reduce((_rtn, field) => {
      const lastState = extraArgs.getLastState();
      const fieldState = watches[field](state[field], lastState ? lastState[field] : lastState, state, lastState);
      if (fieldState === undefined) {
        fieldsToDel.push(field);
      }
      return { ..._rtn, [field]: fieldState };
    }, state);
    fieldsToDel.forEach(d => {
      delete res[d];
    });
    return res;
    // }
    // return state;
  };
}

export function defaultGetEventValue(e) {
  if (['undefined', 'string', 'number', 'boolean'].indexOf(typeof e) !== -1 || e === null || !e.target) {
    return e;
  }

  if (e.target.type === 'checkbox') {
    return e.target.checked;
  }
  return e.target.value;
}

/**
 * 获取表单的 value 字段
 *
 * @param state
 */
export function getFieldsValue(state) {
  return Object.keys(state).reduce((rtn, key) => {
    if (isField(state[key])) {
      rtn[key] = state[key].value;
    }
    return rtn;
  }, {});
}

/**
 * 转换 errMap => help
 *
 * @param {Array<{ [field: string]: Array<{ field: string, message: string }> }>} errMap
 * @param {string[]} fields
 * @returns {Array<{field: errorMsg}>}
 */
export function convertErrMapToHelpTips(
  errMap: Array<{ [field: string]: Array<{ field: string, message: string }> }>,
  fields: string[],
) {
  return fields.reduce((rtn, field) => {
    const errors = (errMap || {})[field];
    if (!errors || errors.length === 0) {
      rtn[field] = null;
    } else {
      const help = errors.map(d => d.message).join('；');
      rtn[field] = help;
    }
    return rtn;
  }, {} as any);
}

/**
 * 表单值变更触发已不校验的中间件
 *
 * @param {Array<{ fields: string[], rules: any }>} [validators=[]]
 * @returns
 */
/*
export function fieldChangeValidateMiddleware(validators: Array<{ fields: string[], rules: any }> = []) {
  return ({ dispatch, getState }) => next => action => {
    let schema;
    const fieldRelatived: string[] = [];

    // 1.判断是否是单个字段变更的时候
    if (action.type === internalActionType.fieldChange && action.field) {
      const validatorsToRun = validators.filter(({ fields }) => {
        const rtn = fields.indexOf(action.field) !== -1;  // 筛选出相关校验规则（校验规则为 N : M）
        if (rtn) {
          // 记录需要更新校验状态的 fields
          fieldRelatived.push(...fields);
        }
        return rtn;
      });

      // 2.生成校验的 schema
      schema = new asyncValidator(validatorsToRun.reduce((descriptor, curValidator) => {
        curValidator.fields.forEach(f => {
          descriptor[f] = curValidator.rules;
        });
        return descriptor;
      }, {} as any));
    }
    // 3.执行 state 变更，刷新页面
    const nextAction = next(action);
    // 4.延迟执行的校验
    if (schema) {
      runValidate(schema, getState, (errs, errMap) => {
        dispatch({
          type: internalActionType.validateEnd,
          payload: convertErrMapToHelpTips(errMap, fieldRelatived),
        });
      }, dispatch);
    }

    return nextAction;
  };
}
*/

/**
 * middleware to run validator
 *
 * @export
 * @param {{ run: Function }} validatorRunner
 * @returns
 */
export function validatorRunnerMiddleware(validatorRunner: { run: Function }) {
  return () => next => action => {
    const nextAction = next(action);
    if (action.type === internalActionType.stateChange || action.type === internalActionType.merge) {
      validatorRunner.run(action.field);
    }
    return nextAction;
  };
}

/**
 * 生成字段更新 action
 *
 * @export
 * @param {any} field 字段名
 * @param {any} value 值
 * @returns
 */
export function createOnChangeAction(field, value) {
  return {
    type: internalActionType.stateChange,
    field,
    payload: defaultGetEventValue(value),
  };
}

export class Defer<T> {
  promise: Promise<T>;
  _resolve;
  _reject;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this._reject = reject;
      this._resolve = resolve;
    });
  }

  resolve(...args) {
    this._resolve(...args);
  }

  reject(...args) {
    this._reject(...args);
  }
}

export function splitFieldPath(field) {
  const mc = field.match(/([^\[\.]+)/g);
  if (mc && mc.length) {
    return mc.map(d => {
      return /^\d+]$/i.test(d) ? Number(d.substr(0, d.length - 1)) : d;
    });
  }
  return [field];
}

/**
 * 刷新树的更新节点到跟节点的所有引用
 *
 * @export
 * @param {any} obj
 * @param {string | string[]} paths
 * @returns
 */
export function refreshTreePath(obj, paths: string | string[]) {
  if (typeof paths === 'string') {
    paths = splitFieldPath(paths);
  }
  const rtn = clone(obj);
  for (let i = 0; i < paths.length; i++) {
    const curPath = paths.slice(0, i + 1);
    const curNode = get(rtn, curPath);
    set(rtn, curPath, clone(curNode));
  }
  return rtn;
}

function clone(v) {
  if (isPrimitive(v)) {
    return v;
  }
  if (Array.isArray(v)) {
    return [...v];
  }
  return { ...v };
}

export const fakePropTypes = () => null;
