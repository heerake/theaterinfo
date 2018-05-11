import * as React from 'react';
import Banner from '../Banner';
import Content from '../Content';
import Footer from '../Footer';

export interface LayoutProps {
}

export interface LayoutState {
}

export default class Layout extends React.PureComponent<LayoutProps, LayoutState> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Banner />
        <Content />
        <Footer />
      </div>
    );
  }
}
