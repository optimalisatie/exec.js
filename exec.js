/**
 * Cancellable Javascript Code Runner
 * @version 1.0.11
 * @link https://github.com/optimalisatie/exec.js
 */
(function(window) {

    // container
    var c, document = window.document,
        documentElement = document.documentElement,
        f = document.createElement('iframe');

    // stop code execution
    var stop = function(id, i) {
        try {
            var frm = window.frames[id];

            // IE
            if (typeof frm.stop === 'undefined') {
                frm.document.execCommand('Stop');
            } else {
                frm.stop();
            }
        } catch (e) {}

        // remove container
        try {
            documentElement.removeChild(i);
        } catch (e) {}

        try {
            delete window[id];
        } catch (e) {}
    };

    // event handler
    var e = 'EventListener',
        E = 'Event',
        p = 'postMessage',
        o = 'onmessage';
    e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
    E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

    // constructor
    var exec = function(code, callback) {
        var runner = this,
            id = "_" + +new Date() + Math.random().toFixed(16).substring(2),
            s, i, stopped;

        // create code execution container
        i = f.cloneNode(false);
        i.name = id;
        i.style.display = 'none';
        documentElement.appendChild(i);
        var d = (i.contentWindow || i.contentDocument);
        if (d.document) {
            d = d.document
        }

        // stop code execution
        this.stop = function() {

            // stopped
            if (stopped) {
                return;
            }
            stopped = true;

            // stop
            stop(id, i);
        };

        // post data to container
        this.post = function(data) {
            i.contentWindow[id](data);
        }

        // convert to IIFE
        var iife = function(code) {
            return '(' + ((typeof code === 'function') ? code.toString() : 'function(' + p + '){' + code + '}') + ')(' + p + ');';
        }

        // execute code in container
        this.exec = function(code) {
            i.contentWindow['e' + id](iife(code));
        }

        // process data posted from container
        window[id] = callback;

        // execute code
        d.open();
        d.write('<script>(function() {var ' + o + ';var ' + p + '=parent["' + id + '"]||function(){};' + iife(code) + 'window["' + id + '"]=' + o + ';window["e' + id + '"]=function(code){code = code + "if (' + o + ') {window[\'' + id + '\']=' + o + ';}";(new Function("' + p + '","' + o + '",code))(' + p + ',null);}})();</scr' + 'ipt>');
        d.close();
    };

    // define public constructor
    window['exec'] = exec;
})(window);