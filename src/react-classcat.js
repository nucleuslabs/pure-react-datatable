import classcat from 'classcat';

export default new Proxy(Object.create(null), {
    get(proxy, name) {
        return ({className,...props}) => React.createElement(name, {className: classcat(className), ...props})
    }
})