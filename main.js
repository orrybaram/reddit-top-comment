
var RedditTopComment = (function() {
    var $popover;
    var cache = {};

    return {
        init: init
    };
    
    function init() {
        insertPopover();
        getCommentLinks();
    }

    // Template
    // ================================================
    function commentTemplate(comment) {
        console.log(comment);
        return (
            '<div class="rtc--top-comment">' +
                '<div class="rtc--top-comment-header">' +
                    '<span class="rtc--top-comment-header--author"><a href="/user/' + comment.author + '">' + comment.author + '</a></span> ' + 
                    '<strong class="rtc--top-comment-header--score">' + comment.score + '</strong> ' + 
                    '<span class="rtc--top-comment-header--created">' + new Date(comment.created).toLocaleString() + '</span>' +
                '</div>' +
                '<div class="rtc--comment-body">' +
                    htmlDecode(comment.body_html) +
                '</div>' +
            '</div>'
        );
    }

    // Methods
    // ================================================
    function insertPopover() {
        $popover = document.createElement('div');
        $popover.className = "rtc-popover";
        document.body.appendChild($popover);
    }

    function getCommentLinks() {
        var entries = document.getElementsByClassName('entry');
        for(var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var entryLinks = entry.getElementsByClassName('flat-list')[0] || null;
            if(!entryLinks) continue;
            var commentLink = entryLinks.getElementsByClassName('comments')[0] || null;
            if(!commentLink) continue;
            handleCommentLink(commentLink);
        }
    }

    function handleCommentLink(link) {
        hoverIntent(link, {
            onHover: function() {
                displayTopComments(link);
            },
            offHover: hideTopComments,
            onDelay: 1000,
            hoverTarget: $popover
        });
    }

    function displayTopComments(link) {
        $popover.classList.add("rtc-popover__displayed");
        $popover.style.top = (link.documentOffsetTop + 30) + "px";
        $popover.style.left = (link.documentOffsetLeft) + "px";
        $popover.innerHTML = "Loading...";

        getTopComments(link.href).then(function(data) {
            var template;
            try {
                var topComment = data[1].data.children[0].data;    
                template = commentTemplate(topComment);
            } catch(err) {
                template = "No comments yet";
            }
            $popover.innerHTML = template;
        });
    }

    function hideTopComments() {
        $popover.classList.remove("rtc-popover__displayed");
        $popover.innerHTML = "";
        $popover.style.left = 0;
    }

    function getTopComments(url) {
        jsonurl = url.substring(0, url.length - 1);
        jsonurl += '.json?limit=10&depth=10';
        return new Promise(function(resolve, reject) {
            
            if(cache[url]) {
                console.log("cached...");
                resolve(cache[url]);
                return;
            }

            var req = new XMLHttpRequest();
            req.open('GET', jsonurl);
            req.responseType = 'json';
            req.onload = function() {
                if (req.status == 200) {
                    cache[url] = req.response;
                    resolve(req.response);
                }
                else {
                    reject(Error(req.statusText));
                }
            };
            req.onerror = function() {
                reject(Error("Network Error"));
            };
            req.send();
        });
    }
})();

RedditTopComment.init();


// Utils
// ================================================


/**
 * Adds a delay to a hovered element
 * @param {DOMElement} el 
 * @param {Object} opts
 * opts = {
        onHover: {Function},
        offHover: {Function},
        onDelay: {Integer},
        offDelay: {Integer},
        hoverTarget: {DOMElement}
    }
 */

function hoverIntent(el, opts) {
    
    var onHover = opts.onHover || function() {};
    var offHover = opts.offHover || function() {};
    var onDelay = opts.onDelay || 500;
    var offDelay = opts.offDelay || 500;
    var hoverTarget = opts.hoverTarget || null;
    
    var ontimer = null;
    var offtimer = null;
    var targetHovered = false;
    
    el.addEventListener('mouseenter', function() {
        clearTimeout(offtimer);
        ontimer = setTimeout(function() {
            if(offtimer) return;
            onHover();
        }, onDelay);
    });
    el.addEventListener('mouseleave', function() {
        clearTimeout(ontimer);
        onMouseOut()
    });

    if(hoverTarget) {
        hoverTarget.addEventListener("mouseenter", function() {
            targetHovered = true;
        })
        hoverTarget.addEventListener("mouseleave", function() {
            targetHovered = false;
            onMouseOut()            
        })
    }

    function onMouseOut() {
        offtimer = setTimeout(function() {
            if(targetHovered) return;
            offHover();
            offtimer = null;
        }, offDelay);
    }
}

function htmlDecode(input){
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

window.Object.defineProperty( Element.prototype, 'documentOffsetTop', {
    get: function () { 
        return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
    }
} );

window.Object.defineProperty( Element.prototype, 'documentOffsetLeft', {
    get: function () { 
        return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft : 0 );
    }
} );
