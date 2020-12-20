/*******************************************************************************
Copyright (c) 2008-2020 - Maxprograms,  http://www.maxprograms.com/

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to compile, 
modify and use the Software in its executable form without restrictions.

Redistribution of this Software or parts of it in any form (source code or 
executable binaries) requires prior written permission from Maxprograms.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*******************************************************************************/
import { RemoteTM } from "./remotetm";
import { LoginForm } from "./loginForm";

export class ResetPassword {

    constructor() {
        document.getElementById('header').innerHTML = '';
        document.getElementById('header').classList.add('hidden');

        document.body.className = 'bg';

        document.getElementById('mainContent').innerHTML =
            '<div class="card" style="margin: auto; margin-top: 250px; width: 400px">' +
            '<table class="fill_width">' +
            '<tr>' +
            '<td style="vertical-align: middle;"><label class="noWrap" for="userName">User Name</label></td>' +
            '<td style="vertical-align: middle;" class="fill_width"><input class="fill_width" type="text" id="userName"></td>' +
            '</tr>' +
            '<tr>' +
            '<td style="vertical-align: middle;"><label class="noWrap" for="email">Email Address</label></td>' +
            '<td style="vertical-align: middle;" class="fill_width"><input class="fill_width"  type="text" id="email"></td>' +
            '</tr>' +
            '</table>' +
            '<div class="buttonArea">' +
            '<button id="reset">Reset Password</button>'
        '</div>' +
            '</div>';
        document.getElementById('reset').addEventListener('click', () => {
            this.resetPassword();
        });
    }

    resetPassword(): void {
        var userName = (document.getElementById('userName') as HTMLInputElement).value;
        var email = (document.getElementById('email') as HTMLInputElement).value;
        if (userName === '' && email === '') {
            return;
        }
        if (userName === '') {
            RemoteTM.alert('Enter user name');
            return;
        }
        if (email === '') {
            RemoteTM.alert('Enter email address');
            return;
        }
        var json: any = { username: userName, email: email };

        var req = new XMLHttpRequest();
        req.open('POST', RemoteTM.getMainURL() + '/login/sendReminder', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Accept', 'application/json');
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var json = JSON.parse(req.responseText);
                    if (json.status === 'OK') {
                        new LoginForm();
                        RemoteTM.alert('If entered data matches our records, an email with password change information will be sent.');
                    } else {
                        RemoteTM.alert(json.reason);
                    }
                } else if (req.status == 401) {
                    RemoteTM.alert('Access denied');
                } else {
                    RemoteTM.alert('Server status: ' + req.status
                        + '. Try again later.');
                }
            }
        };
        req.send(JSON.stringify(json));
    }
}