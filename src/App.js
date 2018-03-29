import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import {hot} from 'react-hot-loader'
import DataTable from './DataTable';


const config = {
    
    columns: [
        {
            data: 'starred',
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
        },
    ]
}

function App() {

    return (
        <ErrorBoundary>
            <DataTable theme={require('./theme.less')} {...config} />
        </ErrorBoundary>
    )
}

export default hot(module)(App);