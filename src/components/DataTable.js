import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import cc from 'classcat';
import {
    call,
    debounce,
    getValue,
    isFunction,
    defaultsDeep,
    mergeState,
    range,
    render,
    clamp,
    deepMerge,
    arraySplice, pick, __map, isString, isArray
} from '../util';

import ActionLink from './ActionLink';

const ASC = 'asc';
const DESC = 'desc';
const PAGE_LINKS = 7; // todo: make this a prop/option?

class PureDataTable extends React.Component {

    _ajaxCounter = 0;

    constructor(props) {
        super(props);
        this._refresh = debounce(this._refreshNow, this.props.searchDelay);
        this.state = {
            ...pick(props, ['start', 'length', 'search', 'order']),
            recordsTotal: null,
            recordsFiltered: null,
            data: [],
            loading: true,
            error: null,
        }
        this._refs = {}
    }

    componentDidMount() {
        this._refreshNow();
    }

    componentDidUpdate(prevProps) {
        if(this.props.data !== prevProps.data) {
            this._refresh();
        }
    }

    async _refreshNow(partialState) {
        let state = this.state;
        if(partialState) {
            state = deepMerge(state, partialState);
        }
        if(isFunction(this.props.data)) {
            this.setState({loading: true})
            // https://datatables.net/manual/server-side
            let resp = await this.props.data({
                draw: ++this._ajaxCounter,
                start: state.start,
                length: this.props.paging ? state.length : -1,
                search: state.search,
                order: state.order.map(([column, dir]) => ({column, dir})),
                columns: this.props.columns.map(c => pick(c, {
                    data: undefined,
                    name: undefined,
                    orderable: true,
                    search: {
                        value: '',
                        regex: false,
                    },
                    searchable: true,
                })),
            })
            if(resp.draw < this._ajaxCounter) return;
            // TODO: if resp.data.length === resp.recordsTotal, switch to client-side filtering??
            // TODO: if server over-fetches (returns enough for page 2) allow going to next page without re-fetching?
            const data = this.props.paging ? resp.data.slice(0, state.length) : resp.data;
            this.setState({
                data,
                loading: false,
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                error: resp.error,
            })
        } else if(Array.isArray(this.props.data)) {
            // TODO: pre-process the data; add a `key` and an integer version of number columns...
            let filteredData = this.props.data;
            if(state.search.value) {
                if(state.search.regex) {
                    try {
                        const re = new RegExp(state.search.value, 'i');
                        filteredData = filteredData.filter(row => this.props.columns.some((_, n) => {
                            return re.test(this._getValue(row, n, 'filter'))
                        }));
                    } catch(_) {
                    }
                } else {
                    const searchTerms = state.search.value.trim().toLocaleLowerCase().split(/\s+/);
                    filteredData = filteredData.filter(row => {
                        const values = this.props.columns.map((_, n) => this._getValue(row, n, 'filter').toLocaleLowerCase());
                        return searchTerms.every(term => {
                            return this.props.columns.some((_, n) => {
                                return values[n].includes(term);
                            })
                        })
                    });
                }
            }
            this.setState({
                data: this.props.paging ? filteredData.slice(state.start, state.start + state.length) : filteredData,
                recordsTotal: this.props.data.length,
                recordsFiltered: filteredData.length,
                loading: false,
            })
        }
    }

    // static async getDerivedStateFromProps(nextProps, prevState) {
    //     const data = await nextProps.data; // fixme: i don't think we're allowed to await.
    //     if(Array.isArray(data)) {
    //         if(!nextProps.data.length) {
    //             return {normData: []};
    //         }
    //         // const cols = Object.keys(nextProps.data[0]);
    //         const cols = nextProps.columns.map((c,i) => c.data === undefined ? i : data).filter(x => x !== null);
    //         const normData = data.map(row => {
    //             return cols.map(c => row[c].toLocaleLowerCase())
    //         })
    //         return {normData};
    //     }
    //     return null;
    // }

    get currentPage() {
        return Math.floor(this.state.start / this.state.length);
    }

    get pageCount() {
        return this.state.recordsFiltered == null ? 0 : Math.ceil(this.state.recordsFiltered / this.state.length);
    }

    _getValue(row, colIdx, type) {
        // https://datatables.net/reference/option/columns.render
        // TODO: support `type` and orthogonal data https://datatables.net/examples/ajax/orthogonal-data.html
        const col = this.props.columns[colIdx];
        if(col.data) {
            return getValue(row, col.data);
        } else {
            return row[colIdx];
        }
    }

