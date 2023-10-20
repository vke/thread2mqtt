module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("o" in req_cbor) obj.o = req_cbor.o
		if ("c" in req_cbor) obj.c = req_cbor.c
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		return obj
	},
	"subscribe": (my_address) => {
		console.log("sub", my_address);
		return {
			'a': my_address,
			's': {
				'o': {'i': 10000, 'r': 0}, // open state
				'c': {'i': 10000, 'r': 0}, // close state
				'v': {'i': 300000, 'r': 20}, // 20 / 4551,111111111111 = 0,00439453125 V
				't': {'i': 300000, 'r': 2}, // 2 * 0.25 = 0.5 C
			}
		}
	}
};