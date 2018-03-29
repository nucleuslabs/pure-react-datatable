# pure-react-datatable

A somewhat API-compatible replacement for the fantastic [DataTables](https://datatables.net/) library, written in pure React (no jQuery) so that you can use JSX and click handlers in your data cells.

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

etc.

### License

MIT.

