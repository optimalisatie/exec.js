/**
 * Cancellable Javascript Code Runner
 * @version 1.0.4
 * @link https://github.com/optimalisatie/exec.js
 */
(function(window) {

    // container
    var document = window.document,
        c, f = document.createElement('iframe');

    // constructor
    var exec = function(code, callback) {
        var runner = this,
            id = "_" + +new Date() + Math.random().toFixed(16).substring(2),
            e = 'EventListener',
            E = 'Event',
            p = 'postMessage',
            o = 'onmessage';

        // event handler
        e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
        E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

        // create code execution container
        if (!c) {
            c = document.createElement('div');
            c.style.display = 'none';
            document.body.appendChild(c);
        }
        var i = f.cloneNode(false);
        i.name = id;
        i.style.display = 'none';
        c.appendChild(i);
        var d = (i.contentWindow || i.contentDocument);
        if (d.document) {
            d = d.document
        }

        // process data
        var P = function(m) {
            if (m.data[0] === id && callback) {
                callback(m.data[1]);
            }
        }

        // stop code execution
        var stopped;
        this.stop = function() {

            // stopped
            if (stopped) {
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

        // post data to container
        var s;
        this.post = function(data, transferableList) {

            if (!s) {
                s = i.contentWindow[p].bind(i.contentWindow);
            }

            // stopped
            if (stopped) {
                return;
            }
            s(data, "*", transferableList);
        };

        // watch message event
        window[e[0]](E, P, false);

        // convert to IIFE
        code = '(' + ((typeof code === 'function') ? code.toString() : 'function(' + p + '){' + code + '}') + ')(' + p + ')';

        // execute code
        d.open();
        d.write('<script>(function() {var ' + o + ';var P=function(){if(' + o + '){P = ' + o + ';}' + o + '.apply(this,arguments);};var ' + p + '=function(d,t){parent.' + p + '(["' + id + '",d],"*",t);};' + code + ';window["' + e[0] + '"]("' + E + '",P,false);})();</script>');
        d.close();
    };

    // post data to container
    exec.prototype.post = function(data, transferableList) {
        this.post(data, transferableList);
    };

    // abort execution
    exec.prototype.stop = function() {
        this.stop();
    };

    // define public constructor
    window['exec'] = exec;
})(window);