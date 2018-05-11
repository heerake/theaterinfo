import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import Layout from './../components/Layout/index';
import './index.less';

if (process.env.NODE_ENV === 'dev' && (module as any).hot) {
  (module as any).hot.accept();
}

class HellowWorld extends React.Component<{}, any> {
  render() {
    return (
      <Router>
        <Layout />
      </Router>
    );
  }
}

render(<HellowWorld />, document.body.querySelector('#root'));
