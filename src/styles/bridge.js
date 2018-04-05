import theme from './datatable.less';
import css from './misc.less';

export default {
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
}