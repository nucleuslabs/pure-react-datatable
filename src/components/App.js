import React, {Fragment} from 'react';
import ErrorBoundary from './ErrorBoundary';
import {hot} from 'react-hot-loader'
import DataTable from './DataTable';
import StarEmpty from '../icons/star-empty.svg';
import StarFull from '../icons/star-solid.svg';
import CheckCircle from '../icons/check-circle.svg';
import TimesCircle from '../icons/times-circle.svg';
import Icon from './Icon';
import css from '../styles/misc.less';
import JOBS from '../data/jobs';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

// https://datatables.net/manual/server-side

const SAMPLE_DATA = [
    {
        _id: 14770,
        firstName: "Christopher",
        lastName: "Peek",
        fileNo: 'N0830671',
        dob: '14-May-1983',
        age: '34 yrs',
        active: true,
        gender: 'M',
        starred: true,
    },
    {
        _id: 64701,
        firstName: "Tonya",
        lastName: "Carr",
        fileNo: 'N1100308',
        dob: '31-Mar-1977',
        age: '40 yrs',
        active: false,
        gender: 'F',
        starred: false,
    },
]


const config = {
    
    async data({draw,start,length,search,order,columns}) {
        await sleep(750); // pretend we're waiting for the server :p
        // console.log(draw,start,length,search,order,columns);
        return {
            draw,
            recordsTotal: SAMPLE_DATA.length,
            recordsFiltered: Math.min(SAMPLE_DATA.length,length),
            data: SAMPLE_DATA.slice(start,start+length),
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
    lengthMenu: null,
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
}

import cssBridge from '../styles/bridge';
import cssCustom from '../styles/datatable';

function App() {

    return (
        <ErrorBoundary>
            <h1>DataTable Examples</h1>
            <h2>Local data, datatables.net CSS</h2>
            <DataTable theme={cssBridge} {...jobsTable} />
            <h2>Remote data, custom CSS</h2>
            <DataTable theme={cssCustom} {...config} />
        </ErrorBoundary>
    )
}

export default hot(module)(App);