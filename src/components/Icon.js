import css from '../styles/misc.less';
import cc from '../react-classcat';

export default function Icon({children,className}) {
    return <cc.span className={[css.icon,className]}>{children}</cc.span>
}