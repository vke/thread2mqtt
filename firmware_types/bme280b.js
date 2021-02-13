module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		if ("P" in req_cbor) obj.P = req_cbor.P / 100;
		if ("T" in req_cbor) obj.T = req_cbor.T / 100;
		if ("H" in req_cbor) obj.H = req_cbor.H / 1024;
		return obj
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'P': {'i': 300000, 'r': 1333}, // 1333 / 100 = 13.3 p = 0.1 mmHg, 1 mmHg = 133.322 p.
				'T': {'i': 300000, 'r': 10}, // 10 / 100 = 0.1 C
				'H': {'i': 300000, 'r': 256}, // 256 / 1024 = 0.25%
				'v': {'i': 300000, 'r': 20}, // 20 / 4551,111111111111 = 0,00439453125 V
				't': {'i': 300000, 'r': 2}, // 2 * 0.25 = 0.5 C
			}
		}
	}
};