#!/usr/bin/env node

var wpantund_interface = "wpan0";

process.on('SIGINT', function() {
	SaveDevicesDB();
	console.log("Shutting down");
	process.exit(0);
});

const os = require('os');
const fs = require('fs');
var mqtt = require('mqtt');
var coap = require('coap');
var cbor = require('cbor');
var ip6addr = require('ip6addr');

var my_address = GetWPANIPv6Address(wpantund_interface);

var coapTiming = {
	maxRetransmit: 1,
};
coap.updateTiming(coapTiming);

var ipv6_dev = {};
if (fs.existsSync('devices.json'))
	ipv6_dev = JSON.parse(fs.readFileSync('devices.json'));

var client = mqtt.connect();

client.subscribe("/thread/out/#");

var coap_server = coap.createServer({ type: 'udp6', sendAcksForNonConfirmablePackets: false });

coap_server.on('request', function(req, res) {
	var req_cbor = cbor.decodeAllSync(req.payload)[0];

	if (req.url == '/up') {
		UpdateDevicesDB(req, req_cbor);
	}

	if (typeof ipv6_dev[req.rsinfo.address] == 'undefined') {
		console.log("Request from unknown device: " + req.rsinfo.address);
		return;
	}

	var dev_addr = req.rsinfo.address;
	var dev_info = ipv6_dev[req.rsinfo.address];
	var resp_json = {};

	console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), dev_info.name, req.url, req_cbor);

	switch (req.url) {
		case "/rep": {
			resp_json = OnRep(dev_addr, dev_info, req_cbor);
			break;
		}
		case "/up": {
			resp_json = OnUp(dev_addr, dev_info, req_cbor);
			break;
		}
		case "/cmd": {
			resp_json = OnCmd(dev_addr, dev_info, req_cbor);
			break;
		}
	}
	res.end()
})

coap_server.listen();

client.on('message', function (topic, message) {
	console.log(topic + ":" + message.toString());
 	var pieces = topic.split("/");
	console.log(pieces);
	var device = pieces[3];

	var dev_addr = DevAddrByDevName(device);

	if (dev_addr == null) {
		console.log("Unknown device: " + device);
		return;
	}

	var req = coap.request({
		hostname: dev_addr,
		pathname: 'set',
		method: 'PUT',
		confirmable: true,
	});

	req.setOption("Content-Format", "application/cbor");

	req.write(cbor.encode(JSON.parse(message.toString())));

	req.on('response', function(res) {
		var resp = cbor.decodeAllSync(res.payload)[0];
		console.log(resp);
		res.on('end', function() {
		})
	})

	req.on('error', function(err) { console.log(err); });

	req.end()
});

function OnCmd(dev_addr, dev_info, req_cbor) {
	console.log("Publish cmd", dev_info.name, JSON.stringify(req_cbor));
	//client.publish("/thread/in/" + dev_info.name, JSON.stringify(req_cbor));
}

function OnRep(dev_addr, dev_info, req_cbor) {
	switch (dev_info.type) {
		case "dimmer": {
			if (typeof req_cbor.t !== 'undefined')
				req_cbor.t = req_cbor.t * 0.25;
			if (typeof req_cbor.V !== 'undefined')
				req_cbor.V = req_cbor.V * 45 / 37033;
			if (typeof req_cbor.v !== 'undefined')
				req_cbor.v = req_cbor.v * 9 / 40960;
			break;
		}
		case "router": {
			if (typeof req_cbor.t !== 'undefined')
				req_cbor.t = req_cbor.t * 0.25;
			if (typeof req_cbor.V !== 'undefined')
				req_cbor.V = req_cbor.V * 45 / 37033;
			if (typeof req_cbor.v !== 'undefined')
				req_cbor.v = req_cbor.v * 9 / 40960;
			break;
		}
		case "bme280": {
			if (typeof req_cbor.t !== 'undefined')
				req_cbor.t = req_cbor.t * 0.25;
			if (typeof req_cbor.V !== 'undefined')
				req_cbor.V = req_cbor.V * 45 / 37033;
			if (typeof req_cbor.v !== 'undefined')
				req_cbor.v = req_cbor.v * 9 / 40960;

			if (typeof req_cbor.P !== 'undefined')
				req_cbor.P = req_cbor.P / 100;
			if (typeof req_cbor.T !== 'undefined')
				req_cbor.T = req_cbor.T / 100;
			if (typeof req_cbor.H !== 'undefined')
				req_cbor.H = req_cbor.H / 1024;
			break;
		}
		case "bme280b": {
			if (typeof req_cbor.t !== 'undefined')
				req_cbor.t = req_cbor.t * 0.25;
			if (typeof req_cbor.v !== 'undefined')
				req_cbor.v = req_cbor.v * 9 / 40960;

			if (typeof req_cbor.P !== 'undefined')
				req_cbor.P = req_cbor.P / 100;
			if (typeof req_cbor.T !== 'undefined')
				req_cbor.T = req_cbor.T / 100;
			if (typeof req_cbor.H !== 'undefined')
				req_cbor.H = req_cbor.H / 1024;
			break;
		}
		case "hdc1080": {
			if (typeof req_cbor.t !== 'undefined')
				req_cbor.t = req_cbor.t * 0.25;
			if (typeof req_cbor.V !== 'undefined')
				req_cbor.V = req_cbor.V * 45 / 37033;
			if (typeof req_cbor.v !== 'undefined')
				req_cbor.v = req_cbor.v * 9 / 40960;

			if (typeof req_cbor.T !== 'undefined')
				req_cbor.T = req_cbor.T * 165 / 65536 - 40;
			if (typeof req_cbor.H !== 'undefined')
				req_cbor.H = req_cbor.H * 100 / 65536;
			break;
		}
		case "buttonb": {
			if (typeof req_cbor.t !== 'undefined')
				req_cbor.t = req_cbor.t * 0.25;
			if (typeof req_cbor.v !== 'undefined')
				req_cbor.v = req_cbor.v * 9 / 40960;
			break;
		}
	}
//	console.log("Publish", dev_info.name, JSON.stringify(req_cbor));
	client.publish("/thread/in/" + dev_info.name, JSON.stringify(req_cbor));
}

