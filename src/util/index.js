import stringToPath from './stringToPath';
import {isFunction, isObject} from './types';

export function getValue(obj, path, def) {
    if(!obj) return def;
    if(!Array.isArray(path)) {
        path = stringToPath(path);
    }
    let ret = obj;

    for(let key of path) {
        if(ret == null || !Object.hasOwnProperty.call(ret,key)) {
            return def;
        }
        ret = ret[key];
    }

    return ret;
}

export * from './types';
export * from './react';

export function call(fn, ...args) {
    return typeof fn === 'function' ? fn.call(this, ...args) : fn;
}

export function debounce(fn, ms) {
    let timer;
    return function debounced(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.call(this, ...args), ms);
    }
}

export function defaults(source, target, forced) {
    for(let key of Object.keys(target)) {
        if(source[key] !== undefined) {
            if(isObject(source[key])) {
                target[key] = defaults(source[key], target[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return Object.assign(target, forced);
}

function deepMerge(a, b) {
    const out = {...a};
    for(let k of Object.keys(b)) {
        if(isFunction(b[k])) {
            out[k] = b[k](a[k]);
        } else if(isObject(a[k]) && isObject(b[k])) {
            out[k] = deepMerge(a[k],b[k]);
        } else {
            out[k] = b[k];
        }
    }
    return out;
}

export function mergeState(newState) {
    return oldState => deepMerge(oldState,newState);
}


export function range(start,end,step=1) {
    if(step === 0) {
        throw new Error("`step` cannot be 0");
    }
    if(end === undefined) {
        end = start - 1;
        start = 0;
    }
    if(step > 0) {
        if(end < start) {
            throw new Error("`end` cannot be less than `start` when `step` > 0")
        }
    } else {
        if(start < end) {
            throw new Error("`start` cannot be less than `end` when `step` < 0")
        }
    }
    const length = Math.floor((end-start)/step+1);
    return Array.from({length}, (_,i) => i*step+start);
}