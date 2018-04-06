import React from 'react';
import PropTypes from 'prop-types';

export default function ActionLink({onClick,...props}) {
    if(onClick) {
        props.onClick = ev => {
            ev.preventDefault();
            onClick(ev);
        }
    } else {
        props.onClick = ev => {
            ev.preventDefault();
        }
    }
    return <a href="javascript:void 0" {...props} />
}

ActionLink.propTypes = {
    onClick: PropTypes.func.isRequired,
}