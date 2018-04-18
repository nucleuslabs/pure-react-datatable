# pure-react-datatable

A somewhat API-compatible replacement for the fantastic [DataTables](https://datatables.net/) library, written in pure React (no jQuery) so that you can use JSX and click handlers in your data cells.

### Installation

```sh
yarn add pure-react-datatable
npm i pure-react-datatable
```

### Example

The entire repo is actually an example. We use [rollup](https://rollupjs.org/guide/en) to extract just the `<DataTable>` component and its dependencies for publishing. See `src/components/App.js` for a good starting point.

You can clone the repo and run GNU `make` to install all the dependencies and start a webpack development server.

A basic example that looks *almost* identical to [the one on datatables.net](https://datatables.net/examples/data_sources/js_array.html):

```js
import DataTable from 'pure-react-datatable';

const jobsTable = {
    data: JOBS,
    columns: [
        { title: "Name" },
        { title: "Position" },
        { title: "Office" },
        { title: "Extn." },
        { title: "Start date" },
        { title: "Salary" }
    ],
    searchDelay: 16,
};

function App() {

    return (
        <ErrorBoundary>
            <h1>Example</h1>
            <DataTable theme={bridge} {...jobsTable} />
        </ErrorBoundary>
    )
}
```

Where `bridge` is either a CSS file compiled with [CSS modules](https://github.com/webpack-contrib/css-loader#modules), or a mapping from `pure-react-datatable` class names to datatables.net class names (if you want to re-use existing styles you already have:

```css
{
    wrapper: "dataTables_wrapper",
    table: ["dataTable","display","no-footer"],
    odd: "odd",
    even: "even",
    empty: "dataTables_empty",
    pagination: ["dataTables_paginate",theme.screenOnly],
    button: "paginate_button",
    pageInfo: "dataTables_info",
    search: ["dataTables_filter",theme.screenOnly],
    length: ["dataTables_length",theme.screenOnly],
    current: "current",
    disabled: "disabled",
    searchText: theme.printOnly,
    pageXofY: theme.printOnly,
    sortAsc: 'sorting_asc',
    sortDesc: 'sorting_desc',
    orderable: 'sorting',
    sortIcon: css.displayNone,
    sort1: 'sorting_1',
    sort2: 'sorting_2',
    sort3: 'sorting_3',
    sort4: 'sorting_3', // datatables.net stops at 3
    sort5: 'sorting_3',
    sort6: 'sorting_3',
    processing: 'dataTables_processing',
    pageNumberSpacer: 'ellipsis',
}
```

Where `screenOnly` and `printOnly` are simply:

```
@media print {
    .screenOnly {
        display: none;
    }
}

@media screen {
    .printOnly {
        display: none;
    }
}
```

We use these to provide a better printing experience; there's no sense printing a drop-down length menu on paper.

### Styling

`pure-react-datatable` provides *no* styling so that you can customize it to match your app. Don't worry, it's super easy!

If you're using CSS modules (which I highly recommend), it's as easy as:

```jsx
<DataTable theme={require('yourtheme.css')} />
```

If not, you'll have to create a mapping between the CSS class names that DataTable expects and your global CSS class names, like so:

```js
const theme = {
    table: 'datatable_table',
    tr: 'datatable_tr',
}
```

If you `styled-components` or similar CSS-in-JS, you're hooped. You can use the undocumented `cellComponent` and `rowComponent` props to provide your custom styled components, but `<DataTable>` isn't *fully* customizable yet.

The defaults for those are simple:

```js
function DataTableRow({attrs}) {
    return <tr {...attrs}/>;
}

function DataTableCell({attrs}) {
    return <td {...attrs}/>;
}
```

So they should be simple to override.

### Usage/integration

I recommend extending `pure-react-datatable` with some defaults so that you don't have to keep repeating props throughout your app:

```js
import React from 'react';
import PureDataTable from 'pure-react-datatable';
import bridge from './bridge';
import {defaultsDeep} from 'lodash';

export default function MyDataTable({...props}) {
    defaultsDeep(props, {
        theme: bridge,
        lengthMenu: null,
        length: 25,
    });
    return <PureDataTable {...props} />;
}
```

### Data

Client-side data is not fully implemented. However, you can implement it in userland if you feel inclined (if you do, please share). The `data` prop is a function that feeds you all the information you need to do searching and sorting yourself:

```js
async data({draw,start,length,search,order,columns}) {
    return {
        draw,
        recordsTotal: CLIENTS.length,
        recordsFiltered: CLIENTS.length,
        data: CLIENTS.slice(start,start+length),
    }
}
```

It expects you to return a `Promise`, so you can either do this client-side or send the arguments to your server and do it there. BYO ajax library.

If you simply forward these arguments to your server, it should work with any existing endpoints you have, if you previously used datatables.net -- as long as you are using the 1.10+ API (hungarian notation not supported).

### License

MIT.

