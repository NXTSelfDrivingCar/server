const timeout = 20000; // 20 seconds

var currTimeout = 0;
var timeoutIterval = "";

function findUser() {
  var username = document.getElementById("username").value;

  if (username === "") {
    requiredUsername();
    return;
  }

  var url = "/api/user/" + username;

  console.log(url);

  $.ajax({
    url: url,
    type: "GET",
    success: function (data) {
      handleData(data);
    },
    error: function (data) {
      console.log(data);
    },
  });
}

function createLink() {
  var url = "/api/user/password/reset/";

  $.ajax({
    url: url,
    type: "POST",
    data: {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
    },
    success: function (data) {
      console.log("success");
    },
    error: function (data) {
      console.log(data);
    },
  });
  lockButton();
}

function handleData(data) {
  if (data.error) {
    printErrror(data.error);
    return;
  }

  hideError();
  writeData(data);
  showButton(data.email);
}

function printErrror(error) {
  var usernameInput = document.getElementById("username");
  usernameInput.style.border = "1px solid red";
  usernameInput.value = "";
  usernameInput.placeholder = error;
}

function hideError() {
  var usernameInput = document.getElementById("username");
  usernameInput.style.border = "1px solid #ced4da";
  usernameInput.placeholder = "Username";
}

function requiredUsername() {
  var username = document.getElementById("username");

  username.style.border = "1px solid red";
  username.placeholder = "Required";
}

function writeData(data) {
  var emailInput = document.getElementById("email");
  emailInput.value = data.email;
}

function showButton(email) {
  var button = document.getElementById("sendLink");
  var partialEmail =
    email.substring(0, 3) + "****" + email.substring(email.indexOf("@") - 1);

  button.hidden = false;
  button.style.display = "block";

  button.innerHTML = "Send reset code to " + partialEmail;
}

function writeToButton() {
  if (currTimeout < timeout) {
    console.log("writing to button");
    var button = document.getElementById("sendLink");
    button.innerHTML =
      "Send again in " + (timeout - currTimeout) / 1000 + " seconds";
  } else {
    unlockButton();
    clearInterval(timeoutInterval);
  }

  currTimeout += 1000;
}

function lockButton() {
  currTimeout = 0;
  var button = document.getElementById("sendLink");
  button.disabled = true;

  timeoutInterval = setInterval(writeToButton, 1000);
}

function unlockButton() {
  var button = document.getElementById("sendLink");
  button.disabled = false;
  showButton(document.getElementById("email").value);
}
