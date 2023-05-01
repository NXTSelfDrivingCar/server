$(document).ready(function () {
    getPythonServiceConfig();
    verifyPythonService();
});

function verifyPythonService(){
    updatePythonCardTitle('Python service -> Verifying...')

    $.ajax({
        url: 'http://localhost:5000/api/admin/pythonservice/verify',
        type: 'GET',
        dataType: 'json',
        jsonCallback: 'callback',
        success: function (result) {
            processPythonResult(result)
        },
        error: function (err) {
            processPythonResult(err)
        }
    });

    lockInputFields(false);
}

function getPythonServiceConfig(){
    updatePythonCardTitle('Python service -> Getting config...')

    $.ajax({
        url: 'http://localhost:5000/api/admin/pythonservice/config',
        type: 'GET',
        dataType: 'json',
        jsonCallback: 'callback',
        success: function (result) {
            fillPythonInputs(result)
        },
        error: function (err) {
            processPythonResult(err)
        }
    });
}

function updatePythonService(){
    var host = document.getElementById('python-host').value;
    var port = document.getElementById('python-port').value;

    if (host == '' || port == '') {
        alert('Please fill in all fields!');
        return;
    }
    updatePythonCardTitle('Python service -> Updating...')

    var url = 'http://localhost:5000/api/admin/pythonservice/update'

    var data = {
        'host': host,
        'port': port
    }

    console.log(data)

    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        success: function (result) {
            verifyPythonService();
        },
        error: function (err) {
            processPythonResult(err)
        }
    });
}

function fillPythonInputs(result){
    document.getElementById('python-host').value = result.host;
    document.getElementById('python-port').value = result.port;
}

function updatePythonCardTitle(title){
    document.getElementById('python-card-title').innerHTML = title;
}

function processPythonResult(result){
    var pythonCard = document.getElementById('python-card');
    resultStatus = result.status;

    if(resultStatus == 200){
        updatePythonCardTitle('Python service')
        pythonCard.classList.remove('service-card-off');
        pythonCard.classList.add('service-card-on');
        collapse('python','hide', false)
    }
    else if(resultStatus == 401){
        $('#adminAuthAlertModal').modal('show');
    }
    else if(resultStatus == 500){
        updatePythonCardTitle('Python service -> Unavailable')
        pythonCard.classList.remove('service-card-on');
        pythonCard.classList.add('service-card-off');
    }
}
