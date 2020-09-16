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
                'T': { 'i': 10000, 'r': 0 },
                'H': { 'i': 10000, 'r': 0 },
                'v': { 'i': 10000, 'r': 10 },
                //				'V': {'i': 10000, 'r': 10},
                't': { 'i': 30000, 'r': 2 },
            }
        }
    }
};