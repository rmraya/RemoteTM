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

export class LoginForm {

    constructor() {
        document.getElementById('header').innerHTML = '';
        document.getElementById('header').classList.add('hidden');

        document.getElementById('body').className = 'bg';

        document.getElementById('mainContent').innerHTML =
            '<div class="card" style="margin: auto; margin-top: 250px; width: 400px">' +
            '<table class="fill_width">' +
            '<tr>' +
            '<td style="vertical-align: middle;"><label class="noWrap" for="userName">User Name</label></td>' +
            '<td style="vertical-align: middle;" class="fill_width"><input class="fill_width" type="text" id="userName"></td>' +
            '</tr>' +
            '<tr>' +
            '<td style="vertical-align: middle;"><label class="noWrap" for="passwd">Password</label></td>' +
            '<td style="vertical-align: middle;" class="fill_width"><input class="fill_width"  type="password" id="passwd"></td>' +
            '</tr>' +
            '</table>' +
            '<div class="buttonArea">' +
            '<button id="signIn" >Sign In</button>' +
            '<button id="resetPassword" >Reset Password</button>' +
            '</div>' +
            '</div>';
        document.getElementById('signIn').addEventListener('click', () => {
            this.signIn()
        });
        document.getElementById('resetPassword').addEventListener('click', () => {
            RemoteTM.resetPassword();
        });
    }

    signIn() {
        var userName = (document.getElementById('userName') as HTMLInputElement).value;
        var passwd = (document.getElementById('passwd') as HTMLInputElement).value;
        if (userName === '' && passwd === '') {
            return;
        }
        if (userName === '') {
            RemoteTM.alert('Enter user name');
            return;
        }
        if (passwd === '') {
            RemoteTM.alert('Enter password');
            return;
        }
        var auth = btoa(userName + ':' + passwd);
        RemoteTM.requestTicket(userName, auth);
    }
}