import * as React from 'react';
import { Link } from 'react-router-dom';

export default class Banner extends React.PureComponent<any, any> {
  render() {
    return (
      <ul>
        <li><Link to="/">HOME</Link></li>
        <li><Link to="/about">ABOUNT</Link></li>
        <li><Link to="/contact">CONTACT</Link></li>
      </ul>
    );
  }
}
