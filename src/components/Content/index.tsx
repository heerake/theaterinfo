import * as React from 'react';
import { Route } from 'react-router-dom';
import DashBoard from './../../pages/DashBoard/index';

export default class Content extends React.Component<any, any> {
  render() {
    return (
      <div className="content">
        <Route path="/" component={DashBoard} />
      </div>
    );
  }
}
