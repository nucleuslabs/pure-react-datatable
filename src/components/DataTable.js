import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import cc from '../react-classcat'
import {call, debounce, getValue, isFunction} from '../util';

export default class DataTable extends React.PureComponent {
    
    draw = 0;
    state = {
        start: 0,
        length: 10,
        data: [],
        loading: false,
        error: null,
        recordsTotal: null,
        recordsFiltered: null,
        search: {
            value: '',
            regex: false,
        }
    }
    
    constructor(props) {
        super(props);
        this._refresh = debounce(this._refreshNow, this.props.searchDelay);
    }
    
    componentDidMount() {
        this._refreshNow();
    }
    
    async _refreshNow() {
        if(isFunction(this.props.data)) {
            this.setState({loading: true})
            // https://datatables.net/manual/server-side
            let resp = await this.props.data({
                draw: ++this.draw,
                start: this.state.start,
                length: this.state.length,
                search: this.state.search,
                order: [],
                columns: this.props.columns,
            })
            if(resp.draw < this.draw) return;
            const data = resp.data.slice(0, this.state.length);
            this.setState({
                data,
                loading: false,
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                error: resp.error,
            })
        } else if(Array.isArray(this.props.data)) {
            const data = this.props.data.slice(this.state.start,this.state.length);
            this.setState({
                data,
                recordsTotal: this.props.data.length,
                recordsFiltered: this.props.data.length,
            })
        }
    }
    
    get pageCount() {
        return this.state.recordsFiltered == null ? null : Math.ceil(this.state.recordsFiltered/this.state.length);
    }
    
    changeLength = ev => {
        this.setState({
            length: parseInt(ev.target.value),
        })
    }
    
    changeSearch = ev => {
        this.setState({
            search: {
                value: ev.target.value,
                regex: false,
            }
        }, this._refresh);
    }
    
    render() {
        const {theme,columns,language,columnKey,rowKey,lengthMenu} = this.props;
        const {data,loading,recordsFiltered,recordsTotal,start,length,search} = this.state;
        // console.log(data);
        return (
            <cc.div className={theme.wrapper}>
                <cc.div className={[theme.controlBar,theme.searchBar]}>
                    <cc.div className={theme.lengthWrap}>
                        <label>Show <select value={length} onChange={this.changeLength}>
                            {lengthMenu.map(len => (
                                <option key={len} value={len}>{len}</option>
                            ))}
                        </select> entries</label>
                    </cc.div>
                    <cc.div className={theme.searchWrap}>
                        <label><span>Search:</span><input type="search" value={search.value} onChange={this.changeSearch}/></label>
                    </cc.div>
                </cc.div>
                
                <cc.table className={theme.table}>
                    <cc.thead className={theme.thead}>
                        <cc.tr className={[theme.tr,theme.hrow]}>
                            {columns.map((col,n) => (
                                <cc.th key={columnKey(col,n)} className={[theme.cell,theme.th,col.className]}>{call(col.title)}</cc.th>
                            ))}
                        </cc.tr>
                    </cc.thead>
                    <cc.tbody>
                        {data.length ? data.map((row,m) => (
                            <cc.tr key={rowKey(row,m)} className={[theme.tr,theme.drow,m%2===0?theme.even:theme.odd]}>
                                {columns.map((col,n) => {
                                    
                                    // https://datatables.net/reference/option/columns.render
                                    
                                    
                                    // console.log(row,col,m,n);
                                    // let value;
                                    // if(Array.isArray(row)) {
                                    //     value 
                                    // }
                                    let data;
                            
                                    if(col.data) {
                                        data = getValue(row, col.data);
                                    } else {
                                        data = row[n];
                                    }
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
                                    
                                    return <cc.td key={columnKey(col,n)} className={[theme.cell,theme.td,col.className]}>{data}</cc.td>
                                })}
                            </cc.tr>
                        )) : (
                            loading ? (
                                    <cc.tr className={[theme.tr]}>
                                        <cc.td className={[theme.td,theme.loading]} colSpan={columns.length}>{language.loadingRecords}</cc.td>
                                    </cc.tr>
                                ) : (
                                    <cc.tr className={[theme.tr]}>
                                        <cc.td className={[theme.td,theme.empty]} colSpan={columns.length}>{language.emptyTable}</cc.td>
                                    </cc.tr>
                                )
                        )}
                    </cc.tbody>
                </cc.table>
                
                <cc.div className={[theme.controlBar,theme.infoBar]}>
                    <cc.div className={theme.pageInfo}>
                        Showing
                        {start === 0 && length >= recordsFiltered 
                            ? <Fragment> all </Fragment>
                            : <Fragment> {start+1} to {Math.min(start+length,recordsFiltered)} of </Fragment>
                        }
                        {recordsFiltered} entries
                        {recordsFiltered < recordsTotal && <Fragment> (filtered from {recordsTotal} total entries)</Fragment>}
                    </cc.div>
                    <cc.div className={theme.pagination}>
                        <a href="" className={theme.button}>Previous</a>
                        {range(1,this.pageCount).map(pg => (
                            <a key={pg} href="" className={theme.button}>{pg}</a>
                        ))}
                        <a href="" className={theme.button}>Next</a>
                    </cc.div>
                </cc.div>
            </cc.div>
        )
    }
}

function range(start,end,step=1) {
    const length = Math.floor((end-start)/step+1);
    return Array.from({length}, (_,i) => i*step+start);
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
}

DataTable.defaultProps = {
    rowKey: (row,idx) => row._id || row.id || row._key || row.key || idx, 
    columnKey: (col,idx) => col._id || col.id || col._key || col.key || col.name || idx, 
    language: {
        loadingRecords: "Loading...",
        zeroRecords: "No matching records found",
        emptyTable: "No data available in table", 
    },
    lengthMenu: [ 10, 25, 50, 100 ],
    searchDelay: 400,
}