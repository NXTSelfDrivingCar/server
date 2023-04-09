$(document).ready(function () {
    filterLogs();
});

function filterLogs() {
    console.log("Filtering log results...");

    var level = $("#level").val();
    var origin = $("#origin").val();
    var action = $("#action").val();

    $.ajax({
        url: "/api/admin/logs/l/" + thisLogName,
        type: "GET",
        data: { level: level, origin: origin, action: action },
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

    var list = document.getElementById("logsList");
    var logs = "";

    if (data.length === 0) {
        failFront("No logs found!");
        return;
    }

    var counter = 0
    for (var log of data) {
        logs += getLogDiv(log, counter++);
    }

    list.innerHTML = getListHeader();
    list.innerHTML += logs;
}

function failFront(error) {
    var list = document.getElementById("logsList");
    list.innerHTML = getListHeader();

    html = getFailDiv();

    list.innerHTML += html;
}

function getFailDiv() {
    return `<div class="container mt-3">
        <div class="alert alert-danger" role="alert">
        ✗ Logs with these filters not found!
        </div>
    </div>`;
}

function setPlaceholder() {
    var list = document.getElementById("logsList");
    list.innerHTML = `<div class="list-group-item plh" style="border-radius: 0;">
        <h3 class="placeholder-glow placeholder-lg">
            <span class="placeholder col-12"></span>
        </h3>
        </div>`;
}

function getListHeader() {
return `<div class="btn list-group-item list-group-item-action" style="border-radius: 0;">
<div class="container">
  <div class="row text-center">
    <div class="col">
      Level
    </div>
    <div class="col">
      Origin
    </div>
    <div class="col">
      Action
    </div>
    <div class="col">
      Timestamp
    </div>
  </div>
</div>
</div>`;
}

function getLogDiv(log, counter) {
return `
    <button class="btn list-group-item list-group-item-action" data-bs-toggle="collapse" data-bs-target="#collapseExample${counter}" style="border-radius: 0;">
        <div class="container">
        <div class="row">
            <div class="col d-flex justify-content-center mt-1">
            <div class="p-1 text-center ${(log.level==='INFO') ? 'info' : (log.level==='WARNING') ? 'warning' : 'error'}">
                ${log.level}
            </div>
            </div>
            <div class="col d-flex justify-content-center mt-1">
                ${(log.origin) ? log.origin : ''}
            </div>
            <div class="col d-flex justify-content-center mt-1">
                ${(log.action) ? log.action : ''}
            </div>
            <div class="col d-flex justify-content-center mt-1">
                ${new Date(log.timestamp).toLocaleDateString('en-UK')} - ${new Date(log.timestamp).toLocaleTimeString('en-UK')}
            </div>
        </div>
        </div>
        </button>

        <div class="collapse" id="collapseExample${counter}">
        <div class="card card-body card-content" style="border-radius: 0;">
        <pre class="card-text">${jsonToString(log)}</pre>
        </div>
    </div>`;
}

