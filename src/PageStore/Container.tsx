import * as React from 'react';
import { internalActionType } from './constants';
import { createContainer } from './containerInst';
import { fakePropTypes } from './utils';
import PageLoader from './PageLoader';

export default class Container extends React.Component<any, any> {
  static childContextTypes = {
    _internalContainer_: fakePropTypes,
  };

  static PageLoader = PageLoader;

  pageMap: PageModule[] = [];
  _internalContainer_: InternalContainer;

  constructor(props) {
    super(props);
    this._internalContainer_ = {
      registerStore: (model, namespace: string) => {
        if (!namespace) {
          throw new Error('namespace is required.');
        }
        const pageFound = this.pageMap.filter(d => d.namespace === namespace)[0];
        if (pageFound) {
          pageFound.namespace = namespace;
          pageFound.model = model;
          model.dispatch({ type: internalActionType.registered, payload: { namespace } });
        } else {
          throw new Error('moduleId is not found. Please make sure module is loaded first.')
        }
      },
      // 跨 store 通知
      notify: async (action, namespace?: string): Promise<void> => {
        if (namespace) {
          const pageFound = this.pageMap.filter(d => d.namespace === namespace)[0];
          if (pageFound && pageFound.model) {
            await pageFound.model.dispatch(action);
          }
        } else {
          await Promise.all(this.pageMap.map(p => {
            if (p.model) {
              return p.model.dispatch(action);
            } else {
              return Promise.resolve();
            }
          }));
        }
      },
      getModule: (namespace: string) => {
        return this.pageMap.filter(d => d.namespace === namespace)[0];
      },
      addModule: (namespace: string, mod: React.ComponentClass<any>) => {
        const page = this.pageMap.filter(p => p.namespace === namespace)[0];
        if (!page) {
          this.pageMap.push({
            mod,
            model: null,
            namespace,
          });
        }
      },
    };
  }

  componentWillMount() {
    // 用来简化业务逻辑 Model 获取其他 Model，挂在全局下
    createContainer(this._internalContainer_);
  }

  getChildContext() {
    return { _internalContainer_: this._internalContainer_ };
  }

  render() {
    (window as any)._c = this;
    const Cls = React.Fragment || 'div';
    return <Cls>{React.Children.toArray(this.props.children)}</Cls>;
  }
}
