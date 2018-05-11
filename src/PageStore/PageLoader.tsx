import * as React from 'react';
import { fakePropTypes, Defer } from './utils';

const txtMap: any = {
  loading: '加载中...',
  failed: '加载失败...',
  succeed: '加载成功...',
};

export default class PageLoader extends React.Component<PageLoaderProps, PageLoaderState> {
  static contextTypes = {
    _internalContainer_: fakePropTypes,
  };

  static defaultProps: Partial<PageLoaderProps> = {
  };

  container?: InternalContainer;

  state: PageLoaderState = {
    status: 'loading',
  };

  component?: React.ComponentClass;

  constructor(props, ctx) {
    super(props, ctx);
    this.container = ctx._internalContainer_;
    if (this.props.url && this.props.component) {
      throw new Error('Do not set both url and component at the same time.');
    }
    this.component = this.props.component;
  }

  componentWillMount() {
    if (this.props.url) {
      this.loadScript(this.props.url, this.props.namespace);
    } else {
      this.loadComponent(this.props.component);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.component && nextProps.component !== this.props.component) {
      this.component = nextProps.component;
    } else if (this.props.url !== nextProps.url || this.props.namespace !== nextProps.namespace) {
      const tmp = this.context._internalContainer_.getModule(this.props.namespace);
      if (tmp) {
        this.component = tmp.mod;
      } else {
        this.loadScript(nextProps.url, nextProps.namespace);
      }
    }
  }

  loadComponent(Klass) {
    this.context._internalContainer_.addModule(this.props.namespace, Klass);
  }

  async loadScript(url: string, ns: string) {
    const existed = this.context._internalContainer_.getModule(ns);
    if (existed) {
      this.component = existed.mod;
      this.forceUpdate();
      return;
    }

    const script: HTMLScriptElement
      & { __defer__?: Defer<React.ComponentClass<any>> }
      = document.createElement('script');
    script.src = url;

    this.setState({
      status: 'loading',
    });

    script.onload = () => {
      this.setState({
        status: 'succeed',
      });
    }

    script.onerror = () => {
      this.setState({
        status: 'failed',
      });
      script.__defer__ = undefined;
    }

    const defer = new Defer<React.ComponentClass<any>>();
    defer.promise.then(component => {
      this.context._internalContainer_.addModule(ns, component);
      this.component = component;
      this.forceUpdate();
    });
    script.__defer__ = defer;

    document.body.appendChild(script);
    return defer.promise;
  }

  render() {
    if (this.component) {
      return <this.component {...this.props} />;
    }
    return (
      <div className="page-store-loader">
        {txtMap[this.state.status]}
      </div>
    );
  }
}
