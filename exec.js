/**
 * Cancellable Javascript Code Runner
 * @version 1.0.7
 * @link https://github.com/optimalisatie/exec.js
 */
(function(window) {

    // container
    var c, document = window.document,
        f = document.createElement('iframe');

    // constructor
    var exec = function(code, callback) {

        var runner = this,
            id = "_" + +new Date() + Math.random().toFixed(16).substring(2),
            e = 'EventListener',
            E = 'Event',
            p = 'postMessage',
            o = 'onmessage',
            s, i, started, stopped, q = [];

        // event handler
        e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
        E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

        // stop code execution
        this.s = function() {

            // stopped
            if (stopped || !started) {
                return;
            }
            stopped = true;

            try {
                var frm = window.frames[id];

                // IE
                if (typeof frm.stop === 'undefined') {
                    frm.document.execCommand('Stop');
                } else {
                    frm.stop();
                }
            } catch (e) {}

            // remove from document
            try {
                c.removeChild(i);
            } catch (e) {}

            // remove listener
            window[e[1]](E, P, false);
        };

        // process data
        var P = function(m) {
            if (m.data[0] === id && callback) {
                callback(m.data[1]);
            }
        }

        // post data to container
        this.p = function(data, transferableList) {

            // wait for start
            if (!started) {
                return q.push([data, transferableList]);
            }

            if (!s) {
                s = i.contentWindow[p].bind(i.contentWindow);
            }

            // stopped
            if (stopped) {
                return;
            }
            s(data, "*", transferableList);
        };

        // start
        var start = function() {

            // wait for body
            if (!document.body) {
                return setTimeout(start, 0);
            }
            started = true;

            // create code execution container
            if (!c) {
                c = document.createElement('div');
                c.style.display = 'none';
                document.body.insertBefore(c, document.body.firstChild)
            }
            i = f.cloneNode(false);
            i.name = id;
            i.style.display = 'none';
            c.appendChild(i);
            var d = (i.contentWindow || i.contentDocument);
            if (d.document) {
                d = d.document
            }

            // watch message event
            window[e[0]](E, P, false);

            // convert to IIFE
            code = '(' + ((typeof code === 'function') ? code.toString() : 'function(' + p + '){' + code + '}') + ')(' + p + ')';

            // execute code
            d.open();
            d.write('<script>(function() {var ' + o + ';var ' + p + '=function(d,t){parent.' + p + '(["' + id + '",d],"*",t);};' + code + ';if (' + o + ') {window["' + e[0] + '"]("' + E + '",' + o + ',false);}})();</scr' + 'ipt>');
            d.close();

            // process queued posts
            if (q) {
                var Q;
                while (Q = q.shift()) {
                    runner.post.apply(this, Q);
                }
            }

        };

        // start
        start();
    };

    // post data to container
    exec.prototype.post = function(data, transferableList) {
        this.p(data, transferableList);
    };

    // abort execution
    exec.prototype.stop = function() {
        this.s();
    };

    // define public constructor
    window['exec'] = exec;
})(window);