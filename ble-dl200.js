// bluetooth magic numbers
const serviceUuid = 0xffe0;
const generalCharacteristic = "69400001-b5a3-f393-e0a9-e50e24dcca99";   
const writingCharacteristic = "69400002-b5a3-f393-e0a9-e50e24dcca99";   
const readingCharacteristic = "69400003-b5a3-f393-e0a9-e50e24dcca99";   

const SPEED1 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x01,0x00,0x00,0x9a])
const SPEED2 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x02,0x00,0x00,0x9a])
const SPEED3 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x03,0x00,0x00,0x9a])
const SPEED4 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x04,0x00,0x00,0x9a])
const SPEED5 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x05,0x00,0x00,0x9a])

const ENABLEMOTIONTORIGHT = new Uint8Array([0x90,0x01,0x05,0x01,0x01,0xff,0xff,0x00,0x96])
const ENABLEMOTIONTOLEFT = new Uint8Array([0x90,0x01,0x05,0x01,0x01,0x00,0xff,0x00,0x96])
const STOPCOMMAND = new Uint8Array([0x90,0x01,0x05,0x01,0x01,0xff,0x00,0x00,0x97])
const MANUALMODE = new Uint8Array([0x90,0x06,0x05,0x01,0x00,0x00,0x00,0x00,0x9c])
const LIVEVIDEOMODE = new Uint8Array([0x90,0x06,0x05,0x02,0x00,0x00,0x00,0x00,0x9d])

const CONSTANTACCEL = new Uint8Array([0x90,0x01,0x05,0x01,0x02,0x00,0x00,0x00,0x99])
const SLOWACCEL	 = new Uint8Array([0x90,0x01,0x05,0x01,0x02,0xff,0x00,0x00,0x98])

// i'm THIS lazy
const log = console.log

let bleDolly;                        
let sequenceactive = true;
let characteristic = {};
let _characteristic;

async function connect() {
	try {
		log('Requesting any Bluetooth Device...');

		if (!await navigator.bluetooth.getAvailability()) return;
		
		if (!bleDolly) {
			bleDolly = await navigator.bluetooth.requestDevice({
			filters: [
				// { services: [serviceUuid] },
				// { services: [generalCharacteristic] },
				{ name: `NEEWER-DL200`}
			]
				// acceptAllDevices: true
				,optionalServices: [serviceUuid,generalCharacteristic,writingCharacteristic,readingCharacteristic]
			});
		}
		log('Connecting to GATT Server...');
		const server = await bleDolly.gatt.connect();

		log('Getting Service...');
		const services = await server.getPrimaryServices();
		
		const service = await server.getPrimaryService(generalCharacteristic);
		
		const characteristics = await service.getCharacteristics();
		log('Getting Characteristic...');
		_characteristic = await service.getCharacteristic(writingCharacteristic);

		// log('Getting Descriptor...');
		// const descriptors = await characteristic.getDescriptors()
		// // myDescriptor = await characteristic.getDescriptor('gatt.characteristic_user_description');
		// myDescriptor = descriptors[0]

		// // document.querySelector('#writeButton').disabled =
		// //     !characteristic.properties.write;

		// log('Reading Descriptor...');
		// const value = await myDescriptor.readValue();

		// let decoder = new TextDecoder('utf-8');
		// log('> Characteristic User Description: ' + decoder.decode(value));

		//write something visible to device as a test
		await characteristic.writeValueWithoutResponse(SPEED5);
		await sleep(100);
		await characteristic.writeValueWithoutResponse(SPEED4);
		await sleep(100);
		await characteristic.writeValueWithoutResponse(SPEED3);
		await sleep(100);
		await characteristic.writeValueWithoutResponse(SPEED2);
		await sleep(100);
		await characteristic.writeValueWithoutResponse(SPEED1);
		uidisablement(disabled=false);
		log('Connection successful.')
	} catch(error) {
		// document.querySelector('#writeButton').disabled = true;
		log('Argh! ' + error);
		bleDolly = null;
	}
}

characteristic.writeValueWithoutResponse = async function(value) {
	if (_characteristic && bleDolly) {
		try {
			await _characteristic.writeValueWithoutResponse(value);
		}
		catch(e)
		{log(`command failed: ${e}`)}
		stopsequence();
	}
	else {
		log('unable to comply: likely not connected')
	}
}

async function gototheright() {
	// if (confirm('ready to move right?')) 
		await characteristic.writeValueWithoutResponse(ENABLEMOTIONTORIGHT)
}

async function gototheleft() {
	// if (confirm('ready to move left?'))
		await characteristic.writeValueWithoutResponse(ENABLEMOTIONTOLEFT)
}

async function gotostop() {
	await characteristic.writeValueWithoutResponse(STOPCOMMAND)
	stopsequence();
}

function movementrelease() {
	if (momentary) gotostop();
}

let travelfor = 4000;
let stopfor = 4000;
function settravelfor(time) {
	travelfor = time;
	log(`travelfor: ${travelfor}`)
}
function setstopfor(time) {
	stopfor = time;
	log(`stopfor: ${stopfor}`)
}

