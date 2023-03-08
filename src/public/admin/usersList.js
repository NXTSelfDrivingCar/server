$(document).ready(function () {
  filterUsers();
});

function filterUsers() {
  console.log("Filtering users...");

  var email = $("#email").val();
  var username = $("#username").val();
  var role = $("#role").val();

  $.ajax({
    url: "/api/admin/users",
    type: "GET",
    data: { email: email, username: username, role: role },
    success: function (data) {
      setPlaceholder();
      updateFront(data);
    },
    error: function (error) {
      failFront(error);
    },
  });
}

function updateFront(data) {
  console.log("Updating front...");

  var list = document.getElementById("usersList");
  var users = "";

  if (data.length === 0) {
    failFront("No users found!");
    return;
  }

  for (var user of data) {
    users += getUserDiv(user);
  }

  list.innerHTML = getListHeader();
  list.innerHTML += users;
}

function failFront(error) {
  var list = document.getElementById("usersList");
  list.innerHTML = getListHeader();

  html = getFailDiv();

  list.innerHTML += html;
}

function getFailDiv() {
  return `<div class="container mt-3">
    <div class="alert alert-danger" role="alert">
      ✗ Users with these filters not found!
    </div>
  </div>`;
}

function setPlaceholder() {
  var list = document.getElementById("usersList");
  list.innerHTML = `<div class="list-group-item plh" style="border-radius: 0;">
      <h3 class="placeholder-glow placeholder-lg">
        <span class="placeholder col-12"></span>
      </h3>
    </div>`;
}

function getListHeader() {
  return `<div class="list-group-item" style="border-radius: 0;">
      <div class="container">
        <div class="row text-center">
          <div class="col-4">
            Unique ID
          </div>
          <div class="col-2">
            Username
          </div>
          <div class="col-2">
            E-Mail
          </div>
          <div class="col-2">
            Role
          </div>
          <div class="col">
            Actions
          </div>
        </div>
      </div>
    </div>`;
}

function getActionButtons(user) {
  if (adminUser !== user.id) {
    return `<a class="btn btn-primary act" href="/admin/user/update/${user.id}"><i class="bi bi-pencil-square"></i></a>
            <a class="btn btn-danger act" href="/admin/user/delete/${user.id}" onclick="return confirm('Are you sure you want to delete user ${user.username}?')" )><i class=" bi bi-trash"></i></a>`;
  }
  return "";
}

function getUserDiv(user) {
  return `
    <div class="list-group-item" style="border-radius: 0;">
            <div class="container">
                <div class="row">
                <div class="col-4 d-flex justify-content-center text-center mt-1">
                    ${user.id}
                </div>
                <div class="col-2 d-flex justify-content-center mt-1">
                    ${user.username}
                </div>
                <div class="col-2 d-flex justify-content-center mt-1">
                    ${user.email}
                </div>
                <div class="col-2 text-center mt-1">
                    <div class="p-1 text-center ${
                      user.role === "admin" ? "ac" : "uc"
                    }">
                    ${user.role}
                    </div>
                </div>
                <div class="col text-center "> 
                    ${getActionButtons(user)}
                </div>
                </div>
            </div>
            </div>`;
}

