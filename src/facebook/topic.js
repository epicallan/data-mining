#! /usr/bin/env phantomjs

/*global $:false */

var fs = require('fs');
var page = require('webpage').create();
var url = 'https://www.facebook.com/search/top/?q=mtn%20uganda';
var system = require('system');
var args = require('system').args;

//get search query
args.splice(0,1);
var query = args.join('%20');
var url = 'https://www.facebook.com/search/top/?q='+query;
console.log(url);

//configure page settings
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) '
                          +'Chrome/28.0.1500.71 Safari/537.36';
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
    //console.log('resource error: ' + page.reason);
    fs.appendFile('.log',page.reason, function (err) {
        if (err) console.log(err);
    });
};

page.onError = function(msg, trace) {
    console.log('error message: ' + msg);
    trace.forEach(function(item) {
        fs.appendFile('.log', item.file + ' : ' + item.line, function(err) {
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
                console.log('Your page is ' + $('._5pbw a').first().text());
                $('body').click();
                return true;
            });
            if (validCookie) {
               processPage();
            } else {
                //TODO get new cookie and recall page data function
                console.log('No login cookie ');
                phantom.exit();
            }
        },5000);
    }
}


function processPage(){
    var iteration = 0;
    var interval = setInterval(function() {
        var scroll = page.evaluate(function(getEndDate,iteration,clickThroughPage) {
            iteration++;
            iteration % 40 === 0  && iteration > 500? clickThroughPage():
            window.document.body.scrollTop = document.body.scrollHeight;
            return iteration;
        },getEndDate,iteration,clickThroughPage);
        //post scroll page
        iteration = scroll;
    },1000);
    //settime out fall back in case we inputted a date for which our page data
    setTimeout(function(){
        clearInterval(interval);
        dataMinePage();
    },100000);
}

function getPostsData() {
    return page.evaluate(function() {
        var posts = [];
        $('.userContentWrapper').each(function() {
            //getting comments for this particular post
            var comments = [];
            $(this).find('.UFIList>div>.UFIComment').each(function() {
                //only one main comment
                var comment_obj = {
                    'commenter': $(this).find('.UFICommentActorName').text(),
                    'comment': $(this).find('.UFICommentBody').text(),
                    'url': $(this).find('.UFICommentActorName').attr('href'),
                    'date': $(this).find('.uiLinkSubtle abbr').attr('title')
                };
                //comment can have many replies
                if ($(this).next().hasClass('UFIReplyList')) {
                    //console.log('post has replies');
                    var replies = [];
                    $(this).next().find('.UFICommentContentBlock').each(function() {
                        var reply = {
                            'replier': $(this).find('.UFICommentActorName').text(),
                            'reply': $(this).find('.UFICommentBody').text(),
                            'url': $(this).find('.UFICommentActorName').attr('href'),
                            'date': $(this).find('.uiLinkSubtle abbr').attr('title')
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
                shares: $(this).find('.UFIShareLink').text().replace(/[^0-9.]/g, ''),
                likes: $(this).find('.UFILikeSentenceText a').text().replace(/[^0-9.]/g, ''),
                date: $(this).find('._1dwg abbr').attr('title'),
                post: $(this).find('._5pbx.userContent').text(),
                poster:$(this).find('h5._5pbw a').first().text(),
                url:$(this).find('h5._5pbw a').first().attr('href'),
                comments: comments
            };
            posts.push(obj);
        });
        return posts;
    });
}

function savePageContent(data) {
    var date = new Date().getTime();
    fs.write('data/fb/topic'+args[0] + date + '.json', JSON.stringify(data), 644);
    var length = '--------length: ' + data.length + '------';
    console.log(length);
    phantom.exit();
}

function dataMinePage() {
    //wait for content to appear after clicking through to get dynamic content
    setTimeout(function() {
        var data = getPostsData();
        savePageContent(data);
    },5000);
}

function getEndDate(input_dates, end_date_str) {
    //Monday, November 23, 2015 at 10:43am  var s = ('nov 23, 2015 at 10:44').replace(/at(.*)/,'')
    var is_end_date = false;
    if (input_dates.length > 0) {
        input_dates.forEach(function(input_date) {
            var arr = input_date.split(',');
            var fbk_date_str = arr[1] + arr[2].replace(/at(.*)/, '');
            var fbk_date = new Date(fbk_date_str);
            var end_date = new Date(end_date_str);
            if (fbk_date.getTime() < end_date.getTime()) {
                //console.log('matched true fbk_date : '+ fbk_date + ' end_date'+ end_date);
                is_end_date = true;
                return;
            }
        });
    }
    return is_end_date;
}


function clickThroughPage() {
     console.log('clicking through page');
    //click through see more links on posts
    var see_more = $('.see_more_link');
    if (see_more) {
        see_more.each(function() {
            var elem = $(this);
            var evObj = document.createEvent('MouseEvent');
            evObj.initEvent('click', true, false);
            //console.log(elem.text());
            elem[0].dispatchEvent(evObj);
            elem.remove();
        });
    }
    //expand comment sections
    var comments = $('._524d a');
    if (comments) {
        comments.each(function() {
            var elem = $(this);
            var evObj = document.createEvent('MouseEvent');
            evObj.initEvent('click', true, false);
            elem[0].dispatchEvent(evObj);
            elem.remove();
        });
    }
    //click through more stories
    var more_stories = $('.uiMorePagerPrimary');
    //should ignore first date on the post
    if (more_stories) more_stories.click();
}
