import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import cc from 'classcat';
import {call, debounce, getValue, isFunction, defaults, mergeState, range} from '../util';

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
    
    get pageCount() {
        return this.state.recordsFiltered == null ? 0 : Math.ceil(this.state.recordsFiltered/this.state.length);
    }
    
    changeLength = ev => {
        const makeState = mergeState({
            length: parseInt(ev.target.value) || this.props.length
        })
        this._refresh(makeState(this.state));
        this.setState(makeState)
    }
    
    changeSearch = ev => {
        const makeState = mergeState({
            search: {
                value: ev.target.value,
            }
        })
        this._refresh(makeState(this.state));
        this.setState(makeState);
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
    
    render() {
        const {theme,columns,language,columnKey,rowKey,lengthMenu} = this.props;
        const {data,loading,recordsFiltered,recordsTotal,start,length,search} = this.state;
        // console.log(data);
        return (
            <div className={cc(theme.wrapper)}>
                <div className={cc([theme.controlBar,theme.searchBar])}>
                    <div className={cc(theme.lengthWrap)}>
                        {language.lengthMenu && lengthMenu && lengthMenu.length ? <language.lengthMenu Menu={() => <select value={length} onChange={this.changeLength}>
                                {lengthMenu.map(len => (
                                    <option key={len} value={len}>{len}</option>
                                ))}
                            </select>}/>
                        : null}
                    </div>
                    <div className={cc(theme.searchWrap)}>
                        <label><span>Search:</span><input type="search" value={search.value} onChange={this.changeSearch}/></label>
                    </div>
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
                                        <td className={cc([theme.td,theme.loading])} colSpan={columns.length}>{language.loadingRecords}</td>
                                    </tr>
                                ) : (
                                    <tr className={[theme.tr]}>
                                        <td className={cc([theme.td,theme.empty])} colSpan={columns.length}>{language.emptyTable}</td>
                                    </tr>
                                )
                        )}
                    </tbody>
                </table>
                
                <div className={cc([theme.controlBar,theme.infoBar])}>
                    <div className={cc(theme.pageInfo)}>
                        {recordsFiltered == null ? language.infoEmpty :
                            <language.info start={start+1} end={start+data.length} total={recordsFiltered} max={recordsTotal} length={length}/>
                        }
                    </div>
                    <div className={cc(theme.pagination)}>
                        <a href="" className={cc(theme.button)}>Previous</a>
                        {recordsFiltered == null
                            ? <span className={cc(theme.button)}>…</span>
                            : (recordsFiltered ? range(1,this.pageCount).map(pg => (
                                <a key={pg} href="" className={cc(theme.button)}>{pg}</a>
                            )) : <span className={cc(theme.button)}>–</span>)}
                        <a href="" className={cc(theme.button)}>Next</a>
                    </div>
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
        info: ({start,end,total,max,length}) => <Fragment>
            <Fragment>Showing </Fragment>
            {start === 1 && length >= total
                ? <Fragment>all</Fragment>
                : <Fragment>{start} to {end} of</Fragment>
            }
            <Fragment> {total} entries</Fragment>
            {total < max && <Fragment> (filtered from {max} total entries)</Fragment>}
        </Fragment>,
        infoEmpty: "Showing … to … of … entries",
        loadingRecords: "Loading…",
        zeroRecords: "No matching records found",
        emptyTable: "No data available in table", 
    },
    lengthMenu: [10, 25, 50, 100],
    searchDelay: 400,
}