async function backforth(left) {
	sequenceactive = true;
	while (sequenceactive) {
		if (left) await characteristic.writeValueWithoutResponse(ENABLEMOTIONTOLEFT)
		else await characteristic.writeValueWithoutResponse(ENABLEMOTIONTORIGHT)
		await sleep(travelfor);
		await characteristic.writeValueWithoutResponse(STOPCOMMAND)
		await sleep(stopfor);
		if (!sequenceactive) return;
		if (left) await characteristic.writeValueWithoutResponse(ENABLEMOTIONTORIGHT)
		else await characteristic.writeValueWithoutResponse(ENABLEMOTIONTOLEFT)
		await sleep(travelfor);
		await characteristic.writeValueWithoutResponse(STOPCOMMAND)
		await sleep(stopfor);
	}
}

let superslowdelay = 150;
async function superslow(left) {
	sequenceactive = false;
	await characteristic.writeValueWithoutResponse(SPEED1)
	await sleep(250);
	await characteristic.writeValueWithoutResponse(SLOWACCEL)
	await sleep(250);
	sequenceactive = true;
	let i = 0;
	while (sequenceactive) {
		if (left) await characteristic.writeValueWithoutResponse(ENABLEMOTIONTOLEFT)
		else await characteristic.writeValueWithoutResponse(ENABLEMOTIONTORIGHT)
		await sleep(superslowdelay);
		if (i == 0) await sleep(50);
		await characteristic.writeValueWithoutResponse(STOPCOMMAND)
		await sleep(superslowdelay);
		i++;
		log(`superslow iteration: ${i}`)
	}
}


async function setsuperslowdelay(delay) {
	superslowdelay = delay
}

let movesmallestdelay = 100;
async function movesmallest(left) {
	// sequenceactive = true;
	await characteristic.writeValueWithoutResponse(SPEED1)
	await sleep(250);
	await characteristic.writeValueWithoutResponse(CONSTANTACCEL)
	await sleep(250);
	// while (sequenceactive) {
		if (left) await characteristic.writeValueWithoutResponse(ENABLEMOTIONTOLEFT)
		else await characteristic.writeValueWithoutResponse(ENABLEMOTIONTORIGHT)
		await sleep(movesmallestdelay);
		await characteristic.writeValueWithoutResponse(STOPCOMMAND)
		// await sleep(movesmallestdelay);
	// }
}

async function testspeed1(left) {
	await characteristic.writeValueWithoutResponse(CONSTANTACCEL)
	await sleep(100);
	await characteristic.writeValueWithoutResponse(SPEED1)
	await sleep(100);
	if (left) await characteristic.writeValueWithoutResponse(ENABLEMOTIONTOLEFT)
		else await characteristic.writeValueWithoutResponse(ENABLEMOTIONTORIGHT)
	await sleep(3000);
	await emergencystop()
}

async function testslowspeed(left) {
	await characteristic.writeValueWithoutResponse(CONSTANTACCEL)
	await sleep(100);
	await characteristic.writeValueWithoutResponse(SPEED1)
	await sleep(100);
	superslow(left);
	await sleep(3500);
	await emergencystop()
}

async function setmovesmallestdelay(delay) {
	movesmallestdelay = delay
}

async function setspeed(speed) {
	switch (speed) {
		case 1:
			await characteristic.writeValueWithoutResponse(SPEED1)
			break;
		case 2:
			await characteristic.writeValueWithoutResponse(SPEED2)
			break;
		case 3:
			await characteristic.writeValueWithoutResponse(SPEED3)
			break;
		case 4:
			await characteristic.writeValueWithoutResponse(SPEED4)
			break;
		case 5:
			await characteristic.writeValueWithoutResponse(SPEED5)
			break;
		default:
			break;
	}
}

function stopsequence() {
	sequenceactive = false;
}

async function constantaccel() {
	await characteristic.writeValueWithoutResponse(CONSTANTACCEL)
}

async function slowaccel() {
	await characteristic.writeValueWithoutResponse(SLOWACCEL)
}

async function emergencystop() {
	log('emergency stop')
	sequenceactive = false;
	for (i=0;i<3;i++) {
		await characteristic.writeValueWithoutResponse(LIVEVIDEOMODE)
		await sleep(50);
		await characteristic.writeValueWithoutResponse(CONSTANTACCEL)
		await sleep(50);
		await characteristic.writeValueWithoutResponse(STOPCOMMAND)
		await sleep(50);
		await characteristic.writeValueWithoutResponse(MANUALMODE)
		await sleep(50);
	}
	await characteristic.writeValueWithoutResponse(SLOWACCEL)
	log('emergency stop complete')
}

let sleepSetTimeout_ctrl;

function sleep(ms) {
		// clearInterval(sleepSetTimeout_ctrl);
		return new Promise(resolve => setTimeout(resolve, ms));
}
// function populateBluetoothDevices() {
//   try {
//   navigator.bluetooth.getDevices({
//     filters: [{ services: [serviceUuid] }]
//   })
//   .then(device => {
//     // save the device returned so you can disconnect later:
//     myDevice = device;
//     // connect to the device once you find it:
//     gattConnect(device[0])
		
