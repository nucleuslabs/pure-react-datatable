import React from 'react';
import {render} from "@testing-library/react";
import ErrorBoundary from '../src/components/ErrorBoundary';
import DataTable from '../dist/main';
import JOBS from '../src/data/jobs';

const jobsTable = {
    // https://src/datatables.net/examples/src/data_sources/js_array.html
    data: JOBS,
    columns: [
        { title: "Name", render: ({meta, data}) => <div data-testid={`name-${meta.row}`}>{data}</div>},
        { title: "Position" },
        { title: "Office" },
        { title: "Extn.", orderable: false },
        { title: "Start date" },
        { title: "Salary"}
    ],
    searchDelay: 16,
    lengthMenu: [5,10,20,100],
};

class App extends React.Component {
    page = () => {
        this.dt.draw('page');
    };


    render() {

        return (
            <ErrorBoundary>
                <h1>DataTable Examples</h1>
                <h2>Local data, datatables.net CSS</h2>
                <DataTable {...jobsTable} />
            </ErrorBoundary>
        )
    }
}

test("Test to see if the dist version of datatable renders and data appears in first column of the first row", async () => {
    let {getByTestId} = render(<App/>);
    expect(getByTestId("name-0").innerHTML.trim()).toBe('Tiger Nixon');
    expect(getByTestId("name-4").innerHTML.trim()).toBe('Airi Satou');

});