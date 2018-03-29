const path = require('path');

module.exports = function(content) {
    this.cacheable && this.cacheable();
    // console.log(content,this);
    return `export default function Svg() { return ${content} };
    Svg.displayName = ${JSON.stringify(path.relative(this.rootContext,this.resourcePath))}`;
}
module.exports.seperable = true;