//   })
//   .catch(error => {
//     console.log('Argh! ' + error);
//   });
//   }
//   catch(error) {
//     //very likely the experimental flag is off, fallback!
//     experimentalFlag = false;
//   }
	
// }
	
// function gattConnect(device) {
//   device.gatt.connect()
//   .then(server => {
//     // get the primary service:
//     return server.getPrimaryService(serviceUuid);
//   })
//   .then(service => {
//     // Step 4: get the meter reading characteristic:
//     return service.getCharacteristic(writingCharacteristic);
//   })
//   .then(characteristic => {
//     // subscribe to the characteristic:
//     characteristic.startNotifications()
//     .then(subscribeToChanges);
//   })
//   .catch(error => {
//     // catch any errors:
//     console.error('Connection failed!', error);
//     device.forget();
//   });
// }

// window.onload = () => {
//   populateBluetoothDevices();
// };

// subscribe to changes from the meter:
// function subscribeToChanges(characteristic) {
//   characteristic.oncharacteristicvaluechanged = handleData;
// }

// // handle incoming data:
// function handleData(event) {
//   // get the data buffer from the meter:
//   var buf = new Uint8Array(event.target.value.buffer);
//   // decode the results if this is the correct characteristic:
//   if (buf.length == 9) {
//     // decode the binary string:
//     decode(buf);
//     // from display.js, fill the HTML page:
//     fillDisplay(meter);
//   }
// }

// disconnect function:
function disconnect() {
	if (bleDolly) {
		// disconnect:
		bleDolly.gatt.disconnect();
		uidisablement(disabled=true);
	}
}

let lastkeydown = 'none';
let modifiersdown = 0;
function downKey(e) {
	
	if (e.code == lastkeydown) return;
	switch (e.code) {
		case 'MetaLeft':
		case 'MetaRight':
		case 'ShiftLeft':
		case 'ShiftRight':
		case 'ControlLeft':
		case 'ControlRight':
			// log(`key: ${e.code}`);
			modifiersdown = modifiersdown + 1;
			// log(`modifiersdown: ${modifiersdown}`)
			break;
	}
	if (modifiersdown > 0) {
		return;
	}
	// log(`key: ${e.code}`);
	switch (e.code) {
		case 'ArrowLeft':
		case 'Numpad4':
			gototheleft();
			break;
		case 'ArrowRight':
		case 'Numpad6':
			gototheright();
			break;
		case 'Space':
			gotostop();
			document.getElementById("stop").focus();
			break;
		case 'Minus':
		case 'NumpadSubtract':
			movesmallest(true);
			break;
		case 'Equal':
		case 'NumpadAdd':
			movesmallest(false);
			break;
		case 'Digit1':
			setspeed(1);
			break;
		case 'Digit2':
			setspeed(2);
			break;
		case 'Digit3':
			setspeed(3);
			break;
		case 'Digit4':
			setspeed(4);
			break;
		case 'Digit5':
			setspeed(5);
			break;
		case 'Comma':
			superslow(true);
			break;
		case 'Period':
			superslow(false);
			break;
		case 'KeyC':
			constantaccel();
			break;
		case 'KeyS':
			slowaccel();
			break;
		case 'KeyE':
			emergencystop();
			break;
		case 'KeyO':
			connect();
			break;
		case 'KeyD':
			disconnect();
			break;
		case 'KeyL':
				backforth(true);
				break;
		case 'KeyR':
				backforth(false);
				break;
		case 'KeyN':
				stopsequence();
				break;
		case 'KeyM':
			momentary = !momentary;
			let momentarycheckbox = document.getElementById("momentary")
			momentarycheckbox.checked = momentary;
			break;
	}
}

function upKey(e) {
	if (!momentary) return;
	lastkeydown = 'none'
	// log(`key: ${e.code}`);
	switch (e.code) {
		case 'MetaLeft':
		case 'MetaRight':
		case 'ShiftLeft':
		case 'ShiftRight':
		case 'ControlLeft':
		case 'ControlRight':
			modifiersdown--;
			modifiersdown < 0 ? modifiersdown = 0 : modifiersdown = modifiersdown;
			break;
		case 'ArrowLeft':
		case 'Numpad4':
		case 'ArrowRight':
		case 'Numpad6':
			gotostop();
			break;
	}
}

document.onkeydown = downKey
document.onkeyup = upKey

let momentary = true;
function changemomentary(isMomentary) {
	momentary = isMomentary;
}

window.onunload = async function () {
	emergencystop();
}

window.onload = function () {
	uidisablement(disabled=true); // my distain for double negatives is stronger than my distain for the fact that this works. actually, i rather like this <--
}

async function uidisablement(disabled) {
	var buttons = [...document.querySelectorAll("button"), ...document.querySelectorAll("input")]; 
	for(var i = 0, len = buttons.length; i < len; i++) {  
		button = buttons[i]
		button.disabled = disabled;
	}
	document.getElementById("connect").disabled = !disabled;
}
