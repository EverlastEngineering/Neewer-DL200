let btn_bluetooth
let dolly 

function svgpos(domElemnt) {
	let a = domElemnt.getCTM()
	return {
		x: a.e,
		y: a.f
	}
}
async function init() {
	
	dolly = document.getElementById('dolly');
	dolly.style.willChange = 'contents,transform';
	dolly.style.willChange = 'transform';
	btn_bluetooth = document.getElementById('btn_bluetooth');
	btn_bluetooth.addEventListener('click', connect);
	poly_background = document.getElementById('poly_background');
	// poly_background.addEventListener("animationstart", () => {
	// 	console.log(`${animationEventLog.textContent}'animation started' `)
	// });
	// let coors = dolly.getBoundingClientRect();
	// let a = - coors.width - coors.left - dolly.getCTM().e;

	// let b = svgpos(dolly);
	
	// moveSection("dolly", -a, 0);


	// dolly.animate(
	// 	[
	// 	  // keyframes
		  
	// 	  { transform: `translate(${b.x-coors.width}px,${b.y}px)` },
	// 	  { transform: `translate(${b.x}px,${b.y}px)` },
    
	// 	],
	// 	{
	// 	  // timing options
	// 	  easing: 'ease-out',
	// 	  duration: 2000,
	// 	  iterations: 1,
	// 	},
	//   );

	  setInterval(animator,50);
}

let poly_background
let speed = 2;
let currentSpeed = 0;
let inMotion = true
let easing = true;
let bg_x = 0;

function animator(){
	if (!inMotion) return;
	if(currentSpeed < speed){
		currentSpeed += 0.05;
	}
	else if(currentSpeed > speed){
		currentSpeed -= 0.05;
	}
	bg_x += currentSpeed;
	if (bg_x > 50) {
		bg_x -= 50;
	}
	else if (bg_x < 0) {		
		bg_x += 50;
	}
	// console.log(bg_x)
	moveSection("poly_background", bg_x, 300)		
}

function moveSection(idStr, xOffset, yOffset) {
	var domElemnt = document.getElementById(idStr);
		if (domElemnt) {
			let coors = domElemnt.getBoundingClientRect();
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


setTimeout(init, 200);
// document.addEventListener('DOMContentLoaded', ())