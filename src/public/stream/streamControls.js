const btnUp = document.getElementById("up");
const btnDown = document.getElementById("down");
const btnLeft = document.getElementById("left");
const btnRight = document.getElementById("right");
const btnPause = document.getElementById("pause");

btnDown.addEventListener("click", function () {
    sendWsControl(btnDown.id, true);
});

btnUp.addEventListener("click", function () {
    sendWsControl(btnUp.id, true);
});

btnLeft.addEventListener("click", function () {
    sendWsControl(btnLeft.id, true);
});

btnRight.addEventListener("click", function () {
    sendWsControl(btnRight.id, true);
});

btnPause.addEventListener("click", function () {
    pause();
});

document.addEventListener("keydown", function (event) {
    element = keyHandler(event, true);

    if (element != null) {
        chageColor(element, true);
    }
});

document.addEventListener("keyup", function (event) {
    element = keyHandler(event, false);

    if (element != null) {
        chageColor(element, false);
    }
});

function keyHandler(event, isDown) {
    switch (event.key) {
        case "ArrowUp":
            sendWsControl(btnUp.id, isDown);
            return btnUp;
        case "ArrowDown":
            sendWsControl(btnDown.id, isDown);
            return btnDown;
        case "ArrowLeft":
            sendWsControl(btnLeft.id, isDown);
            return btnLeft;
        case "ArrowRight":
            sendWsControl(btnRight.id, isDown);
            return btnRight;
        case " ":
            pause();
            return btnPause;
        default:
            console.log("Key not handled: " + event.key);
            break;
    }

    if (elementName != "") {
        return document.getElementById(elementName);
    }
}

function chageColor(element, isDown) {
    element.style.backgroundColor = isDown ? "#d1d1d1" : "#e9ecef";
}

function sendWsControl(elementName, isDown){
    if(socket && isDown){
        console.log("Sending: " + elementName);
        socket.emit("NXTControl", elementName)
    }
}

var pauseReady = 1
var paused = true
function pause(){
    
    if(socket){
        if (pauseReady == 1){
            if (paused){
                socket.disconnect()
                paused = false
                pauseReady = 0
                btnPause.innerHTML = "<i class='bi bi-play-fill'></i>"
                img.src = "https://i.imgur.com/IfCXico.jpg"
            }else{
                connect()
                paused = true
                pauseReady = 0
                btnPause.innerHTML = "<i class='bi bi-pause-fill'></i>";
            }

            // Limit pause to 1 per 150ms
            setTimeout(function(){
                pauseReady = 1
            }, 150)
        }
    }
}

