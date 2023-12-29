/*
This script connects to a TS-04 multimeter using web-bluetooth
and parses the meter's data protocol. It then calls functions from display.js
to populate an HTML page.

created 6 Aug 2018
by Tom Igoe
*/


var myDevice;                         // web-bluetooth peripheral device
var serviceUuid = 0xffe0;
var generalCharacteristic = "69400001-b5a3-f393-e0a9-e50e24dcca99";   
var writingCharacteristic = "69400002-b5a3-f393-e0a9-e50e24dcca99";   
var readingCharacteristic = "69400003-b5a3-f393-e0a9-e50e24dcca99";   

var experimentalFlag = true;

var speed1 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x01,0x00,0x00,0x9a])
var speed2 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x02,0x00,0x00,0x9a])
var speed3 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x03,0x00,0x00,0x9a])
var speed4 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x04,0x00,0x00,0x9a])
var speed5 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x05,0x00,0x00,0x9a])


const log = console.log

// ------------------ Bluetooth Connection functions
async function connect() {
  try {
    log('Requesting any Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      // filters: [{ services: [serviceUuid] }]
        acceptAllDevices: true
        ,optionalServices: [serviceUuid,generalCharacteristic,writingCharacteristic,readingCharacteristic]
      });
    myDevice = device;
    log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    log('Getting Service...');
    const services = await server.getPrimaryServices();
    
    const service = await server.getPrimaryService(generalCharacteristic);
    
    const characteristics = await service.getCharacteristics();
    log('Getting Characteristic...');
    const characteristic = await service.getCharacteristic(writingCharacteristic);

    log('Getting Descriptor...');
    const descriptors = await characteristic.getDescriptors()
    // myDescriptor = await characteristic.getDescriptor('gatt.characteristic_user_description');
    myDescriptor = descriptors[0]

    // document.querySelector('#writeButton').disabled =
    //     !characteristic.properties.write;

    log('Reading Descriptor...');
    const value = await myDescriptor.readValue();

    let decoder = new TextDecoder('utf-8');
    log('> Characteristic User Description: ' + decoder.decode(value));

    //write to device as a test
    var result = await characteristic.writeValueWithoutResponse(speed2);
    log('yay!')
  } catch(error) {
    // document.querySelector('#writeButton').disabled = true;
    log('Argh! ' + error);
  }
}

function populateBluetoothDevices() {
  try {
  navigator.bluetooth.getDevices({
    filters: [{ services: [serviceUuid] }]
  })
  .then(device => {
    // save the device returned so you can disconnect later:
    myDevice = device;
    // connect to the device once you find it:
    gattConnect(device[0])
    
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
  }
  catch(error) {
    //very likely the experimental flag is off, fallback!
    experimentalFlag = false;
  }
  
}
  
function gattConnect(device) {
  device.gatt.connect()
  .then(server => {
    // get the primary service:
    return server.getPrimaryService(serviceUuid);
  })
  .then(service => {
    // Step 4: get the meter reading characteristic:
    return service.getCharacteristic(writingCharacteristic);
  })
  .then(characteristic => {
    // subscribe to the characteristic:
    characteristic.startNotifications()
    .then(subscribeToChanges);
  })
  .catch(error => {
    // catch any errors:
    console.error('Connection failed!', error);
    device.forget();
  });
}

window.onload = () => {
  populateBluetoothDevices();
};

// subscribe to changes from the meter:
function subscribeToChanges(characteristic) {
  characteristic.oncharacteristicvaluechanged = handleData;
}

// handle incoming data:
function handleData(event) {
  // get the data buffer from the meter:
  var buf = new Uint8Array(event.target.value.buffer);
  // decode the results if this is the correct characteristic:
  if (buf.length == 9) {
    // decode the binary string:
    decode(buf);
    // from display.js, fill the HTML page:
    fillDisplay(meter);
  }
}

// disconnect function:
function disconnect() {
  if (myDevice) {
    // disconnect:
    myDevice.gatt.disconnect();
  }
}