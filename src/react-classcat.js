import classcat from 'classcat';

export default new Proxy(Object.create(null), {
    get(proxy, name) {
        const el = ({className,...props}) => {
            if(className) {
                className = classcat(className);
                if(className) {
                    props.className = className;
                }
            }
            return React.createElement(name, props)
        };
        el.displayName = name;
        return el;
    }
})