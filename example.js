const dataProcessingAsync = async (input) => {

    // returns the byte length of an utf8 inputing
    const s = input.length;
    for (let i=input.length-1; i>=0; i--) {
        const code = input.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s+=2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
    }

    // Synthetic wait
    const ms = 333;
    const start = Date.now();
    let now = start;
    while (now - start < ms) {
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

        syncBytes = await dataProcessingAsync(event.target.value);
        
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
        
        requestIdleCallback(async () => {
            rICBytes = await dataProcessingAsync(event.target.value);
        })
        
        requestAnimationFrame(() => {
            
            rICMessage.innerHTML = rICBytes + " bytes in user input"

        });

    });
}

rICExample();

const fibreliteExample = () => {

    const fibril = new fibrelite(dataProcessingAsync, 4, 500);
    const getStringBytes = fibril.debounceExecute;
    
    // You can experiment with the other modes:
    // const getStringBytes = fibril.execute; 
    // const getStringBytes = fibril.prioritiseExecute;

    const input = document.getElementById("userInput");
    const message = document.getElementById("userMessage");
    let latest;
    let bytes = 0;

    input.addEventListener("keyup", async (event) => {
        const timestamp = new Date();
        latest = timestamp;
        bytes = await getStringBytes(event.target.value);
        
        requestAnimationFrame(() => {
            message.innerHTML = bytes + " bytes in user input"
        });

    });

}

fibreliteExample();

const setupStats = () => {

    const stats = new Stats();
    console.log(stats);
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.domElement.style.position = "fixed";
    stats.domElement.style.top = "0";
    stats.domElement.style.left = "0";
    stats.domElement.style.width = 80 * 2;
    stats.domElement.style.height = 48 * 2;
    for (var i = 0; i <  stats.domElement.children.length; i++) {
        stats.domElement.children[i].style.width = 80 * 2;
        stats.domElement.children[i].style.height = 48 * 2;
    }
    stats.domElement.children.fo
    document.body.appendChild( stats.domElement );

    const animate = () => {

        stats.begin();

        // monitored code goes here

        stats.end();

        requestAnimationFrame( animate );

    }

    requestAnimationFrame( animate );

};
 
setupStats();


document.getElementById("refresh").addEventListener("click", () => {
    location.reload();
});