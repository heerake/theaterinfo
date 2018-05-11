import * as React from 'react';
import { modelDecorator } from '../../PageStore/Model';
import Field from '../../PageStore/Field';
import DashBoardModel from './Model';

@modelDecorator(new DashBoardModel)
class DashBoard extends React.PureComponent<any, any> {
  render() {
    return (
      <React.Fragment>
        <h1>Theater Ticket Info</h1>
      </React.Fragment>
    );
  }
}

export default DashBoard;
