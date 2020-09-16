const convectors = {};
require('fs').readdirSync(__dirname)
    .filter(fn => fn !== 'index.js')
    .map(str => str.substr(0, str.length - 3))
    .forEach(name => {
        converters[name] = require(`./${name}`)
    })

module.exports = convectors