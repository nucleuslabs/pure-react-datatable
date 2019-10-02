import React from 'react';

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
    return <a href="#" {...props} />
}