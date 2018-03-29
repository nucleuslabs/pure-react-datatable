import classcat from 'classcat';

export default new Proxy(Object.create(null), {
    get(proxy, name) {
        const el = ({className,...props}) => React.createElement(name, {className: classcat(className), ...props});
        el.displayName = name;
        return el;
    }
})