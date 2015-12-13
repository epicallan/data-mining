#! /usr/bin/env phantomjs
'use strict';

/* eslint browser: true */
/* eslint phantom: true */
/*global $:false */
var fs = require('fs');
var page = require('webpage').create();
var system = require('system');

//var url = 'https://www.facebook.com/MTNUG/';
/*var stringify = require('node-stringify');*/
var args = require('system').args;
var url = 'https://www.facebook.com/'+args[1];
console.log('address : '+ url)

//configure page settings
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36';
page.settings.loadImages = false;

//add cookie jar if it exists else login
var cookies = fs.read('src/facebook/.facebook');
JSON.parse(cookies).forEach(function(cookie) {
    phantom.addCookie(cookie);
});

page.onConsoleMessage = function(msg) {
    system.stderr.writeLine('console: ' + msg);
};

page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
    console.log("resource error: " + page.reason);
    fs.appendFile('.log', page.reason_url + " : " + page.reason, function(err) {
        if (err) console.log("error");
        console.log('error appeded to file');
    });
};

page.onError = function(msg, trace) {
    console.log("error message: " + msg);
    trace.forEach(function(item) {
        fs.appendFile('.log', item.file + " : " + item.line, function(err) {
            if (err) throw err;
            console.log('error message appeded');
        });
    });
};


page.open(url, function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit();
    } else {
        init();
    }
});

function init() {
    if (page.injectJs('lib/jquery-1.11.2.min.js')) {
        setTimeout(function() {
            var validCookie = page.evaluate(function() {
                console.log('Page Title ' + document.title);
                //console.log('Your name is ' + $('.fbxWelcomeBoxName').text());
                console.log('Your page is ' + $('._5pbw a').first().text());
                return true;
            });
            if (validCookie) {
                var waitforScrollTime = pageScroll();
                outPutPageContent(waitforScrollTime);
            } else {
                console.log("No login cookie, Please login fast with the login script");
                phantom.exit();
            }
        }, 1000);
    }
}

function clickEvent(elem) {
    var evObj = document.createEvent('MouseEvent');
    evObj.initEvent('click', true, false);
    elem.dispatchEvent(evObj);
}

function clickThroughReadmoreLinks(links) {
    //iterate through the page
    if (links) {
        links.each(function() {
            var elem = $(this);
            var evObj = document.createEvent('MouseEvent');
            evObj.initEvent('click', true, false);
            elem[0].dispatchEvent(evObj);
            //console.log("click text: " + elem.text());
        });
    } else {
        console.log("No more links");
    }
}

function gettingPostsComments() {
    return page.evaluate(function() {
        var posts = [];
        var reg = new RegExp('^[0-9]+$');
        $('.userContentWrapper').each(function(index, card) {
            //getting comments for this particular post
            var comments = [];
            $(this).find(".UFIList>div>.UFIComment").each(function(index, item) {
                //only one main comment
                var comment_obj = {
                    'commenter': $(this).find('.UFICommentActorName').text(),
                    'comment': $(this).find('.UFICommentBody').text(),
                    'url': $(this).find('.UFICommentActorName').attr('href')
                };
                //comment can have many replies
                if ($(this).next().hasClass('UFIReplyList')) {
                    //console.log("post has replies");
                    var replies = [];
                    $(this).next().find('.UFICommentContentBlock').each(function() {
                        var reply = {
                            'replier': $(this).find('.UFICommentActorName').text(),
                            'reply': $(this).find('.UFICommentBody').text(),
                            'url': $(this).find('.UFICommentActorName').attr('href')
                        };
                        //console.log('reply: ' + JSON.stringify(reply));
                        replies.push(reply);
                    });
                    comment_obj.reply = replies;
                }
                comments.push(comment_obj);
            });
            //post object with comment object
            var obj = {
                shares: $(this).find('.UFIShareLink').text().replace(/[^0-9.]/g, ""),
                likes: $(this).find('.UFILikeSentenceText a').text().replace(/[^0-9.]/g, ""),
                date: $(this).find('.timestampContent').text(),
                post: $(this).find("._5pbx.userContent").text(),
                comments: comments,
            };
            posts.push(obj);
        });
        return posts;
    });
}

function savePageContent(data) {
    var date = new Date().getTime();
    fs.write('data/fb/pages/'+args[1] + date + '.json', JSON.stringify(data), 644);
    var length = "--------length: " + data.length + "------";
    console.log(length);
    //page.render('more.png');
    phantom.exit();
}

function dataMinePage() {
    //wait for content to appear after clicking through to get dynamic content
    setTimeout(function() {
        var data = gettingPostsComments();
        savePageContent(data);
    }, 5000);
}

function outPutPageContent(refreshIntervalId) {
    // Checks for bottom div and scrolls down from time to time
    setTimeout(function() {
        clearInterval(refreshIntervalId);
        dataMinePage();
    }, 125000);
}

function pageScroll() {
    /**
     * TODO
     * should scroll till there is no more data
     */
    var refreshIntervalId = setInterval(function() {
        page.evaluate(function() {
            window.document.body.scrollTop = window.document.body.scrollHeight / 2 + 250;
            var more_stories = $('.uiMorePagerPrimary');
            if (more_stories) {
                more_stories.click();
            }
            console.log("scrolled to Bottom current height: " + window.document.body.scrollHeight);
            //clicking through readmore links
            var links = $(".UFIPagerLink");
            if (links) {
                links.each(function() {
                    var elem = $(this);
                    var evObj = document.createEvent('MouseEvent');
                    evObj.initEvent('click', true, false);
                    elem[0].dispatchEvent(evObj);
                    //console.log("click text: " + elem.text());
                });
            } else {
                console.log("No more links");
            }
        });
    }, 5000);
    return refreshIntervalId;
}
