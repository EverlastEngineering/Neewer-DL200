let dolly 
let poly_background
let speed = 1
let currentSpeed = 0.051
let speedfactor = 0.05;
let inMotion = false
let motionDirection = ''
let easing = true
let bg_x = 0
let buttons = []
let speed_indicator
let lower_display_board
let upper_display_board
let accelerationStates = ['Slow', 'Constant']
let accelerationState
let motionStates = ['Stopped', 'At Speed', 'Easing']
let motionState


function svgpos(domElemnt) {
	let a = domElemnt.getCTM()
	return {
		x: a.e,
		y: a.f
	}
}

function hoverOn(el){
	el.currentTarget.state = 'hover';
	setButtonBlendMode(el)
}

function hoverOff(el){
	el.currentTarget.state = 'enabled';
	setButtonBlendMode(el)
}
function uiclick(el){
	el.currentTarget.state = 'clicked';
	setButtonBlendMode(el)
}
function disable(el){
	el.currentTarget.state = 'disabled';
	setButtonBlendMode(el)
}
function enable(el){
	el.currentTarget.state = 'enabled';
	setButtonBlendMode(el)
}

function setButtonBlendMode(el) {
	let target = el.currentTarget
	let blendmode
	if (target.state == 'disabled') blendmode = 'overlay';
	if (target.state == 'enabled') blendmode = 'hard-light';
	if (target.state == 'clicked') blendmode = 'multiply';
	if (target.state == 'hover') blendmode = 'normal';
	target.childNodes[1].style.mixBlendMode = blendmode
}

function lower_screen_setup() {
	lower_display_board.childNodes[0].innerHTML
}
async function init() {
	
	dolly = document.getElementById('dolly');
	dolly.style.willChange = 'contents,transform';
	dolly.style.willChange = 'transform';
	buttons.push(document.getElementById('button1'));
	buttons.push(document.getElementById('button2'));
	buttons.push(document.getElementById('button3'));
	buttons.push(document.getElementById('button4'));
	buttons.push(document.getElementById('button5'));
	speed_indicator = document.getElementById('speed_indicator');
	lower_display_board = document.getElementById('lower_display_board');
	upper_display_board = document.getElementById('upper_display_board');
	for (let el of buttons){
		el.state = 'disabled';
		// el.addEventListener('click', connect);
		el.addEventListener('mouseover', hoverOn);
		el.addEventListener('mouseout', hoverOff);
		el.addEventListener('mousedown', uiclick);
		el.addEventListener('mouseup', hoverOn);
	}

	{ 
		let el = buttons[4]
		el.state = 'enabled';
		el.addEventListener('click', connect);
	}

	{ 
		let el = buttons[3]
		el.state = 'enabled';
		el.addEventListener('click', function(){
			buttonGoDirection('right')
		});
	}

	{ 
		let el = buttons[2]
		el.state = 'enabled';
		el.addEventListener('click', function(){
			buttonGoDirection('left')
			gototheleft()
		});
	}

	{ 
		let el = buttons[1]
		el.state = 'enabled';
		el.addEventListener('click', buttonSpeedLower);
	}

	{ 
		let el = buttons[0]
		el.state = 'enabled';
		el.addEventListener('click', buttonSpeedHigher);
	}

	setSpeedIndicator(speed)
	poly_background = document.getElementById('poly_background');
	updateStatus(motionStates[0])
	updateAcceleration(accelerationStates[0])


	setInterval(animator,50);
}

function updateStatus(state) {
	if (motionState != state) {
		motionState = state;
		upper_display_board.childNodes[0].innerHTML = `Status: ${motionState}`;
	}
}

function updateAcceleration(state) {
	if (accelerationState != state) {
		accelerationState = state;
		upper_display_board.childNodes[1].innerHTML = `Acceleration: ${accelerationState}`;
	}
}

function animator(){
	if (!inMotion && currentSpeed == 0) {
		updateStatus(motionStates[0]);
		return;
	}
	
	let direction_shifted_speed = speed;
	
	if (motionDirection == 'right') {
		direction_shifted_speed = -speed;
	}

	if (!inMotion) direction_shifted_speed = 0;

	if (accelerationState == accelerationStates[1]) {
		currentSpeed = direction_shifted_speed	
	}

	currentSpeed = currentSpeed * 100
	currentSpeed = Math.round(currentSpeed)
	currentSpeed = currentSpeed / 100


	updateStatus(motionStates[1] + ' ' + speed);
	
	if(currentSpeed < direction_shifted_speed){
		currentSpeed += speedfactor;
		updateStatus(motionStates[2]);
	}
	else if(currentSpeed > direction_shifted_speed){
		currentSpeed -= speedfactor;
		updateStatus(motionStates[2]);
	}
	bg_x += currentSpeed;
	if (bg_x > 50) {
		bg_x -= 50;
	}
	else if (bg_x < 0) {		
		bg_x += 50;
	}
	// console.log(bg_x)
	moveSection("poly_background", bg_x*1.7, 300)		
}

function moveSection(idStr, xOffset, yOffset) {
	var domElemnt = document.getElementById(idStr);
		if (domElemnt) {
			// let coors = domElemnt.getBoundingClientRect();
			// let a = coors.width + coors.left;
			// console.log(coors.x, coors.y, coors.width, coors.height);
			let pos = {
				x: dolly.getCTM().e,
				y: dolly.getCTM().f
			};
			// console.log(pos)
			var transformAttr = ' translate(' + (xOffset) + ',' + (yOffset+pos.y) + ')';
			domElemnt.setAttribute('transform', transformAttr);
		}
	}

function setSpeedIndicator(char) {
	speed_indicator.innerHTML = char;
}

function setSpeed(s) {
	s = Math.round(s);
	if (isNaN(s)) { 
		console.log('speed is not a number')
		return;
	}
	if (s < 1) s = 1;
	if (s > 5) s = 5;
	speed = s;
	setSpeedIndicator(s)
	setspeed(s)
}

let animatedMessage = '';
let animatedMessageInterval;
let animatedMessageCurrentChar = 0;

function setAnimatedMessage(msg) {
	animatedMessage = msg;
	animatedMessageCurrentChar = 0;
	startAnimatedMessage()
}
function startAnimatedMessage() {
	animatedMessageInterval = setInterval(animateMessage, 250);
}

function stopAnimatedMessage() {
	clearInterval(animatedMessageInterval);
}

function animateMessage() {
	let char = animatedMessage[animatedMessageCurrentChar];
	setSpeedIndicator(char)
	animatedMessageCurrentChar++;
	if (animatedMessageCurrentChar >= animatedMessage.length) {
		animatedMessageCurrentChar = 0;
	}
}

function buttonSpeedHigher() {
	setSpeed(speed + 1);
}

function buttonSpeedLower() {
	setSpeed(speed - 1);
}

function buttonGoDirection(direction) {
	if (inMotion && motionDirection == direction) {
		gotostop();
		inMotion = false;
		return;
	}
	inMotion = true;
	motionDirection = direction;
	if (direction == 'left') {
		gototheleft()
	}
	else {
		gototheright()
	}
}

function buttonGoRight() {
	if (inMotion && motionDirection == 'right') {
		inMotion = false;
		return;
	}
	inMotion = true;
	motionDirection = 'right';
}

setTimeout(init, 200);
// document.addEventListener('DOMContentLoaded', ())