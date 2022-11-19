module.exports = {
	"convert": (req_cbor) => {
		const { t, V, v, P, T, H } = req_cbor;
		return {
			...t && { t: t * 0.25 },
			...V && { V: V * 45 / 37033 },
			...v && { v: v * 9 / 40960 },
			...P && { P: P / 100 },
			...T && { T: T / 100 },
			...H && { H: H / 1024 },
		}
	},
	"subscribe": (my_address) => {
		return {
			'a': my_address,
			's': {
				'P': { 'i': 30000, 'r': 0 },
				'T': { 'i': 30000, 'r': 0 },
				'H': { 'i': 30000, 'r': 0 },
				'v': { 'i': 10000, 'r': 45 },
//				'V': { 'i': 10000, 'r': 10},
				't': { 'i': 30000, 'r': 2 },
			}
		}
	}
};
