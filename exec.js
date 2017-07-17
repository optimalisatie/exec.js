/**
 * Cancellable Javascript Code Runner
 * @version 1.0.2
 * @link https://github.com/optimalisatie/exec.js
 */
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
    var i = document.createElement('iframe');
    i.name = id;
    i.style = 'display:none;';
    document.body.appendChild(i);
    var d = (i.contentWindow || i.contentDocument);
    if (d.document) {
        d = d.document
    }

    // process data
    var processData = function(m) {
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
            document.body.removeChild(i);
        } catch (e) {}

        // remove listener
        window[e[1]](E, processData, false);
    };

    // post data to container
    this.post = function(data, transferableList) {

        // stopped
        if (stopped) {
            return;
        }

        i.contentWindow[p](data, document.location.href, transferableList);
    };

    // watch message event
    window[e[0]](E, processData, false);

    // convert to IIFE
    code = '(' + ((typeof code === 'function') ? code.toString() : 'function(' + p + '){' + code + '}') + ')(' + p + ')';

    // execute code
    d.open();
    d.write('<script>(function() {var ' + o + ';var P=function(){if(' + o + '){' + o + '.apply(this,arguments);}};var ' + p + '=function(d,t){parent.' + p + '([\'' + id + '\',d],' + JSON.stringify(document.location.href) + ',t);};' + code + ';window[\'' + e[0] + '\'](\'' + E + '\',P,false);})();</script>');
    d.close();
};

// post data to container
exec.prototype.post = function(data, transferableList) {
    return this.post(data, transferableList);
};

// abort execution
exec.prototype.stop = function() {
    return this.stop();
};