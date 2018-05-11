import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, omit } from 'lodash-es';
import { Store } from 'redux';
import { addField } from './actions';
import { createOnChangeAction } from './utils';

export interface IFieldProps {
  name?: string;
  fullName?: string;
  component?: Function | FunctionConstructor;
  mapStateToProps?: (state: any, ownProps: any) => any;
  mapDispatchToProps?: (dispatch: Function) => any;
  defaultValue?: any;
  // mergeProps?: (stateProps, dispatchProps, ownProps) => any;
  [key: string]: any;
}

function getFieldName(props, ctx) {
  let fieldName = props.fullName || [ctx.parentName || '', props.name].join('.');
  if (fieldName.charAt(0) === '.') {
    fieldName = fieldName.slice(1);
  }
  return fieldName;
}

const defaultComponent = (props) => <div {...props}>{props.children}</div>;

/**
 * 根据 props 和 fieldName 生成 react-redux connect 的参数
 *
 * @param {any} props 控件传入的 props
 * @param {any} fieldName 控件所绑定的字段
 * @returns
 */
function generateConnectOpts(props, fieldName) {
  return props.connectOpts || {
    mapStateToProps: state => {
      return {
        ...(props.mapStateToProps ? props.mapStateToProps(state) : {}),
        value: get(state, fieldName),
        // validateStatus: get(state, `${this.fieldName}.validateStatus`),
        // help: get(state, `${this.fieldName}.error`),
      };
    },

    mapDispatchToProps: dispatch => ({
      ...(props.mapDispatchToProps ? props.mapDispatchToProps(dispatch) : {}),
      onChange: (v) => {
        dispatch(createOnChangeAction(fieldName, v));
      },
    }),

    mergeProps: (stateProps, dispatchProps, ownProps) => ({
      ...ownProps, ...stateProps, ...dispatchProps,
    }),
  };
}

export const fieldHOC = (mapStoreToProps: (store: Store<any>, ownProps?: any) => any = () => { }) => {
  return class Field extends React.Component<IFieldProps, any> {
    static contextTypes = {
      store: PropTypes.object,
      parentName: PropTypes.string,  // 深层嵌套用
      pageProps: PropTypes.object,
    };

    static childContextTypes = {
      parentName: PropTypes.string,
    };

    ConnectedComponent;

    state = {
      fieldName: '',
    };

    constructor(props, ctx) {
      super(props, ctx);

      const fieldName = getFieldName(props, ctx);
      this.state = {
        fieldName,
      };

      const connectOpts = generateConnectOpts(props, fieldName);

      this.ConnectedComponent = connect(
        connectOpts.mapStateToProps,
        connectOpts.mapDispatchToProps,
        connectOpts.mergeProps,
      )(props.component || defaultComponent);
    }

    componentWillMount() {
      this.registField();
    }

    componentWillReceiveProps(nextProps, nextContext) {
      const oldFieldName = this.state.fieldName;
      const newFieldName = getFieldName(nextProps, nextContext);
      if (oldFieldName !== newFieldName) {
        this.registField(newFieldName, nextProps.defaultValue);
        const connectOpts = generateConnectOpts(nextProps, newFieldName);
        this.ConnectedComponent = connect(
          connectOpts.mapStateToProps,
          connectOpts.mapDispatchToProps,
          connectOpts.mergeProps,
        )(nextProps.component);
        this.setState({
          fieldName: newFieldName,
        });
      }
    }

    registField(fieldName?: string, defaultValue?: any) {
      if (this.context.store && this.context.store.dispatch) {
        this.context.store.dispatch(addField(fieldName || this.state.fieldName, defaultValue || this.props.defaultValue));
      }
    }

    getChildContext() {
      return {
        parentName: this.state.fieldName,
      };
    }

    render() {
      const ownProps = Object.keys(omit(this.props, [
        'fullName', 'component', 'defaultValue', 'name',
        'mapStateToProps', 'mapDispatchToProps', 'mergeProps',
      ])).reduce((r, c) => {
        if (typeof this.props[c] === 'string' && /^actions\.(\w+)$/.test(this.props[c])) {
          r[c] = this.context.pageProps[RegExp.$1];
        } else {
          r[c] = this.props[c];
        }
        return r;
      }, {} as any);

      ownProps['data-name'] = this.state.fieldName; // RE 子组件用

      Object.assign(ownProps, mapStoreToProps(
        this.context.store,
        {
          fieldName: this.state.fieldName,
          ...ownProps,
        }) || {});
      return React.createElement(this.ConnectedComponent, ownProps, this.props.children);
    }
  }
}

export default fieldHOC();
