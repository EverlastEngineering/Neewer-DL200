let bleDolly;                        
const serviceUuid = 0xffe0;
const generalCharacteristic = "69400001-b5a3-f393-e0a9-e50e24dcca99";   
const writingCharacteristic = "69400002-b5a3-f393-e0a9-e50e24dcca99";   
const readingCharacteristic = "69400003-b5a3-f393-e0a9-e50e24dcca99";   

var experimentalFlag = true;

const speed1 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x01,0x00,0x00,0x9a])
const speed2 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x02,0x00,0x00,0x9a])
const speed3 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x03,0x00,0x00,0x9a])
const speed4 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x04,0x00,0x00,0x9a])
const speed5 = new Uint8Array([0x90,0x01,0x05,0x01,0x00,0x05,0x00,0x00,0x9a])

const goright = new Uint8Array([0x90,0x01,0x05,0x01,0x01,0xff,0xff,0x00,0x96])
const goleft = new Uint8Array([0x90,0x01,0x05,0x01,0x01,0x00,0xff,0x00,0x96])
const stopcommand = new Uint8Array([0x90,0x01,0x05,0x01,0x01,0xff,0x00,0x00,0x97])
const modeforstop = new Uint8Array([0x90,0x06,0x05,0x01,0x00,0x00,0x00,0x00,0x9c])


const log = console.log

let characteristic;
// ------------------ Bluetooth Connection functions
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
    characteristic = await service.getCharacteristic(writingCharacteristic);

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

    //write to device as a test
    await characteristic.writeValueWithoutResponse(speed5);
    await sleep(100);
    await characteristic.writeValueWithoutResponse(speed4);
    await sleep(100);
    await characteristic.writeValueWithoutResponse(speed3);
    await sleep(100);
    await characteristic.writeValueWithoutResponse(speed2);
    await sleep(100);
    await characteristic.writeValueWithoutResponse(speed1);
    log('Connection successful.')
  } catch(error) {
    // document.querySelector('#writeButton').disabled = true;
    log('Argh! ' + error);
    bleDolly = null;
  }
}

async function gototheright() {
  // if (confirm('ready to move right?')) 
    await characteristic.writeValueWithoutResponse(goright)
}

async function gototheleft() {
  // if (confirm('ready to move left?'))
    await characteristic.writeValueWithoutResponse(goleft)
}

async function gotostop() {
  await characteristic.writeValueWithoutResponse(stopcommand)
}

async function backforth() {
  await characteristic.writeValueWithoutResponse(goleft)
  await sleep(3000);
  await characteristic.writeValueWithoutResponse(stopcommand)
  await sleep(3000);
  await characteristic.writeValueWithoutResponse(goright)
  await sleep(3000);
  await characteristic.writeValueWithoutResponse(stopcommand)
  await sleep(3000);
  backforth();
 
}

async function emergencystop() {
  await characteristic.writeValueWithoutResponse(modeforstop)
}

let sleepSetTimeout_ctrl;

function sleep(ms) {
    clearInterval(sleepSetTimeout_ctrl);
    return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
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
  }
}