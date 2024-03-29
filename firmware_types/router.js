module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		return obj
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'v': {'i': 30000, 'r': 45}, // 45 / 4551,111111111111 = ~0.01 V
				't': {'i': 30000, 'r': 2}, // 2 * 0.25 = 0.5 C
			}
		}
	}
};