    _isOrderable(n) {
        const col = this.props.columns[n];
        return col.orderable === undefined || col.orderable;
    }

    _lengthMenu = () => (
        <select value={this.state.length} onChange={this.changeLength} className={this.props.theme.lengthSelect}>
            {this.props.lengthMenu.map(len => (
                <option key={len} value={len}>{len}</option>
            ))}
        </select>
    )

    _searchInput = () => (
        <input type="search" value={this.state.search.value} onChange={this.changeSearch} className={this.props.theme.searchInput}/>
    )


    changeLength = ev => {
        this._setLength(parseInt(ev.target.value) || this.props.length)
    }

    changeSearch = ev => {
        this._refreshState({
            start: 0,
            search: {
                value: ev.target.value,
            }
        }, true);
    }

    _setLength = length => {
        let start = Math.floor(this.state.start / length) * length;
        this._refreshState({length, start});
    }

    handleLengthWheel = ev => {
        ev.preventDefault();
        let ticks = wheelTicks(ev);
        let idx = this.props.lengthMenu.indexOf(this.state.length);
        let next = idx + ticks;
        if(next >= 0 && next < this.props.lengthMenu.length) {
            this._setLength(this.props.lengthMenu[next]);
        }
    }

    _refreshState = (partialState, deb) => {
        this[deb ? '_refresh' : '_refreshNow'](partialState);
        this.setState(mergeState(partialState));
    }
    
    draw = (paging=true) => {
        // https://datatables.net/reference/api/draw()
        if(paging === 'full-reset' || paging === true) {
            this._refreshState({start: 0, search: {value:''}}, false);
        } else if(paging === 'full-hold' || paging === false) {
            // FIXME: what is the difference between "full-hold" and "page"??
            this._refreshNow();
        } else if(paging === 'page') {
            this._refreshNow();
        }
    }

    handlePageWheel = ev => {
        ev.preventDefault();
        this._incPage(wheelTicks(ev))(ev);
    }

    _incPage = amount => ev => {
        this._setPage(this.currentPage + amount)(ev);
    }

    _setPage = pg => ev => {
        // ev.preventDefault();
        pg = clamp(pg, 0, this.pageCount - 1);
        if(pg === this.currentPage) return;
        this._refreshState(({length}) => ({
            start: pg * length,
        }));
    }

    _sortColumn = n => ev => {
        // ev.preventDefault();
        if(!this._isOrderable(n)) return false;
        if(n < 0 || n >= this.props.columns.length) return false;
        const multiSort = ev.shiftKey || ev.ctrlKey;
        if(multiSort) {
            let idx = this.state.order.findIndex(o => o[0] === n);
            if(idx < 0) {
                this._refreshState({
                    order: order => [...order, [n, ASC]]
                })
            } else {
                this._refreshState({
                    order: order => arraySplice(order, idx, 1, order[idx][1] === ASC ? [[n, DESC]] : [])
                })
            }
        } else {
            let dir = this.state.order.length && this.state.order[0][0] === n && this.state.order[0][1] === ASC ? DESC : ASC;
            this._refreshState({
                start: 0,
                order: [[n, dir]]
            })
        }
    }

    // TODO: swipe right/left events?? assuming there's no horizontal scrolling

