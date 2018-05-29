import * as React from 'react';
import moment from 'moment';

import sso from '../../data/sso.json';
import sgt from '../../data/sgt.json';
import shoac from '../../data/shoac.json';

import Typography from '@material-ui/core/Typography';

let data: Ticket[] = (sso as any[]).concat(sgt).concat(shoac);

interface Ticket {
    title: string;
    date: Date[];
    url: string;
    type?: string;
    price?: string;
    source?: SourceEnum;
    cover?: string;
    hall?: string;
}

enum SourceEnum {
    Shoac = 'shoac',
    Sgt = 'sgt',
    Sso = 'sso'
}

function formatTitle(str: string) {
    return str.replace(/<\/BR>/gi, ' ';)
}

class TicketComponent extends React.PureComponent<any, any> {

    render() {
        let date = moment();
        return (
            <React.Fragment>
                {new Array(360).fill(1).map((t, i) => {
                    date.add(1, 'd');

                    let todayTicket = data.filter(t => {
                        return t.date.some(p => {
                            let ticketDate = moment(p);
                            return ticketDate.date() === date.date() && ticketDate.month() === date.month() && ticketDate.year() === date.year();
                        })
                    });

                    return todayTicket.length ? <React.Fragment>
                        <Typography>{date.format('YYYY-MM-DD')}</Typography>
                        {todayTicket.map(t => <React.Fragment>
                            <Typography><a href={t.url}>{formatTitle(t.title)}</a></Typography>
                        </React.Fragment>)}
                    </React.Fragment> : null;

                })}
            </React.Fragment>
        );
    }
}

export default TicketComponent;
