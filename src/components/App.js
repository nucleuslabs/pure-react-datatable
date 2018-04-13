import React, {Fragment} from 'react';
import ErrorBoundary from './ErrorBoundary';
import {hot} from 'react-hot-loader'
import DataTable from './DataTable';
import StarEmpty from '../icons/star-empty.svg';
import StarFull from '../icons/star-solid.svg';
import CheckCircle from '../icons/check-circle.svg';
import TimesCircle from '../icons/times-circle.svg';
import css from '../styles/misc.less';
import JOBS from '../data/jobs';
import CLIENTS from '../data/clients';
import SortIcon from '../icons/sort';
import SortUp from '../icons/sort-up';
import SortDown from '../icons/sort-down';
import Icon from './Icon';

import cssBridge from '../styles/bridge';
import cssCustom from '../styles/datatable';

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
            data: CLIENTS.slice(start,start+length),
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

function App() {

    return (
        <ErrorBoundary>
            <h1>DataTable Examples</h1>
            {/*<h2>Local data, datatables.net CSS</h2>*/}
            {/*<DataTable theme={cssBridge} {...jobsTable} />*/}
            <h2>Remote data, custom CSS</h2>
            <DataTable theme={cssCustom} {...config} />
        </ErrorBoundary>
    )
}

export default hot(module)(App);