import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { fakePropTypes } from './utils';
// import { ConnectedRouter } from 'react-router-redux';

export default (storeWrapper, View, contextTypes = {}, modelOptions?: { model: any }) => {
  const childContextTypes = Object.keys(contextTypes).reduce((rtn, c) => Object.assign(rtn, { [c]: fakePropTypes }), {});

  const PageStore = class _PageStore extends React.Component<any, any> {
    static childContextTypes = {
      ...childContextTypes,
    };
    static displayName = `Page:${View.displayName || View.name || 'AnoymousView'}`;
    store;
    form;
    View;
    visibleCfg: { [key: string]: (state: any) => boolean }

    static contextTypes = {
      _internalContainer_: fakePropTypes,
    }

    constructor(props, ctx) {
      super(props, ctx);
      this.View = connect(
        state => ({ ...state, ...storeWrapper.getters }),
        dispatch => ({
          ...storeWrapper.dispatchActions,
          ...storeWrapper.dispatchThunks,
          form: storeWrapper.form,
          dispatch,
          ...storeWrapper.dispatchActions,
          ...storeWrapper.dispatchThunks,
        }),
      )(View)/*(storeWrapper.history ? props => (
        <ConnectedRouter history={storeWrapper.history} store={storeWrapper.store}>
          <this.View {...props} />
        </ConnectedRouter>
      ) : View);*/
      this.form = storeWrapper.form;
      this.store = storeWrapper.store;
    }

    componentWillMount() {
      this.register();
    }

    componentDidMount() {
      this.getForm();
    }

    getChildContext() {
      return contextTypes;
    }

    getForm = () => {
      if (typeof this.props.getForm === 'function') {
        this.props.getForm(storeWrapper.form);
      }
    }

    register = () => {  // 注册 store
      if (!this.context._internalContainer_ || !modelOptions) {
        return;
      }
      this.context._internalContainer_.registerStore(
        modelOptions.model,
        this.props.namespace,
      );
    }

    render() {
      return (
        <Provider store={storeWrapper.store}>
          <this.View {...this.props} />
        </Provider>
      );
    }
  };
  return PageStore;
}
