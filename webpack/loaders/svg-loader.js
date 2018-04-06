const path = require('path');

module.exports = function(content) {
    this.cacheable && this.cacheable();
    return `export default function Svg({title,desc,...props}) { return ${content.replace('>','{...props}>{title?<title>{title}</title>:null}{desc?<desc>{desc}</desc>:null}')} };
    Svg.displayName = ${JSON.stringify(path.relative(this.rootContext,this.resourcePath))}`;
}
module.exports.seperable = true;