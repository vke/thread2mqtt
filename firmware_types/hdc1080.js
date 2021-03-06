module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("V" in req_cbor) obj.V = req_cbor.V * 45 / 37033;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		if ("T" in req_cbor) obj.T = req_cbor.T * 165 / 65536 - 40;
		if ("H" in req_cbor) obj.H = req_cbor.H * 100 / 65536;

		return obj
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'T': {'i': 30000, 'r': 40}, // 40 / 397,1878787878788 = ~0.1 C
				'H': {'i': 30000, 'r': 164}, // 164 / 655,36 = ~0.25%
				'v': {'i': 30000, 'r': 45}, // 45 / 4551,111111111111 = ~0.01 V
//				'V': {'i': 10000, 'r': 10},
				't': {'i': 30000, 'r': 2}, // 2 * 0.25 = 0.5 C
			}
		}
	}
};