function OnUp(dev_addr, dev_info, req_cbor) {
	var req_sub = coap.request({
		hostname: dev_addr,
		pathname: 'sub',
		method: 'PUT',
		confirmable: true,
	});

	req_sub.setOption("Content-Format", "application/cbor");

	var req_params;
	if (req_cbor.t == "dimmer") {
		req_params = {
			'a': my_address,
			's': {
				'r': {'i': 10000, 'r': 0},
				'g': {'i': 10000, 'r': 0},
				'b': {'i': 10000, 'r': 0},
				'w': {'i': 10000, 'r': 0},
				'v': {'i': 10000, 'r': 10},
				'V': {'i': 10000, 'r': 10},
				't': {'i': 30000, 'r': 2},
			}
		};
	} else if (req_cbor.t == "router") {
		req_params = {
			'a': my_address,
			's': {
				'v': {'i': 10000, 'r': 10},
//				'V': {'i': 10000, 'r': 10},
				't': {'i': 30000, 'r': 2},
			}
		};
	} else if (req_cbor.t == "bme280") {
		req_params = {
			'a': my_address,
			's': {
				'P': {'i': 10000, 'r': 0},
				'T': {'i': 10000, 'r': 0},
				'H': {'i': 10000, 'r': 0},
				'v': {'i': 10000, 'r': 10},
//				'V': {'i': 10000, 'r': 10},
				't': {'i': 30000, 'r': 2},
			}
		};
	} else if (req_cbor.t == "bme280b") {
		req_params = {
			'a': my_address,
			's': {
				'P': {'i': 120000, 'r': 0},
				'T': {'i': 120000, 'r': 0},
				'H': {'i': 120000, 'r': 0},
				'v': {'i': 120000, 'r': 10},
				't': {'i': 120000, 'r': 2},
			}
		};
	} else if (req_cbor.t == "hdc1080") {
		req_params = {
			'a': my_address,
			's': {
				'T': {'i': 10000, 'r': 0},
				'H': {'i': 10000, 'r': 0},
				'v': {'i': 10000, 'r': 10},
//				'V': {'i': 10000, 'r': 10},
				't': {'i': 30000, 'r': 2},
			}
		};
	} else if (req_cbor.t == "buttonb") {
		req_params = {
			'a': my_address,
			's': {
				'v': {'i': 1800000, 'r': 16},
				't': {'i': 1800000, 'r': 2},
			}
		};
	}
	req_sub.on('error', function(err) { console.log(err); });
	req_sub.write(cbor.encode(req_params));
	req_sub.end();
}

function DevAddrByDevName(dev_name) {
	for (var key in ipv6_dev) {
		if (ipv6_dev[key].name == dev_name)
			return key
	}
	return null;
}

function BinaryAddressToString6(addr) {
	var str = "";
	var delCtr = 0;
	addr.forEach(function(byte) {
		if (delCtr > 0 && delCtr % 2 == 0)
			str += ":";
		delCtr++;
		str += ('0' + (byte & 0xFF).toString(16)).slice(-2);
	});
	return str;
}

function SaveDevicesDB() {
	console.log("Saving devices database");
	if (fs.existsSync('devices.json'))
		fs.renameSync("devices.json", "devices.json.bcp")
	fs.writeFileSync("devices.json", JSON.stringify(ipv6_dev, null, '\t'));
}

function GetNewDevName(type) {
	for (var i = 1; i < 100; i++) {
		var name = type + '_' + ('0' + i.toString()).slice(-2);
		var addr = DevAddrByDevName(name);
		if (addr == null)
			return name;
	}
	return null;
}

function UpdateDevicesDB(req, req_cbor) {
	var ml_eid;
	
	if (typeof req_cbor.a !== 'undefined')
		ml_eid = BinaryAddressToString6(req_cbor.a);
	else
		return false;

	var dev_addr = req.rsinfo.address;

	var dev = {
		mac_addr: null,
		ext_addr: null,
		ml_eid: ml_eid,
		name: null,
		type: null,
		ver: null,
		last_up: +new Date(),
	};

	if (typeof req_cbor.t !== 'undefined')
		dev.type = req_cbor.t;

	if (typeof req_cbor.v !== 'undefined')
		dev.ver = req_cbor.v;

	if (typeof req_cbor.m !== 'undefined')
		dev.mac_addr = req_cbor.m.toString('hex');

	if (typeof req_cbor.e !== 'undefined')
		dev.ext_addr = req_cbor.e.toString('hex');

	if (typeof ipv6_dev[dev_addr] == 'undefined') {
		dev.name = GetNewDevName(dev.type);
		if (dev.name == null)
			return false;
		ipv6_dev[dev_addr] = dev;
		console.log("New device: ", dev);
	} else {
		dev.name = ipv6_dev[dev_addr].name;
		ipv6_dev[dev_addr] = dev;
		console.log("Update device: ", dev);
	}

	SaveDevicesDB();

	return true;
}

function GetWPANIPv6Address(if_name) {
	var interfaces = os.networkInterfaces();
	if (typeof interfaces[if_name] === 'undefined')
		return null;

	var iface = interfaces[if_name];

	for (var i = 0; i < iface.length; i++) {
		var addr = iface[i];
		if (addr.address.startsWith('fd'))
			return ip6addr.parse(addr.address).toBuffer();
	}

	return null;
}
