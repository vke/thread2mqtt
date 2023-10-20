#!/usr/bin/env node

'use strict';

const wpantund_interface = "wpan0";
const mesh_local_prefix = "fdde:ad00:beef";
const devices_db_filename = "devices.json";

const firmware_types = require('./firmware_types')

process.on('SIGINT', function () {
	SaveDevicesDB();
	console.log("Shutting down");
	process.exit(0);
});

const os = require('os');
const fs = require('fs');
const mqtt = require('mqtt');
const coap = require('coap');
const cbor = require('cbor');
const ip6addr = require('ip6addr');

let my_address = GetWPANIPv6Address(wpantund_interface);
if (my_address == null) {
	console.log("Unknown server's IPv6 address");
	process.exit(1);
}
console.log("My own address: ", BinaryAddressToString6(my_address));

coap.updateTiming({
	maxRetransmit: 1,
});

let known_devices = LoadDevicesDB();

const client = mqtt.connect();

client.subscribe("/thread/out/#");

const coap_server = coap.createServer({ type: 'udp6', sendAcksForNonConfirmablePackets: false });

coap_server.on('request', function (req, res) {
	const req_cbor = cbor.decodeAllSync(req.payload)[0];

	// expand ipv6 address
	const dev_addr = BinaryAddressToString6(ip6addr.parse(req.rsinfo.address).toBuffer());

	if (req.url == '/up') {
		if (!UpdateDevicesDB(dev_addr, req, req_cbor))
			return;
	}

	if (!(dev_addr in known_devices)) {
		console.log("Request from unknown device: " + req.rsinfo.address);
		return;
	}

	const dev_info = known_devices[dev_addr];
	let resp_json = {};

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
	const pieces = topic.split("/");
	const device = pieces[3];

	const dev_addr = DevAddrByDevName(device);

	if (dev_addr == null) {
		console.log("Unknown device: " + device);
		return;
	}

	let req = coap.request({
		hostname: dev_addr,
		pathname: 'set',
		method: 'PUT',
		confirmable: true,
	});

	req.setOption("Content-Format", "application/cbor");

	req.write(cbor.encode(JSON.parse(message.toString())));

	req.on('response', function (res) {
		var resp = cbor.decodeAllSync(res.payload)[0];
		res.on('end', function () {
		})
	})

	req.on('error', function (err) { console.log(err); });

	req.end()
});

function OnCmd(dev_addr, dev_info, req_cbor) {
	console.log(new Date().toISOString().replace(/T/, ' ').replace(/Z/, '') + ";Publish cmd", dev_info.name, JSON.stringify(req_cbor));
	client.publish("/thread/in/" + dev_info.name, JSON.stringify(req_cbor));
}

function OnRep(dev_addr, dev_info, req_cbor) {
//	console.log("Publish", dev_info.name, JSON.stringify(req_cbor));
	client.publish("/thread/in/" + dev_info.name, JSON.stringify(firmware_types[dev_info.type].convert(req_cbor)));
}

function OnUp(dev_addr, dev_info, req_cbor) {
	let req_sub = coap.request({
		hostname: dev_addr, // FIXME: ml_eid or dev_addr?
		pathname: 'sub',
		method: 'PUT',
		confirmable: true,
	});

	req_sub.setOption("Content-Format", "application/cbor");

	req_sub.on('error', function (err) { console.log(err); });
	req_sub.write(cbor.encode(firmware_types[req_cbor.t].subscribe(my_address)));
	req_sub.end();
}

function DevAddrByDevName(dev_name) {
	for (let key in known_devices) {
		if (known_devices[key].name == dev_name)
			return key
	}
	return null;
}

function BinaryAddressToString6(addr) {
	return addr.toString('hex').match(/.{1,4}/g).join(':');
}

function LoadDevicesDB() {
	let known_devices = {};
	if (fs.existsSync(devices_db_filename))
		known_devices = JSON.parse(fs.readFileSync(devices_db_filename));
	return known_devices;
}

function SaveDevicesDB() {
	console.log("Saving devices database");
	if (fs.existsSync(devices_db_filename))
		fs.renameSync(devices_db_filename, `${devices_db_filename}.bcp`);
	fs.writeFileSync(devices_db_filename, JSON.stringify(known_devices, null, '\t'));
}

function GetNewDevName(type) {
	for (let i = 1; i < 100; i++) {
		let name = type + '_' + ('0' + i.toString()).slice(-2);
		const addr = DevAddrByDevName(name);
		if (addr == null)
			return name;
	}
	return null;
}

function UpdateDevicesDB(dev_addr, req, req_cbor) {
	if (!('a' in req_cbor)) {
		console.log("No address field in /up request", dev_addr, req, req_cbor);
		return false;
	}

	if (!('t' in req_cbor)) {
		console.log("No type field in /up request", dev_addr, req, req_cbor);
		return false;
	}

	if (!(req_cbor.t in firmware_types)) {
		console.log("Unknown firmware type", dev_addr, req, req_cbor);
		return false;
	}

	let ml_eid = BinaryAddressToString6(req_cbor.a);
	if (dev_addr != ml_eid) {
		console.log("Different ml-eid and device addresses", ml_eid, dev_addr);
		return false;
	}

	let dev = {
		mac_addr: ('m' in req_cbor) ? req_cbor.m.toString('hex') : null,
		ext_addr: ('e' in req_cbor) ? req_cbor.e.toString('hex') : null,
		ml_eid: ml_eid,
		name: null,
		type: req_cbor.t,
		ver: req_cbor.v ?? null,
		last_up: +new Date(),
	};

	if (ml_eid in known_devices) {
		dev.name = known_devices[ml_eid].name;
		known_devices[ml_eid] = dev;
		console.log("Update device: ", dev);
	} else {
		dev.name = GetNewDevName(dev.type);
		if (dev.name == null)
			return false;
		known_devices[ml_eid] = dev;
		console.log("New device: ", dev);
	}

	SaveDevicesDB();

	return true;
}

function GetWPANIPv6Address(if_name) {
	const interfaces = os.networkInterfaces();
	if (!(if_name in interfaces))
		return null;

	const iface = interfaces[if_name];

	for (var i = 0; i < iface.length; i++) {
		const addr = iface[i];
		if (addr.address.startsWith(mesh_local_prefix) && addr.address.indexOf('::ff:fe00:') == -1)
			return ip6addr.parse(addr.address).toBuffer();
	}

	return null;
}
