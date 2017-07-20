/**
 * Cancellable Javascript Code Runner
 * @version 1.4.3
 * @link https://github.com/optimalisatie/exec.js
 */
(function(window) {

    // container
    var c, document = window.document,
        documentElement = document.documentElement,
        idleCallback = window.requestIdleCallback || setTimeout,
        f = document.createElement('iframe'),
        pool = {},
        e = 'EventListener',
        E = 'Event',
        p = 'postMessage',
        o = 'onmessage';
    e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
    E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

    // execution container
    var container = ',w=window,d=document,r="_"+i,' + o + ',' + p + '=parent[i];window[r]=function(c){(new Function("' + p + '","' + o + '",c+"if(' + o + '){w[i]=' + o + ';}"))(' + p + ',null);};';

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

        // retrieve sandbox configuration
        var sandbox = i.getAttribute('sandbox') || 0;

        // remove container
        try {
            i.parentNode.removeChild(i);
        } catch (e) {}

        // cleanup in idle time
        idleCallback(function() {

            // remove listener
            try {
                delete window[id];
            } catch (e) {}

            // add new container to pool
            if (pool[sandbox].length < poolSize) {
                node(documentElement, sandbox);
            }
        });
    }

    // create container node
    var node = function(target, sandbox) {
        var i = f.cloneNode(false);
        i.style.display = 'none';

        // isolate container
        if (sandbox) {
            i.sandbox = sandbox + ' allow-same-origin allow-scripts';
        }

        // add to DOM
        target.appendChild(i);

        // add to pool
        if (typeof pool[sandbox] === 'undefined') {
            pool[sandbox] = [];
        }
        pool[sandbox].push(i);
    }

    // default poolSize (max idle containers)
    var poolSize = 5;

    // constructor
    var exec = function(code, onmessage, sandbox) {

        // isolate container
        sandbox = sandbox = ((sandbox instanceof Array) ? ' ' + sandbox.join(' ') : 0);

        // create container pool
        if (!(this instanceof exec)) {
            poolSize = code;
            if ((pool[sandbox] || []).length < code) {
                var fragment = document.createDocumentFragment();
                for (var x = 0; x < code; x++) {
                    node(fragment, sandbox);
                }
                documentElement.appendChild(fragment);
            }
        } else {
            var runner = this,
                id = "_" + +new Date() + Math.random().toFixed(16).substring(2),
                s, i, stopped;

            // get container from pool
            while (!(i = (pool[sandbox] || []).shift())) {

                // create container
                node(documentElement, sandbox);
            }

            // initiate code execution container
            i.name = id;
            var d = (i.contentWindow || i.contentDocument);
            if (d.document) {
                d = d.document;
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
            }

            // post data to container
            this.post = function() {
                i.contentWindow[id].apply(this, arguments);
                return this;
            }

            // message handler
            this.onmessage = onmessage;
            window[id] = function() {
                if (runner.onmessage) {
                    runner.onmessage.apply(this, arguments);
                }
            };

            // convert to IIFE
            var iife = function(code) {
                return '(' + ((typeof code === 'function') ? code.toString() : 'function(' + p + '){' + code + '}') + ')(' + p + ');';
            }

            // execute code in container
            this.exec = function(code) {
                i.contentWindow['_' + id](iife(code));
                return this;
            }

            // execute code
            d.open();
            d.write('<script>var i="' + id + '"' + container + iife(code) + 'w[i]=' + o + ';</scr' + 'ipt>');
            d.close();

            return this;
        }
    };

    // public exec API
    window['exec'] = exec;

})(window);