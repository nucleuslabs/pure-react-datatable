import stringToPath from './stringToPath';
import {isFunction, isObject, isPlainObject} from './types';

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

export function deepMerge(a, b) {
    const out = {...a};
    if(isFunction(b)) {
        b = b(a);
    }
    for(let k of Object.keys(b)) {
        if(isFunction(b[k])) {
            out[k] = b[k](a[k]);
        } else if(isPlainObject(a[k]) && isPlainObject(b[k])) {
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

export function clamp(nbr, min, max) {
    if(nbr < min) return min;
    if(nbr > max) return max;
    return nbr;
}

/**
 * Removes an index from an array without mutating the original array.
 *
 * @param {Array} array Array to remove value from
 * @param {Number} index Index to remove
 * @param {Number} count
 * @param {Array} replaceWith
 * @returns {Array} Array with `value` removed
 */
export function arraySplice(array, index, count=1, replaceWith=[]) {
    if(index < array.length) {
        let copy = [...array];
        copy.splice(index, count, ...replaceWith);
        return copy;
    }
    return array;
}

export function pick(obj, keys) {
    const out = Object.create(null);
    if(Array.isArray(keys)) {
        for(let k of keys) {
            if(Object.hasOwnProperty.call(obj, k)) {
                out[k] = obj[k];
            }
        }
    } else {
        for(let k of Object.keys(keys)) {
            if(obj[k] === undefined) {
                out[k] = keys[k];
            } else {
                out[k] = obj[k];
            }
        }
    }
    return out;
}