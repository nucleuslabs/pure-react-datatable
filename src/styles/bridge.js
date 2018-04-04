import css from './datatable.less';

export default {
    wrapper: "dataTables_wrapper",
    table: ["dataTable","display","no-footer"],
    odd: "odd",
    even: "even",
    empty: "dataTables_empty",
    pagination: ["dataTables_paginate",css.screenOnly],
    button: "paginate_button",
    pageInfo: "dataTables_info",
    search: ["dataTables_filter",css.screenOnly],
    length: ["dataTables_length",css.screenOnly],
    current: "current",
    disabled: "disabled",
    searchText: css.printOnly,
    pageXofY: css.printOnly,
}