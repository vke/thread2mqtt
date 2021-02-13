module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("o" in req_cbor) obj.o = req_cbor.o
		if ("c" in req_cbor) obj.c = req_cbor.c
		if ("d" in req_cbor) obj.d = req_cbor.d
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("V" in req_cbor) obj.V = req_cbor.V * 45 / 37033;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		return obj
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'v': {'i': 30000, 'r': 45}, // 45 / 4551,111111111111 = ~0.01 V
				'V': {'i': 10000, 'r': 10}, // 10 / 822,9555555555556 = ~0.012 V
				't': {'i': 30000, 'r': 2}, // 2 * 0.25 = 0.5 C
				'o': {'i': 1000, 'r': 0}, // open event
				'c': {'i': 1000, 'r': 0}, // close event
				'd': {'i': 1000, 'r': 0}, // door bell
			}
		}
	}
};