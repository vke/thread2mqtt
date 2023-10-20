module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		if ("0" in req_cbor) obj["0"] = req_cbor["0"];
		if ("1" in req_cbor) obj["1"] = req_cbor["1"];
		if ("2" in req_cbor) obj["2"] = req_cbor["2"];
		if ("3" in req_cbor) obj["3"] = req_cbor["3"];
		if ("4" in req_cbor) obj["4"] = req_cbor["4"];
		return obj
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'v': {'i': 30000, 'r': 45}, // 45 / 4551,111111111111 = ~0.01 V
				't': {'i': 30000, 'r': 2}, // 2 * 0.25 = 0.5 C
				'0': {'i': 10000, 'r': 0},
				'1': {'i': 10000, 'r': 0},
				'2': {'i': 10000, 'r': 0},
				'3': {'i': 10000, 'r': 0},
				'4': {'i': 10000, 'r': 0},
			}
		}
	}
};