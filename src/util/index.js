import stringToPath from './stringToPath';

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