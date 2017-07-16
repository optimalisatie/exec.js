/**
 * Cancellable Javascript Code Runner
 * @link https://github.com/optimalisatie/Cancellable-Javascript-Code-Runner/
 */
var exec = function(code) {
    var runner = this,
        id = "_" + +new Date() + Math.random().toFixed(16).substring(2),
        e = 'EventListener',
        E = 'Event';

    // event handler
    e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
    E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

    // stop runner
    var stop;
    this.stop = function() {
        if (stop) {
            stop();
            stop = false;
        }
    }

    // promise
    this.promise = new Promise(function(resolve, reject) {

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
            if (m.data[0] === id) {
                resolve(m.data[1]);

                // remove listener
                window[e[1]](E, processData, false);
            }
        }

        // stop code execution
        stop = function() {
            try {
                var frm = window.frames['exec' + id];

                // IE
                if (typeof frm.stop === 'undefined') {
                    frm.document.execCommand('Stop');
                } else {
                    frm.stop();
                }

                document.body.removeChild(i);
            } catch (e) {}

            // remove listener
            window[e[1]](E, processData, false);

            console.warn('Exec aborted');
        }

        // watch message event
        window[e[0]](E, processData, false);

        // convert to IIFE string
        if (typeof code === 'function') {
            code = '(' + code.toString() + ')()';
        }

        // execute code
        d.open();
        d.write('<script>var returnData = function(data,buffer) { if (typeof buffer !== \'undefined\') { buffer = [buffer]; } parent.postMessage([\'' + id + '\',data],' + JSON.stringify(document.location.href) + ',buffer); };' + code + '</script>');
        d.close();

    });
};
exec.prototype = Object.create(Promise.prototype);
exec.prototype.constructor = exec;
exec.prototype.catch = function(fail) {
    this.promise.catch(fail);
    return this;
}
exec.prototype.then = function(success, fail) {
    this.promise.then(success, fail);
    return this;
};
exec.prototype.stop = function() {
    return this.stop();
};
