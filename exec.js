/**
 * Javascript Code Runner
 * @version 1.5.4
 * @link https://github.com/optimalisatie/exec.js
 */
(function(window) {

    // container
    var c, document = window.document,
        documentElement = document.documentElement,
        idleCallback = window.requestIdleCallback || setTimeout,
        f = document.createElement('iframe'),
        pool = {},
        default_sandbox = 'allow-same-origin allow-scripts ',
        e = 'EventListener',
        E = 'Event',
        p = 'postMessage',
        o = 'onmessage';
    e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
    E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

    // execution container
    var container = ',w=window,d=document,r="_"+i,' + o + ',' + p + '=parent[i];window[r]=function(c){if(typeof c=="string"){c=new Function("' + p + '",c);}c.call(this,' + p + ');if(' + o + '){w[i]=' + o + ';}};';

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
            i.sandbox = sandbox;
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
    var exec = function(code, onmessage, sandbox, csp) {

        // isolate container
        sandbox = sandbox = ((sandbox instanceof Array) ? default_sandbox + sandbox.join(' ') : 0);

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
                s, i, stopped, meta = '';

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

            // redefine message handler
            this.on = function(fn) {
                onmessage = fn;
                return this;
            }
            window[id] = function() {
                if (onmessage) {
                    onmessage.apply(this, arguments);
                }
            };

            // execute code in container
            this.exec = function(code) {
                i.contentWindow['_' + id](code);
                return this;
            }

            // content security policy
            if (csp) {

                // enable default permissions for code execution container
                csp['script-src'] = (csp['script-src'] || '') + " 'nonce-execjs'";

                // construct meta
                meta = '<meta http-equiv=Content-Security-Policy content="';
                for (var rule in csp) {
                    if (csp.hasOwnProperty(rule)) {
                        meta += rule + ' ' + csp[rule] + ';';
                    }
                }
                meta += '">'
            }

            // execute code
            d.open();
            d.write(meta + '<script nonce=execjs>var i="' + id + '"' + container + '(' + ((typeof code === 'function') ? code.toString() : 'function(' + p + '){' + code + '}') + ')(' + p + ');w[i]=' + o + ';</scr' + 'ipt>');
            d.close();

            return this;
        }
    };

    // public exec API
    window['exec'] = exec;

})(window);