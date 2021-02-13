const firmware_types = {};
require('fs').readdirSync(__dirname)
	.filter(fn => fn !== 'index.js')
	.map(str => str.substr(0, str.length - 3))
	.forEach(name => {
		firmware_types[name] = require(`./${name}`)
	})

module.exports = firmware_types