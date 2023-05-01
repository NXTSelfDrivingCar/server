$(document).ready(function () {
    verifyEmailService();
});

function verifyEmailService(){
    updateEmailTitle('Email service -> Verifying...')

    lockInputFields(true);

    $.ajax({
        url: 'http://localhost:5000/api/admin/emailservice/verify',
        type: 'GET',
        dataType: 'json',
        jsonCallback: 'callback',
        success: function (result) {
            processResult(result)
        },
        error: function (err) {
            processResult(err)
        }
    });

    lockInputFields(false);
}

function _updateEmailService(){

    updateEmailTitle('Email service -> Updating...')

    lockInputFields(true);

    var url = 'http://localhost:5000/api/admin/emailservice/update'

    var data = {
        'emailUsername': document.getElementById('email-username').value,
        'emailPassword': document.getElementById('email-password').value,
        'password': document.getElementById('verifyModal-password').value,
    }

    if (data.emailUsername == '' || data.emailPassword == '' || data.password == '') {
        alert('Please fill in all fields!');
        return;
    }

    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        success: function (result) {
            verifyEmailService();
        },
        error: function (err) {
            processResult(err)
        }
    });

    $('#verifyModal').modal('hide');

    lockInputFields(false);
}

function updateEmailService(){

    lockInputFields(true);

    var data = {
        'emailUsername': document.getElementById('email-username').value,
        'emailPassword': document.getElementById('email-password').value,
    }

    if (data.emailUsername == '' || data.emailPassword == '') {
        lockInputFields(false);
        alert('Please fill in all fields!');
        return;
    }

    var modalHeader = `<div class='modal-header'>
                            <h6 class='modal-title' id='verifyModal-title'>Update email service?</h6>
                        </div>
        `
    
    var form = `
                <div class='modal-body'>
                    <p>Please enter your password to confirm.</p>
                        <input type='password'  class='form-control' name='password' id='verifyModal-password' placeholder='Password'>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Cancel</button>
                    <button type='button' onClick='_updateEmailService()' class='btn btn-danger' id='verifyModal-submitButton'>Submit</button>
                </div>
            `

    $('#verifyModal-content').html(modalHeader + form);
    $('#verifyModal').modal('show');

    lockInputFields(false);
}

function lockInputFields(lock){
    $('#email-username').prop('disabled', lock);
    $('#email-password').prop('disabled', lock);
    $('#email-submit').prop('disabled', lock);
}

function updateEmailTitle(message){
    $("#email-card-title").text(message);
}

function clearEmailServiceFields(){
    document.getElementById('email-username').value = '';
    document.getElementById('email-password').value = '';
}

function processResult(result){
    var emailCard = document.getElementById('email-card');
    resultStatus = result.status;

    if(resultStatus == 200){
        emailCard.classList.remove('service-card-off');
        emailCard.classList.add('service-card-on');
        updateEmailTitle('Email service')
        clearEmailServiceFields();
        lockInputFields(false);
        collapse('email','hide', false)
    }
    else if(resultStatus == 401){
        lockInputFields(false);
        updateEmailTitle('Email service -> Not updated')
        $('#adminAuthAlertModal').modal('show');
    }
    else if(resultStatus == 500){
        updateEmailTitle('Email service -> Offline')
        emailCard.classList.remove('service-card-on');
        emailCard.classList.add('service-card-off');
    }
}