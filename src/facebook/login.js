'use strict';
/*jshint node: true */
/* jshint browser: true */
/* jshint phantom: true */
var fs = require('fs');
var page = require('webpage').create();
var url = 'http://www.facebook.com';
var system = require('system');
var args = require('system').args;

var email = args[1];
var password = args[2];

page.onConsoleMessage = function(msg) {
    system.stderr.writeLine('console: ' + msg);
};
// This code login's to your facebook account.
page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
    console.log(page.reason);
    console.log(page.reason_url);
};
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)'+
                            'Chrome/28.0.1500.71 Safari/537.36';
page.open(url, function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit();
    } else {
        //login into facebook supply your password
        var state = page.evaluate(function() {
            var logged_in = false;
            var frm = document.getElementById('login_form');
            if (frm !== null) {
                frm.elements.email.value = email;
                frm.elements.pass.value = password;
                var login_btn = document.getElementById('u_0_x');
                if (login_btn !== null) {
                    console.log('clicking login');
                    login_btn.click();
                }
                logged_in = true;
            } else {
                console.log('No login form ');
            }
            return logged_in;
        });
        if (!state) {
            console.log('Login error ');
            phantom.exit();
        }
        //get facebook cookie
        setTimeout(function() {
            page.render('login.png');
            var logged = page.evaluate(function() {
                console.log('Page Title ' + document.title);
                //return document.querySelector('.fbxWelcomeBoxName');
                return true;
            });
            if (logged !== null) {
                var cookies = JSON.stringify(phantom.cookies);
                fs.write('src/facebook/.facebook', cookies, 644);
            } else {
                console.log('No cookies ');
            }
            phantom.exit();
        }, 10000);
    }
});
