import React from 'react';
import {isFunction} from './types';
import {omit} from 'lodash';

export function render(component,props) {
    return isFunction(component) ? React.createElement(component, props) : component;
}
