import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Store } from 'redux';

const formItemHOC = (FormItem, mapStoreToProps: (store: Store<any>, ownProps?: any, error?: string | null) => any = () => { }) => {
  function getCurrentLink(link, fullLink, parentLink) {
    if (fullLink) {
      return fullLink;
    } else if (parentLink && link) {
      return `${parentLink}.${link}`;
    } else if (!!parentLink !== !!link) {
      return parentLink || link;
    } else {
      return '';
    }
  }

  return class XFormItem extends React.Component<{ [key: string]: any } & { link?: string, fullLink?: string }, any> {
    static contextTypes = {
      store: PropTypes.any,
      getError: PropTypes.func,
      parentLink: PropTypes.string,
      visibleFunc: PropTypes.func,
    };

    static childContextTypes = {
      parentLink: PropTypes.string,
    };

    static defaultProps = {
      link: '',
    };

    state = {
      error: null,
      currentLink: '',
    };

    constructor(props, ctx) {
      super(props, ctx);
      this.state = {
        error: null,
        currentLink: getCurrentLink(props.link, props.fullLink, ctx.parentLink),
      };
    }

    getChildContext() {
      return {
        parentLink: this.state.currentLink,
      };
    }

    componentWillReceiveProps(nextProps, nextContext) {
      let nextLink = this.state.currentLink;
      if (nextProps.link !== this.props.link || nextProps.fullLink !== this.props.fullLink) {
        nextLink = getCurrentLink(nextProps.link, nextProps.fullLink, nextContext.parentLink);

        this.setState({
          currentLink: nextLink,
        });
      }

      // 每次更新的时候挂一个校验回调
      if (nextLink && nextLink !== nextContext.parentLink) {
        nextContext.getError(nextLink, errors => {
          this.setState({
            error: errors.length ? errors.map(d => d.message).join('；') : null,
          });
        });
      }
    }

    render() {
      if (this.context.visibleFunc(this.state.currentLink) === false) {
        return null;
      }

      return (
        <FormItem
          help={this.state.error || this.props.help}
          validateStatus={this.state.error ? 'error' : 'success'}
          {...(mapStoreToProps(
            this.context.store,
            {
              ...this.props,
              fullLink: this.state.currentLink,
            },
            this.state.error
          ) || {}
          )}
          {...this.props}
        />
      );
    }
  };
};
export default formItemHOC;
