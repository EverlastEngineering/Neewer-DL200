# Reverse Engineering the Neewer DL200

> [!NOTE]  
> You can find a permanent link to the published web application here:
>
> https://everlastengineering.com/neewer-dl200/


## BLE Characteristics

Neewer markets this device as a "Motorized Camera Dolly with App Control". My device broadcasts the following information over BLE:

```
Name:
	NEEWER-DL200
Address:
	06:DE:31:FD:16:B7
Services:
	69400001-b5a3-f393-e0a9-e50e24dcca99
```

Inside are three characteristics. Sending data to the device is done in this one:

```
ID:
69400002-b5a3-f393-e0a9-e50e24dcca99-0x12c1b093280
UUID:
69400002-b5a3-f393-e0a9-e50e24dcca99
```

Receiving data from the device is done in this characteristic:
```
ID:
69400003-b5a3-f393-e0a9-e50e24dcca99-0x12c10d9bf10
UUID:
69400003-b5a3-f393-e0a9-e50e24dcca99
```

It is completely possible to use chrome to do this from `chrome://bluetooth-internals/#devices/` once the experimental BLE options are enabled.

# Sending Data

## Mode: `Manual`

### Set manual mode
	Value: 90060501000000009c

### Execute

Go Right

	Value: 9001050101ffff0096

Go Left
	
	Value: 900105010100ff0097

_Note: with regard to the Execute command and direction, any non-zero value in the seventh byte enables 'right', while a 00 value goes 'left'._

### Set Sliding speed
Speeds are set from from 1 to 5:

```
Value: 900105010001000098

Value: 900105010002000099

Value: 90010501000300009a

Value: 90010501000400009b

Value: 90010501000500009c
```

_(Lol at the graph in the app that is completely unrelated to the speed setting.)_

### Set Running Mode
Constant Speed

	Value: 900105010200000099

Slow

	Value: 9001050102ff000098



### Stop Movement

	Value: 9001050101ff000097 (when stopping from Go, Right command)

	Value: 900105010100000098 (when stopping from Go, Left command)

_Note: It seems to be unimportant which of these are sent when issuing a Stop. Either left or right will slow the device down if slow is enabled, or stop it outright if constant speed is set._

## Mode: `Live video`

### Set Live video mode
	Value: 90060502000000009d

### Execute Live video shot:
	Value: 9001050205ff00009c

### Set Time
```
Value: 9001050202 followed by the number of seconds in hex plus "checksum"
eg: 21 seconds
Value: 9001050202150000af - 15 is hex for 21
eg: 19 - set time to 20 seconds
Value: 9001050202140000ae - 14 is hex for 21
```

_todo: look at large format number_

### Set Distance
```
Value: 9001050201 followed by the number of cm in hex plus "checksum"
eg: 67cm
Value: 9001050201430000dc
eg: 68cm
Value: 9001050201440000dd
```

`Note - minimum of 66cm enforced by firmware. Maximum not tested.`

### Set Direction

Left

	Value: 90010502030000009b

Right

	Value: 9001050203ff00009a

### Set Running Mode

Constant

	Value: 90010502040000009c

Slow
	
	Value: 9001050204ff00009b

## Mode: `Timelapse`

### Set Timelapse mode
	Value: 90060503000000009e

### Execute Timelapse Shot
	Value: 9001050300ff000098

_todo: is this right or either? if either, how to set direction?_

### Set shutter speed to manual
	Value: 90010503020100009c

_Note how this appears to be like bulb value of one second, ie, it holds the shutter trigger output closed for 1 second, or x seconds for 'bulb' mode._

### Set Bulb Value

```
Value: 9001050302 followed by seconds in hex, minutes in hex. can do 1 hour but not a second more. handy. *rolls eyes*
```

Examples: set bulb value from 2 to 10. Always followed by Value: 788000f8
```
Value: 90010503020200009d
Value: 90010503020300009e
Value: 90010503020400009f
Value: 9001050302050000a0
Value: 9001050302060000a1
Value: 9001050302070000a2
Value: 9001050302080000a3
Value: 9001050302090000a4
Value: 90010503020a0000a5
THEN
Value: 788000f8
```
Example of bulb value of 4 minutes, 10 seconds:
```
Value: 90010503020a0400a9
Value: 788000f8
```

### Set Distance

```
Value: 9001050301 followed by distance in cm in hex, followed by 0000 and "checksum"
	eg: 67cm (0x43 in hex)
	Value: 9001050301430000dd
	eg: 66cm (0x42 in hex)
	Value: 9001050301420000dc
```
_todo: large distance format_

### Set Number of shots

```
Value: 9001050304 followed by number of shots in hex, followed by 0000 and "checksum"
eg: 8 
Value: 9001050304080000a5
eg: 9
Value: 9001050304090000a6
eg: 2
Value: 90010503040200009f
```

_todo: large shots value format_

### Set fixed point shoot

On

	Value: 9001050306ff00009e

Off

	Value: 90010503060000009f

### Set Frame by frame duration
```
Value: 9001050303 followed by number of seconds, minutes and hours followed by "checksum"
eg: 4 seconds (The UI reverted to minimum of 1:00.)
Value: 9001050303040000a0
Value: 788000f8
eg: 1 minute 5 seconds
Value: 9001050303050100a2
Value: 788000f8
```

## Checksum

The checksum is a `CheckSum8 Modulo 256`. You can [calculate a checksum here](https://www.scadacore.com/tools/programming-calculators/online-checksum-calculator/) by entering in the bytes before the checksum, clicking `AnalyzeDataHex` and looking under the `CheckSum8 Modulo 256` heading.

However, the checksum appears to be ignored, and any 00 bytes and the checksum can be dropped and the device appears to work fine.

## Other

On startup, this sequence is common but it's purpose is unexplored.

```
Value: 90040501000000009a
Value: 788000f8
```

# Receiving Data

## Speed

When a new speed is selected on the device, or the device is set into motion, the receiving characteristic receives a status update with the following breakdown:

`09010401 {speed} FFFF {motion}`

`speed` has one of the following values: 

```
01
02
03
04
05
```

`motion` has one of the following values: 

```
FF: if the device is in motion
00: if the device is not in motion
```

## Heartbeat

There seems to be a heartbeat, sent every 5 seconds. It may describe the battery level.

When nearly fully charged, the heartbeat was 
```
Value: 090402005a69
```

Later, as the battery dropped, the following values were observed over time:
```
Value: 090402005665
Value: 090402005261
Value: 090402005160
```

When nearly depleted, the value observed was:

```
Value: 090402000f1e
```

Since 100 is 64 in hex, it could be that the fifth byte describes the battery level as a value from 100 to 0. The last two digits are the checksum again.

# Summary

With this information, it is possible to build an app to control the Neewer DL200 in a more efficient manner than the Neewer app allows. For instance, to set up a series of events, including delays, and execute them in a sequence automatically.

# Application

I intend to use this for the purpose of videography during vlogging so the subject (me!) can be filmed with a slow pan while keeping them in shot by using an arc or a gimbal.

This should have the effect of keeping the subject still with a slightly moving background for visual interest, a common technique in the interview style videography.

# Future Work

I plan on developing a web-based sequencer for controlling the Neewer DL200 and may see if it would be possible to include controlling both the DL200 and the DJI OM4 from within the same application on iOS.
