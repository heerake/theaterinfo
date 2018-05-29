import * as React from 'react';
import { Link, Route } from 'react-router-dom';
import Ticket from '../../pages/Ticket';
import Theater from '../../pages/Theater';
import About from '../../pages/About';
import Other from '../../pages/Other';


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
                <ul>
                    <li>
                        <Link to="/">Ticket</Link>
                    </li>
                    <li>
                        <Link to="/Theater">Theater</Link>
                    </li>
                    <li>
                        <Link to="/About">About</Link>
                    </li>
                    <li>
                        <Link to="/Other">Other</Link>
                    </li>
                </ul>

                <Route exact path="/" component={Ticket} />
                <Route path="/Theater" component={Theater} />
                <Route path="/About" component={About} />
                <Route path="/Other" component={Other} />
            </div>
        );
    }
}
