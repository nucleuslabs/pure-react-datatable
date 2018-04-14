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
    sort1: 'sorting_1',
    sort2: 'sorting_2',
    sort3: 'sorting_3',
    sort4: 'sorting_3', // datatables.net stops at 3
    sort5: 'sorting_3',
    sort6: 'sorting_3',
    processing: 'dataTables_processing',
    pageNumberSpacer: 'ellipsis',
}