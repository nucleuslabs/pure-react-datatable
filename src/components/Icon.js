import React from 'react';
import css from '../styles/misc.less';
import cc from 'classcat';

export default function Icon({children,className}) {
    return <span className={cc([css.icon,className])}>{children}</span>
}