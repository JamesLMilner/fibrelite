
// Keep track of rICs for clearing off
const rICs = [];
let fibreliteSetting = "execute";
let msDelay = 16 * 10;
const delayInput = document.getElementById("delay");
delayInput.value = msDelay;
delayInput.addEventListener("change", (event) => {
	msDelay = parseInt(event.target.value);
})

// Returns the byte length of an utf8 inputing
// and includes a synthetic wait
const dataProcessingAsync = async (input, delay) => {

	const s = input.length;
	for (let i=input.length-1; i>=0; i--) {
		const code = input.charCodeAt(i);
		if (code > 0x7f && code <= 0x7ff) s++;
		else if (code > 0x7ff && code <= 0xffff) s+=2;
		if (code >= 0xDC00 && code <= 0xDFFF) i--;
	}

	const start = Date.now();
	let now = start;
	while (now - start < delay) {
		now = Date.now();
	}

	return s;
};


const syncExample = () => {
	const syncInput = document.getElementById("syncUserInput");
	const syncMessage = document.getElementById("syncUserMessage");
	let syncLatest;
	let syncBytes = 0;

	syncInput.addEventListener("keyup", async (event) => {

		const timestamp = new Date();
		syncLatest = timestamp;

		syncBytes = await dataProcessingAsync(event.target.value, msDelay);

		requestAnimationFrame(() => {
			if (timestamp.getTime() === syncLatest.getTime()) {
				syncMessage.innerHTML = syncBytes + " bytes in user input"
			}
		});

	});
}

syncExample();

const rICExample = () => {

	const rICInput = document.getElementById("rICUserInput");
	const rICMessage = document.getElementById("rICUserMessage");
	let rICLatest;
	let rICBytes = 0;

	rICInput.addEventListener("keyup", async (event) => {

		const timestamp = new Date();
		rICLatest = timestamp;

		rICs.push(requestIdleCallback(async () => {
			rICBytes = await dataProcessingAsync(event.target.value, msDelay);
		}));

		requestAnimationFrame(() => {

			rICMessage.innerHTML = rICBytes + " bytes in user input"

		});

	});
}

rICExample();

const fibreliteExample = () => {

	const worker = new fibrelite(dataProcessingAsync, 4, 500);
	const input = document.getElementById("userInput");
	const message = document.getElementById("userMessage");
	let bytes = 0;

	input.addEventListener("keyup", async (event) => {
		const getStringBytes = worker[fibreliteSetting];
		const timestamp = new Date();
		latest = timestamp;
		bytes = await getStringBytes(event.target.value, msDelay);

		requestAnimationFrame(() => {
			message.innerHTML = bytes + " bytes in user input"
		});

	});

}

fibreliteExample();

const setupStats = () => {
	const fps = document.createElement("div");
	fps.style.position = "fixed";
	fps.style.top = "0";
	fps.style.left = "0";
	fps.style.width = 280;
	fps.style.height = 48 * 2;
	fps.style.fontSize = "72px";
	fps.style.fontWeight = "bold";
	fps.style.paddingLeft = "10px";
	fps.style.borderBottomRightRadius = "30px";

	document.body.appendChild(fps);

	// The higher this value, the less the fps will reflect temporary variations
	// A value of 1 will only keep the last value
	const filterStrength = 20;
	let frameNumber = 0;
	let frameTime = 0
	let lastLoop = performance.now()
	let thisLoop;

	function fpsLoop() {

		thisLoop = performance.now()
		var thisFrameTime = thisLoop - lastLoop;
		frameTime += (thisFrameTime - frameTime) / filterStrength;
		lastLoop = thisLoop;
		const fpsVal = 1000/frameTime;

		switch(true){
			case fpsVal < 20:
				fps.style.background = "#ff6961";
				break;
			case fpsVal < 30:
				fps.style.background = "#fdfd96";
				break;
			default:
				fps.style.background = "#77dd77";
		}
		if (frameNumber % 2 === 0) {
			const cappedFps = (fpsVal > 60 ? 60 : fpsVal ).toFixed(0);
			fps.innerHTML = cappedFps + " FPS";
		}
		frameNumber++;
		requestAnimationFrame(fpsLoop);
	}
	fpsLoop();

};

setupStats();

document.getElementById("options").addEventListener("change", (event) => {
	fibreliteSetting = event.target.value;
});


document.getElementById("cancel").addEventListener("click", () => {
	for (let i = 0; i < rICs.length; i++) {
		const id = rICs.pop();
		window.cancelIdleCallback(id);
	}
});
