import React from 'react';
import PropTypes from 'prop-types';
import cc from 'classcat';

export default class DataTable extends React.PureComponent {
    
    render() {
        const {theme,columns} = this.props;
        return (
            <table className={theme.table}>
                <thead className={theme.thead}>
                    <tr className={cc([theme.tr,theme.hrow])}>
                        {columns.map((col,idx) => (
                            <th key={col.name || `col${idx}`} className={cc([theme.cell,theme.th])}>{col.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    
                </tbody>
            </table>
        )
    }
}

DataTable.propTypes = {
    theme: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.object),
}