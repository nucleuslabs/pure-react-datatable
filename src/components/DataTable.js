import React from 'react';
import PropTypes from 'prop-types';
import cc from '../react-classcat'
import {call, getValue, isFunction} from '../util';

export default class DataTable extends React.PureComponent {
    
    draw = 0;
    state = {
        start: 0,
        length: 20,
        data: [],
        loading: true,
    }
    
    async componentDidMount() {
        // this.setState({loading: true})
        let resp = await this.props.data({
            draw: ++this.draw,
            start: this.state.start,
            length: this.state.length,
            search: {
                value: '',
                regex: false,
            },
            order: [],
            columns: this.props.columns,
        })
        if(resp.draw < this.draw) return;
        this.setState({
            data: resp.data,
            loading: false,
        })
    }
    
    render() {
        const {theme,columns,dataIdFromObject,language} = this.props;
        const {data,loading} = this.state;
        // console.log(data);
        return (
            <table className={theme.table}>
                <thead className={theme.thead}>
                    <cc.tr className={[theme.tr,theme.hrow]}>
                        {columns.map((col,idx) => (
                            <cc.th key={col.name || `col${idx}`} className={[theme.cell,theme.th,col.className]}>{call(col.title)}</cc.th>
                        ))}
                    </cc.tr>
                </thead>
                <tbody>
                    {data.length ? data.map((row,m) => (
                        <cc.tr key={dataIdFromObject(row,m)} className={[theme.tr,theme.drow,m%2===0?theme.even:theme.odd]}>
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
                                
                                return <cc.td className={[theme.cell,theme.td,col.className]}>{data}</cc.td>
                            })}
                        </cc.tr>
                    )) : (
                        loading ? (<cc.tr className={[theme.tr,theme.loadingRecordsRow]}>
                                <cc.td className={[theme.td,theme.loadingRecordsCell]} colSpan={columns.length}>{language.loadingRecords}</cc.td>
                            </cc.tr>)
                            : (<cc.tr className={[theme.tr,theme.emptyTableRow]}>
                                <cc.td className={[theme.td,theme.emptyTableCell]} colSpan={columns.length}>{language.emptyTable}</cc.td>
                            </cc.tr>)
                    )}
                </tbody>
            </table>
        )
    }
}

DataTable.propTypes = {
    theme: PropTypes.object,
    data: PropTypes.func,
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
    })
}

DataTable.defaultProps = {
    dataIdFromObject: (row,idx) => row._id || row.id || row._key || row.key || idx, 
    language: {
        loadingRecords: "Loading...",
        zeroRecords: "No matching records found",
        emptyTable: "No data available in table", 
    }
}