    render() {
        const {theme, columns, language, paging, columnKey, rowKey, lengthMenu, className, rowComponent, cellComponent} = this.props;
        const {data, loading, recordsFiltered, recordsTotal, start, length, search, order} = this.state;
        const {currentPage, pageCount} = this;

        const sortIdxMap = columns.map((col, n) => order.findIndex(o => o[0] === n));
        const sortDirMap = sortIdxMap.map(idx => idx < 0 ? null : order[idx][1]);
        // console.log(sortDirMap);
        const sortClassMap = {
            [ASC]: theme.sortAsc,
            [DESC]: theme.sortDesc,
        }

        const extraProps = {theme};

        return (
            <div className={cc([theme.wrapper, className, loading ? theme.loading : false])}>
                <div className={cc([theme.controlBar, theme.searchBar])}>

                    {language.lengthMenu && lengthMenu && lengthMenu.length
                        ? <div className={cc([theme.length])} onWheel={this.handleLengthWheel}>
                            {render(language.lengthMenu, {Menu: this._lengthMenu, ...extraProps})}
                        </div>
                        : null}

                    <div className={cc(theme.search)}>
                        {language.search
                            ? render(language.search, {Input: this._searchInput, ...extraProps})
                            : null}
                    </div>

                    {search.value ? <div className={cc(theme.searchText)}>
                        Search results for “{search.value}”
                    </div> : null}
                </div>

                <table role="grid" className={cc(theme.table)}>
                    <thead className={cc(theme.thead)}>
                        <tr role="row" className={cc([theme.tr, theme.hrow])}>
                            {columns.map((col, n) => {
                                let title = <span className={cc(theme.title)}>{call(col.title)}</span>;
                                const sortDir = sortDirMap[n];
                                const orderable = !!this._isOrderable(n);
                                let sortClass;
                                if(sortDirMap[n]) {
                                    sortClass = [theme.sorted, sortClassMap[sortDirMap[n]]];
                                } else if(orderable) {
                                    sortClass = theme.unsorted;
                                }
                                if(orderable) {
                                    title = (
                                        <ActionLink className={cc(theme.titleWrap)} onClick={this._sortColumn(n)}>
                                            {title}
                                            {orderable && language.sortIcons ? (!sortDir ? language.sortIcons.unsorted : (sortDir === ASC ? language.sortIcons.ascending : language.sortIcons.descending)) : null}
                                        </ActionLink>
                                    )
                                } else {
                                    title = (
                                        <span className={cc(theme.titleWrap)}>
                                            {title}
                                        </span>
                                    )
                                }

                                const {width, minWidth, maxWidth} = col;

                                // let sortDir = orderIdx < 0 ? null : order[orderIdx][1];
                                // console.log(orderIdx);
                                return (
                                    <th
                                        key={columnKey(col, n)}
                                        className={cc([theme.cell, theme.th, col.className, orderable ? theme.orderable : theme.unorderable, sortClass])}
                                        scope="col"
                                        role="columnheader"
                                        aria-sort={sortDirMap[n] ? (sortDirMap[n] === ASC ? 'ascending' : 'descending') : 'none'}
                                        style={{width, minWidth, maxWidth}}
                                    >
                                        {title}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length ? data.map((row, m) => {
                            const cells = columns.map((col, n) => {

                                // https://datatables.net/reference/option/columns.render


                                // console.log(row,col,m,n);
                                // let value;
                                // if(Array.isArray(row)) {
                                //     value 
                                // }
                                let value = this._getValue(row, n, 'display');
                                let cell;
                                if(col.render) {
                                    cell = render(col.render, {
                                        data: value,
                                        type: 'display',
                                        row,
                                        meta: {
                                            row: m,
                                            col: n,
                                        },
                                        dtState: {...this.state},
                                        ...extraProps
                                    });
                                } else {
                                    cell = value;
                                }

                                return {
                                    key: columnKey(col, n),
                                    attrs: {
                                        className: cc([theme.cell, theme.td, col.className, sortDirMap[n] ? [sortClassMap[sortDirMap[n]], theme.sorted, theme[`sort${sortIdxMap[n] + 1}`]] : theme.unsorted]),
                                        children: cell,
                                    },
                                    index: n,
                                    data: value,
                                    row: row,
                                    columnDef: col,
                                };
                            });

                            return render(rowComponent, {
                                key: rowKey(row, m),
                                attrs: {
                                    role: "row",
                                    className: cc([theme.tr, theme.drow, m % 2 === 0 ? theme.even : theme.odd]),
                                    children: cells.map(c => render(cellComponent,c)),
                                },
                                data: row,
                                index: m,
                            });
                            
                            // TODO: some kind of "End of list" padding so that the final page isn't shorter than the rest?
                            
                        }) : (
                            // TODO: some kind of filler cell component while the data is loading, so we have some lorem to put behind the loading splash?
                            loading ? (
                                <tr className={[theme.tr]}>
                                    <td className={cc([theme.td, theme.loadingRecords, theme.empty])} colSpan={columns.length}>{language.loadingRecords}</td>
                                </tr>
                            ) : (recordsTotal > 0 ? (<tr className={[theme.tr]}>
                                    <td className={cc([theme.td, theme.zeroRecords, theme.empty])} colSpan={columns.length}>{language.zeroRecords}</td>
                                </tr>) : (
                                    <tr className={[theme.tr]}>
                                        <td className={cc([theme.td, theme.noData, theme.empty])} colSpan={columns.length}>{language.emptyTable}</td>
                                    </tr>
                                )
                            ))}
                    </tbody>
                </table>

                <div className={cc([theme.controlBar, theme.infoBar])}>
                    {language.info ? <div className={cc(theme.pageInfo)}>
                        {!recordsFiltered
                            ? (loading ? render(language.infoLoading, extraProps) : render(language.infoEmpty, extraProps))
                            : render(language.info, {
                                start: (start + 1).toLocaleString(),
                                end: Math.min(start + data.length, recordsFiltered).toLocaleString(),
                                total: recordsFiltered.toLocaleString(),
                                max: recordsTotal.toLocaleString(),
                                length: length.toLocaleString(),
                                ...extraProps
                            })
                        }
                    </div> : null}

                    {paging ?
                    <div className={cc(theme.pagination)} onWheel={this.handlePageWheel}>
                        {currentPage <= 0
                            ? <span className={cc([theme.button, theme.disabled])}>Previous</span>
                            : <ActionLink className={cc(theme.button)} onClick={this._incPage(-1)}>Previous</ActionLink>
                        }

                        {!recordsFiltered
                            ? (loading ? <span className={cc(theme.pageNumberSpacer)}>⋯</span> :
                                <span className={cc(theme.button)}>–</span>)
                            : <PageNumbers {...extraProps} currentPage={currentPage} pageCount={pageCount} setPage={this._setPage} />
                        }

                        {currentPage >= pageCount - 1
                            ? <span className={cc([theme.button, theme.disabled])}>Next</span>
                            : <ActionLink className={cc(theme.button)} onClick={this._incPage(1)}>Next</ActionLink>
                        }
                    </div> : null}

                    <span className={cc(theme.pageXofY)}>Page {currentPage + 1}{pageCount ?
                        <Fragment> of {pageCount}</Fragment> : null}</span>
                </div>

                {loading && language.processing ? render(language.processing, extraProps) : null}
            </div>
        )
    }
}

function PageNumbers({currentPage,pageCount,theme,setPage}) {
    let pageNumbers;
    const lastPage = pageCount - 1;
    if(pageCount <= PAGE_LINKS) {
        pageNumbers = pageCount ? range(pageCount) : [];
    } else if(currentPage < 4) {
        pageNumbers = [0,1,2,3,4,pageCount-1];
    } else if(currentPage > pageCount - 5) {
        pageNumbers = [0,lastPage-4,lastPage-3,lastPage-2,lastPage-1,lastPage];
    } else {
        pageNumbers = [0,currentPage-1,currentPage,currentPage+1,lastPage];
    }
    
    const spacer = <span className={cc(theme.pageNumberSpacer)}>⋯</span>;
    let prevPage = -1;
    
    return pageNumbers.map(pg => {
        
        let ret = (
            pg === currentPage
                ? <span key={pg} className={cc([theme.button, theme.current])}>{pg + 1}</span>
                : <ActionLink key={pg} className={cc([theme.button])} onClick={setPage(pg)}>{pg + 1}</ActionLink>
        );
        
        if(pg > prevPage + 1) {
            ret = <Fragment key={pg}>{spacer}{ret}</Fragment>
        }
        
        prevPage = pg;
        
        return ret;
    });
}


const funcOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.node])

PureDataTable.propTypes = {
    theme: PropTypes.object,
    data: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
    columns: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            data: PropTypes.string,
            render: PropTypes.oneOfType([
                PropTypes.func,
                // PropTypes.shape({
                //     _: PropTypes.func,
                //     filter: PropTypes.func,
                //     display: PropTypes.func,
                // })
            ]),
        })
    ])),
    language: PropTypes.shape({
        lengthMenu: funcOrNode,
        search: funcOrNode,
        info: funcOrNode,
        infoLoading: funcOrNode,
        infoEmpty: funcOrNode,
        loadingRecords: funcOrNode,

        // Text shown inside the table records when the is no information to be displayed after filtering.
        zeroRecords: funcOrNode,

        // This string is shown in preference to language.zeroRecords when the table is empty of data (regardless of filtering) - i.e. there are zero records in the table.
        emptyTable: funcOrNode,

        sortIcons: PropTypes.shape({
            ascending: funcOrNode,
            descending: funcOrNode,
            unsorted: funcOrNode,
        }),

        processing: funcOrNode,
    }),
    // https://www.apollographql.com/docs/react/advanced/caching.html#normalization
    rowKey: PropTypes.func,
    columnKey: PropTypes.func,
    paging: PropTypes.bool,
    lengthMenu: PropTypes.arrayOf(PropTypes.number),
    // https://datatables.net/reference/option/searchDelay
    searchDelay: PropTypes.number,

    // TODO: put page number and maybe search term in https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
    // put length, sorting, and show/hide column preferences in localStorage.
    // add reset button?
    storageKey: PropTypes.string,
    rowComponent: PropTypes.func,
    cellComponent: PropTypes.func,
}

