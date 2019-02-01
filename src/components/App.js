import React, {Fragment} from 'react';
import ErrorBoundary from './ErrorBoundary';
import {hot} from 'react-hot-loader';
import DataTable from './DataTable';
import StarEmpty from '../icons/regular/star.svg';
import StarFull from '../icons/regular/star-half.svg';
import CheckCircle from '../icons/solid/check-circle.svg';
import TimesCircle from '../icons/solid/times-circle.svg';
import css from '../styles/misc.less';
import JOBS from '../data/jobs';
import CLIENTS from '../data/clients';
import SortIcon from '../icons/solid/sort.svg';
import SortUp from '../icons/solid/sort-up.svg';
import SortDown from '../icons/solid/sort-down.svg';
import Icon from './Icon';

import cssBridge from '../styles/bridge';
import cssCustom from '../styles/datatable';
//import PlusCircle from '../icons/solid/plus-circle.svg';
//import MinusCircle from '../icons/solid/minus-circle.svg';
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

// function Processing({theme,refs}) {
//     const style = {};
//     console.log('processing');
//     if(refs.wrapper && refs.tbody) {
//         const wrapRect = refs.wrapper.getBoundingClientRect();
//         const tbodyRect = refs.tbody.getBoundingClientRect();
//         style.top = tbodyRect.top - wrapRect.top + 1;
//         style.bottom = wrapRect.bottom - tbodyRect.bottom;
//         console.log(wrapRect.top,tbodyRect.top,style.top);
//     }
//     return <div className={theme.processing} style={style}>Loading…</div>;
// }

class Processing extends React.Component {


    componentDidMount() {
        if(!this.div) return;
        // setTimeout(() => {
            const wrapper = this.div.parentElement;
            const tbody = wrapper.querySelector('table>tbody');

            const wrapRect = wrapper.getBoundingClientRect();
            const tbodyRect = tbody.getBoundingClientRect();
            // console.log(JSON.stringify(wrapRect));
            // console.log(JSON.stringify(tbodyRect));

            this.div.style.top = `${tbodyRect.top - wrapRect.top + 1}px`;
            this.div.style.bottom = `${wrapRect.bottom - tbodyRect.bottom}px`;
        // },0);
    }

    render() {
        return <div className={this.props.theme.processing} ref={n => this.div = n}>Loading…</div>
    }
}

const config = {
    // https://datatables.net/manual/server-side
    async data({draw,start,length,search,order,columns}) {
        await sleep(750); // pretend we're waiting for the server :p
        // console.log(draw,start,length,search,order,columns);
        return {
            draw,
            recordsTotal: CLIENTS.length,
            recordsFiltered: CLIENTS.length,
            data: length == -1 ? CLIENTS : CLIENTS.slice(start,start+length),
        }
    },
    /* Add sublist functionality to datatable */
    sublist: {
        /* Change default open icon - Default: <PlusCircle/> */
        // iconOpen: <Icon><PlusCircle/></Icon>,
        /* Change default close icon - Default: <MinusCircle/> */
        // iconClose: <Icon><MinusCircle/></Icon>,
        /* Modify the column width - Default: '15px' */
        // width: '50px',
        /* Conditionally hide the toggle for the given row based on row value - Default: Show all rows */
        // hide: ({row}) => row._id === 30608,
        /* Column Title - Default: '' */
        // title: '*',
        /* Restrict more than one item been open at once - Default: false */
        accordion: true,
        render: ({row}) => {
            return <div><strong>Comments:</strong> <em>{row.comments}</em></div>;
        }
    },
    columns: [
        {
            title: <Icon><StarEmpty title="Star"/></Icon>,
            data: 'starred',
            render: ({data}) => data
                ? <Icon className={css.star}><StarFull/></Icon>
                : <Icon className={css.nostar}><StarEmpty/></Icon>,
            className: css.center,
        },
        {
            title: "Last Name",
            data: 'lastName',
        },
        {
            title: "First Name",
            data: 'firstName',
            orderable: false,
        },
        {
            title: "File #",
            data: 'fileNo',
            className: css.mono,
        },
        {
            title: "DOB (Age)",
            render: ({row}) => <Fragment>{row.dob} ({row.age})</Fragment>
        },
        {
            title: "Active",
            data: 'active',
            render: ({data}) => data
                ? <Icon className={css.active}><CheckCircle/></Icon>
                : <Icon className={css.inactive}><TimesCircle/></Icon>,
            className: css.center,
        },
    ],
    order: ['lastName','asc'],
    lengthMenu: null,
    language: {
        sortIcons: {
            ascending: <Icon className={cssCustom.sortIcon}><SortUp/></Icon>,
            descending: <Icon className={cssCustom.sortIcon}><SortDown/></Icon>,
            unsorted: <Icon className={cssCustom.sortIcon}><SortIcon/></Icon>,
        },
        loadingRecords: '',
        processing: Processing,
    }
}



const jobsTable = {
    // https://datatables.net/examples/data_sources/js_array.html
    data: JOBS,
    columns: [
        { title: "Name" },
        { title: "Position" },
        { title: "Office" },
        { title: "Extn.", orderable: false },
        { title: "Start date" },
        { title: "Salary", className: css.right }
    ],
    searchDelay: 16,
    lengthMenu: [5,10,20,100],
};

const ButtonRow = ({children}) => <div className={css.buttonRow}>{children}</div>;

class ActionButton extends React.Component {

    click = ev => {
        ev.preventDefault();
        if(this.props.onClick) {
            this.props.onClick(ev);
        }
    };

    render() {
        return <button className={css.button} {...this.props} onClick={this.click}/>;
    }
}

class App extends React.Component {

    api = (api) => {
        this.dt = api;
    };

    fullReset = ev => {
        this.dt.draw('full-reset');
    }

    fullHold = ev => {
        this.dt.draw('full-hold');
    }

    page = ev => {
        this.dt.draw('page');
    }


    render() {

        return (
            <ErrorBoundary>
                <h1>DataTable Examples</h1>
                <h2>Local data, datatables.net CSS</h2>
                <DataTable theme={cssBridge} {...jobsTable} />
                <h2>Remote data, custom CSS</h2>
                <DataTable api={this.api} theme={cssCustom} {...config}/>
                <ButtonRow>
                    <ActionButton onClick={this.fullReset}>full-reset</ActionButton>
                    <ActionButton onClick={this.fullHold}>full-hold</ActionButton>
                    <ActionButton onClick={this.page}>page</ActionButton>
                </ButtonRow>
            </ErrorBoundary>
        )
    }
}

export default hot(module)(App);