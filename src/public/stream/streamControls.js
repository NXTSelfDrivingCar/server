document.addEventListener("keydown", function (event) {
    element = keyHandler(event, true);

    if (element != undefined) {
        chageColor(element, true);
    }
});

document.addEventListener("keyup", function (event) {
    element = keyHandler(event, false);

    if (element != undefined) {
        chageColor(element, false);
    }
});

function keyHandler(event, isDown) {
    var elementName = "";

    switch (event.key) {
        case "ArrowUp":
            elementName = "up";
            sendWsControl(elementName, isDown);
            break;
        case "ArrowDown":
            elementName = "down";
            sendWsControl(elementName, isDown);
            break;
        case "ArrowLeft":
            elementName = "left";
            sendWsControl(elementName, isDown);
            break;
        case "ArrowRight":
            elementName = "right";
            sendWsControl(elementName, isDown);
            break;
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

function pause(){}