function DataTableRow({attrs}) {
    return <tr {...attrs}/>;
}

function DataTableCell({attrs}) {
    return <td {...attrs}/>;
}

export default class DataTable extends React.Component{
    static propTypes = {api: PropTypes.func, ...PureDataTable.propTypes};

    _createRef = c => {
        this._ref = c;
    };
    
    componentDidMount() {
        if(this.props.api) {
            this.props.api({
                draw: (...args) => this._ref.draw(...args)
            });
        }
    }

    componentWillUnmount() {
        if(this.props.api) {
            this.props.api(null);
        }
    }

    render(){
        const {api, ...options} = defaultsDeep(this.props, {
            className: undefined,
            theme: __map,
            data: [],
            rowKey: (row, idx) => row._id || row.id || row._key || row.key || idx,
            columnKey: (col, idx) => col._id || col.id || col._key || col.key || col.name || idx,
            language: {
                // https://datatables.net/reference/option/language
                lengthMenu: ({Menu}) => <label>Show <Menu/> entries</label>,
                search: ({Input}) => <label><span>Search:</span><Input/></label>,
                info: ({start, end, total, max, length}) => <Fragment>
                    <Fragment>Showing </Fragment>
                    {start === 1 && length >= total
                        ? <Fragment>all</Fragment>
                        : <Fragment>{start} to {end} of</Fragment>
                    }
                    <Fragment> {total} entries</Fragment>
                    {total < max && <Fragment> (filtered from {max} total entries)</Fragment>}
                </Fragment>,
                infoLoading: "Showing … to … of … entries",
                infoEmpty: "Showing all 0 entries",
                loadingRecords: "Loading…",
                processing: ({theme}) => <div className={theme.processing}>Processing…</div>,
                zeroRecords: "No matching records found",
                emptyTable: "No data available in table",
                sortIcons: null,
            },
            lengthMenu: [10, 25, 50, 100],
            searchDelay: 400,
            columns: [],
            start: 0,
            paging: true,
            length: this.props.lengthMenu && this.props.lengthMenu.length ? this.props.lengthMenu[0] : 10,
            search: {
                value: '',
                regex: false,
            },
            order: [[0, ASC]],
            rowComponent: DataTableRow,
            cellComponent: DataTableCell,
        });
        if(options.order.length) {
            // https://datatables.net/reference/option/order
            const orderMap = {};
            for(let i = 0; i < options.columns.length; ++i) {
                if(isString(options.columns[i].name)) {
                    orderMap[options.columns[i].name] = i;
                } else if(isString(options.columns[i].data)) {
                    orderMap[options.columns[i].data] = i;
                }
            }
            if(!Array.isArray(options.order[0])) {
                options.order = [options.order];
            }
            options.order = options.order.map(([col, dir]) => {
                if(isString(col)) {
                    col = orderMap[col];
                }
                return [col, String(dir).toLowerCase()];
            });
        }

        return <PureDataTable ref={this._createRef} {...options}/>;
    }
}


// function fixOrder(order, map) {
//     if(!order) return;
//     if(Array.isArray(order[0])) {
//         for(let o of order) {
//             fixOrder(o, map);
//         }
//     } else if(hasProp(map, order[0])) {
//         order[0] = map[order[0]];
//     } else if(typeof order[0] === 'string') {
//         console.warn(`Column "${order[0]}" not found in order map`);
//         console.info(map);
//     }
// }

function wheelTicks(ev) {
    switch(ev.deltaMode) {
        case MouseEvent.DOM_DELTA_PIXEL:
            return Math.ceil(ev.deltaY / 53);
        case MouseEvent.DOM_DELTA_LINE:
            return Math.ceil(ev.deltaY / 3);
        case MouseEvent.DOM_DELTA_PAGE:
            return Math.ceil(ev.deltaY);
    }
    return ev.deltaY < 0 ? -1 : 1;
}