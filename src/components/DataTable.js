import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import cc from 'classcat';
import {call, debounce, getValue, isFunction, defaults, mergeState, range, render, clamp} from '../util';

export default class DataTable extends React.PureComponent {
    
    draw = 0;
    
    constructor(props) {
        super(props);
        this._refresh = debounce(this._refreshNow, this.props.searchDelay);
        this.state = defaults(
            this.props, 
            {
                start: 0,
                length: 10,
                search: {
                    value: '',
                    regex: false,
                },
            }, 
            {
                recordsTotal: null,
                recordsFiltered: null,
                data: [],
                loading: true,
                error: null,
            }
        );
    }
    
    componentWillMount() {
        this._refreshNow();
    }
    
    async _refreshNow(state) {
        state = {...this.state, ...state};
        if(isFunction(this.props.data)) {
            this.setState({loading: true})
            // https://datatables.net/manual/server-side
            let resp = await this.props.data({
                draw: ++this.draw,
                start: state.start,
                length: state.length,
                search: state.search,
                order: [],
                columns: this.props.columns,
            })
            if(resp.draw < this.draw) return;
            // TODO: if resp.data.length === resp.recordsTotal, switch to client-side filtering??
            // TODO: if server over-fetches (returns enough for page 2) allow going to next page without re-fetching?
            const data = resp.data.slice(0, state.length);
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
                        filteredData = filteredData.filter(row => this.props.columns.some((_,n) => {
                            return re.test(this._getValue(row,n,'filter'))
                        }));
                    } catch(_) {}
                } else {
                    const searchTerms = state.search.value.trim().toLocaleLowerCase().split(/\s+/);
                    filteredData = filteredData.filter(row => {
                        const values = this.props.columns.map((_,n) => this._getValue(row,n,'filter').toLocaleLowerCase());
                        return searchTerms.every(term => {
                            return this.props.columns.some((_,n) => {
                                return values[n].includes(term);
                            })
                        })
                    });
                }
           
            }
            this.setState({
                data: filteredData.slice(state.start,state.start+state.length),
                recordsTotal: this.props.data.length,
                recordsFiltered: filteredData.length,
                loading: false,
            })
        }
    }

    get currentPage() {
        return Math.floor(this.state.start/this.state.length);
    }
    
    get pageCount() {
        return this.state.recordsFiltered == null ? 0 : Math.ceil(this.state.recordsFiltered/this.state.length);
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
        });
    }
    
    _setLength = length => {
        let start = Math.floor(this.state.start/length)*length;
        this._refreshState({length,start});
    }
    
    handleLengthWheel = ev => {
        ev.preventDefault();
        let ticks = wheelTicks(ev);
        let idx = this.props.lengthMenu.indexOf(this.state.length);
        let next = idx + ticks;
        if(next >= 0 && next < this.props.lengthMenu.length) {
            this._setLength(this.props.lengthMenu[next])
        }
    }
    
    _refreshState = partialState => {
        const makeState = mergeState(partialState);
        this._refreshNow(makeState(this.state));
        this.setState(makeState);
    }

    handlePageWheel = ev => {
        this._incPage(wheelTicks(ev))(ev);
    }

    _incPage = amount => ev => {
        this._setPage(this.currentPage+amount)(ev);
    }

    _setPage = pg => ev => {
        ev.preventDefault();
        pg = clamp(pg, 0, this.pageCount - 1);
        if(pg === this.currentPage) return;
        this._refreshState(({length}) => ({
            start: pg*length,
        }));
    }
    
    // TODO: swipe right/left events?? assuming there's no horizontal scrolling
    
    render() {
        const {theme,columns,language,columnKey,rowKey,lengthMenu} = this.props;
        const {data,loading,recordsFiltered,recordsTotal,start,length,search} = this.state;
        const {currentPage,pageCount} = this;
        
        // console.log(data);
        return (
            <div className={cc(theme.wrapper)}>
                <div className={cc([theme.controlBar,theme.searchBar])}>
                    
                    {language.lengthMenu && lengthMenu && lengthMenu.length
                        ? <div className={cc([theme.length])} onWheel={this.handleLengthWheel}>
                                {render(language.lengthMenu, {Menu: this._lengthMenu})}
                            </div> 
                        : null}
                        
                    <div className={cc(theme.search)}>
                        {language.search 
                            ? render(language.search, {Input: this._searchInput})
                            : null}
                    </div>
                    
                    {search.value ? <div className={cc(theme.searchText)}>
                        Search results for “{search.value}”
                    </div> : null}
                </div>
                
                <table className={cc(theme.table)}>
                    <thead className={cc(theme.thead)}>
                        <tr className={cc([theme.tr,theme.hrow])}>
                            {columns.map((col,n) => (
                                <th key={columnKey(col,n)} className={cc([theme.cell,theme.th,col.className])}>{call(col.title)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length ? data.map((row,m) => (
                            <tr key={rowKey(row,m)} className={cc([theme.tr,theme.drow,m%2===0?theme.even:theme.odd])}>
                                {columns.map((col,n) => {
                                    
                                    // https://datatables.net/reference/option/columns.render
                                    
                                    
                                    // console.log(row,col,m,n);
                                    // let value;
                                    // if(Array.isArray(row)) {
                                    //     value 
                                    // }
                                    let data = this._getValue(row, n, 'display');
                                    if(col.render) {
                                        data = React.createElement(col.render, {
                                            data: data,
                                            type: 'display',
                                            row,
                                            meta: {
                                                row: m,
                                                col: n,
                                            }
                                        })
                                    }
                                    
                                    return <td key={columnKey(col,n)} className={cc([theme.cell,theme.td,col.className])}>{data}</td>
                                })}
                            </tr>
                        )) : (
                            loading ? (
                                    <tr className={[theme.tr]}>
                                        <td className={cc([theme.td,theme.loadingRecords,theme.empty])} colSpan={columns.length}>{language.loadingRecords}</td>
                                    </tr>
                                ) : (recordsTotal > 0 ? (<tr className={[theme.tr]}>
                                    <td className={cc([theme.td,theme.zeroRecords,theme.empty])} colSpan={columns.length}>{language.zeroRecords}</td>
                                </tr>) : (
                                    <tr className={[theme.tr]}>
                                        <td className={cc([theme.td,theme.noData,theme.empty])} colSpan={columns.length}>{language.emptyTable}</td>
                                    </tr>
                                )
                        ))}
                    </tbody>
                </table>
                
                <div className={cc([theme.controlBar,theme.infoBar])}>
                    {language.info ? <div className={cc(theme.pageInfo)}>
                        {!recordsFiltered 
                            ? (loading ? render(language.infoLoading) : render(language.infoEmpty)) 
                            : render(language.info, {
                                start: start+1,
                                end: Math.min(start+data.length,recordsFiltered),
                                total: recordsFiltered,
                                max: recordsTotal,
                                length: length,
                            })
                        }
                    </div> : null}
                    
                    <div className={cc(theme.pagination)} onWheel={this.handlePageWheel}>
                        {currentPage <= 0
                            ? <span className={cc([theme.button,theme.disabled])}>Previous</span>
                            : <a href="" className={cc(theme.button)} onClick={this._incPage(-1)}>Previous</a>
                        }
                        
                        {!recordsFiltered
                            ? (loading ? <span className={cc(theme.button)}>…</span> :
                                <span className={cc(theme.button)}>–</span>)
                            : range(pageCount).map(pg => (
                                pg === currentPage
                                    ? <span key={pg} className={cc([theme.button,theme.current])}>{pg+1}</span>
                                    : <a key={pg} href="" className={cc([theme.button])} onClick={this._setPage(pg)}>{pg+1}</a>
                            ))
                        }

                        {currentPage >= pageCount - 1
                            ? <span className={cc([theme.button,theme.disabled])}>Next</span>
                            : <a href="" className={cc(theme.button)} onClick={this._incPage(1)}>Next</a>
                        }
                    </div>

                    <span className={cc(theme.pageXofY)}>Page {currentPage+1}{pageCount ? <Fragment> of {pageCount}</Fragment>: null}</span>
                </div>
            </div>
        )
    }
}



DataTable.propTypes = {
    theme: PropTypes.object,
    data: PropTypes.oneOfType([PropTypes.func,PropTypes.array]),
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
        loadingRecords: PropTypes.node,
        
        // Text shown inside the table records when the is no information to be displayed after filtering.
        zeroRecords: PropTypes.node,

        // This string is shown in preference to language.zeroRecords when the table is empty of data (regardless of filtering) - i.e. there are zero records in the table.
        emptyTable: PropTypes.node,
    }),
    // https://www.apollographql.com/docs/react/advanced/caching.html#normalization
    rowKey: PropTypes.func,
    columnKey: PropTypes.func,
    lengthMenu: PropTypes.arrayOf(PropTypes.number),
    // https://datatables.net/reference/option/searchDelay
    searchDelay: PropTypes.number,
    
    // TODO: put page number and maybe search term in https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
    // put length, sorting, and show/hide column preferences in localStorage.
    // add reset button?
    storageKey: PropTypes.string,
}

DataTable.defaultProps = {
    rowKey: (row,idx) => row._id || row.id || row._key || row.key || idx, 
    columnKey: (col,idx) => col._id || col.id || col._key || col.key || col.name || idx, 
    language: {
        // https://datatables.net/reference/option/language
        lengthMenu: ({Menu}) => <label>Show <Menu/> entries</label>,
        search: ({Input}) => <label><span>Search:</span><Input/></label>,
        info: ({start,end,total,max,length}) => <Fragment>
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
        zeroRecords: "No matching records found",
        emptyTable: "No data available in table", 
    },
    lengthMenu: [10, 25, 50, 100],
    searchDelay: 400,
}

function wheelTicks(ev) {
    switch(ev.deltaMode) {
        case MouseEvent.DOM_DELTA_PIXEL:
            return Math.ceil(ev.deltaY/53);
        case MouseEvent.DOM_DELTA_LINE:
            return Math.ceil(ev.deltaY/3);
        case MouseEvent.DOM_DELTA_PAGE:
            return Math.ceil(ev.deltaY);
    }
    return ev.deltaY < 0 ? -1 : 1;
}