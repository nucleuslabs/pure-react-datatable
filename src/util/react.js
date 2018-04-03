import React from 'react';
import {isFunction} from './types';

export function render(component,props) {
    return isFunction(component) ? React.createElement(component, props) : component;
}
