module.exports = {
	"convert": (req_cbor) => {
		let obj = {}
		if ("t" in req_cbor) obj.t = req_cbor.t * 0.25;
		if ("V" in req_cbor) obj.V = req_cbor.V * 45 / 37033;
		if ("v" in req_cbor) obj.v = req_cbor.v * 9 / 40960;
		if ("1" in req_cbor) obj["1"] = req_cbor["1"];
		if ("2" in req_cbor) obj["2"] = req_cbor["2"];
		if ("3" in req_cbor) obj["3"] = req_cbor["3"];

		if ("4" in req_cbor) obj["4"] = req_cbor["4"]; // co2_final
		if ("5" in req_cbor) obj["5"] = req_cbor["5"]; // temp
		if ("6" in req_cbor) obj["6"] = req_cbor["6"]; // cal_ticks
		if ("7" in req_cbor) obj["7"] = req_cbor["7"]; // cal_cycles
		if ("8" in req_cbor) obj["8"] = req_cbor["8"]; // co2_smooth
		if ("9" in req_cbor) obj["9"] = req_cbor["9"]; // co2_unclamped
		if ("0" in req_cbor) obj["0"] = req_cbor["0"]; // co2_raw
		return obj
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'v': {'i': 30000, 'r': 45}, // 45 / 4551,111111111111 = ~0.01 V
//				'V': {'i': 10000, 'r': 10},
				't': {'i': 30000, 'r': 2}, // 2 * 0.25 = 0.5 C
				'1': {'i': 10000, 'r': 20},
				'2': {'i': 10000, 'r': 20},
				'3': {'i': 10000, 'r': 20},

				'4': {'i': 2000, 'r': 0}, // co2_final
				'5': {'i': 2000, 'r': 0}, // temp
				'6': {'i': 10000, 'r': 0}, // cal_ticks
				'7': {'i': 10000, 'r': 0}, // cal_cycles
				'8': {'i': 2000, 'r': 0}, // co2_smooth
				'9': {'i': 2000, 'r': 0}, // co2_unclamped
				'0': {'i': 2000, 'r': 0}, // co2_raw
			}
		}
	}
};