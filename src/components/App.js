import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import {hot} from 'react-hot-loader'
import DataTable from './DataTable';
import StarEmpty from '../icons/star-empty.svg';
import CheckCircle from '../icons/check-circle.svg';
import TimesCircle from '../icons/times-circle.svg';
import Icon from './Icon';
import css from '../styles/misc.less';


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve,ms));
}

// https://datatables.net/manual/server-side

const SAMPLE_DATA = [
    {
        firstName: "Christopher",
        lastName: "Peek",
        fileNo: '14770',
        dob: '14-May-1983',
        age: '34 yrs',
        active: true,
        gender: 'M',
    },
    {
        firstName: "Tonya",
        lastName: "Carr",
        fileNo: '64701',
        dob: '31-Mar-1977',
        age: '40 yrs',
        active: false,
        gender: 'F',
    },
]


const config = {
    
    async data({draw,start,length,search,order,columns}) {
        await sleep(500); // pretend we're waiting for the server :p
        return {
            draw,
            recordsTotal: SAMPLE_DATA.length,
            recordsFiltered: Math.min(SAMPLE_DATA.length,length),
            data: SAMPLE_DATA.slice(start,start+length),
        }
    },
    
    columns: [
        {
            title: <Icon><StarEmpty/></Icon>,
            data: 'starred',
            render: _ => <Icon><StarEmpty/></Icon>,
            className: css.center,
        },
        {
            title: "Last Name",
            data: 'lastName',
        },
        {
            title: "First Name",
            data: 'firstName',
        },
        {
            title: "File #",
            data: 'fileNo',
        },
        {
            title: "DOB",
            data: 'dob',
        },
        {
            title: "Age",
            data: 'age',
        },
        {
            title: "Active",
            data: 'active',
            render: ({data}) => data 
                ? <Icon className={css.active}><CheckCircle/></Icon>
                : <Icon className={css.inactive}><TimesCircle/></Icon>,
                
                
            className: css.center,
        },
    ]
}

function App() {

    return (
        <ErrorBoundary>
            <DataTable theme={require('../styles/datatable.less')} {...config} />
        </ErrorBoundary>
    )
}

export default hot(module)(App);