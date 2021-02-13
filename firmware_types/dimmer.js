module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("r" in req_cbor) obj.r = req_cbor.r;
		if ("g" in req_cbor) obj.g = req_cbor.g;
		if ("b" in req_cbor) obj.b = req_cbor.b;
		if ("w" in req_cbor) obj.w = req_cbor.w;
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("V" in req_cbor) obj.V = req_cbor.V * 45 / 37033;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		return obj
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'r': {'i': 30000, 'r': 0},
				'g': {'i': 30000, 'r': 0},
				'b': {'i': 30000, 'r': 0},
				'w': {'i': 30000, 'r': 0},
				'v': {'i': 30000, 'r': 45}, // 45 / 4551,111111111111 = ~0.01 V
				'V': {'i': 30000, 'r': 10}, // 10 / 822,9555555555556 = ~0.012 V
				't': {'i': 30000, 'r': 2}, // 2 * 0.25 = 0.5 C
			}
		}
	}
};