/**
 * Cancellable Javascript Code Runner based on Blob API
 * @version 1.2.0
 * @link https://github.com/optimalisatie/exec.js
 */
(function(window) {

    // container
    var c, document = window.document,
        documentElement = document.documentElement,
        idleCallback = window.requestIdleCallback || function(fn) {
            fn();
        },
        f = document.createElement('iframe'),
        pool = [];

    // event handler
    var e = 'EventListener',
        E = 'Event',
        p = 'postMessage',
        o = 'onmessage';
    e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
    E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

    // create script container blob
    var blob = function(code) {
        return URL.createObjectURL(new Blob([code], {
            type: 'text/javascript'
        }));
    }

    // execution container
    var container = 'w=window,d=document,y="_"+i;b=' + blob.toString() + ',' + o + ',' + p + '=parent[i];w[y]=' + o + ';w[i]=function(c,l){c="("+((typeof c === "function")?c.toString():"function(' + p + '){"+c+"}")+")(' + p + ');if(' + o + '){w[y]=' + o + ';}";var e=d.createElement("script");e.src=b(c);if(l){e.onload=l;};d.documentElement.appendChild(e);};parent[y]();';

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
            i.parentNode.removeChild(i);
        } catch (e) {}

        // cleanup in idle time
        idleCallback(function() {

            // remove listener
            try {
                delete window[id];
                delete window['_' + id];
            } catch (e) {}

            // add new container to pool
            if (pool.length < poolSize) {
                node(documentElement);
            }
        });
    }

    // create container node
    var node = function(target) {
        var i = f.cloneNode(false);
        i.style.display = 'none';
        target.appendChild(i);
        pool.push(i);
    }

    // default poolSize (max idle containers)
    var poolSize = 5;

    // constructor
    var exec = function(code, onmessage) {

        // create container pool
        if (!(this instanceof exec)) {
            poolSize = code;
            var n = code - pool.length;
            if (n > 0) {
                var fragment = document.createDocumentFragment();
                for (var x = 0; x < n; x++) {
                    node(fragment);
                }
                documentElement.appendChild(fragment);
            }
        } else {

            var runner = this,
                id = "_" + +new Date() + Math.random().toFixed(16).substring(2),
                s, i, loaded, stopped, q = [];

            // get container from pool
            while (!(i = pool.shift())) {

                // create container
                node(documentElement);
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
                if (!loaded) {
                    q.push(['post', arguments]);
                } else {
                    i.contentWindow['_' + id].apply(this, arguments);
                }
                return this;
            }

            // execute code in container
            this.exec = function(code, onload) {
                if (!loaded) {
                    q.push(['exec', arguments]);
                } else {
                    i.contentWindow[id](code, onload);
                }
                return this;
            }

            // message handler
            this.onmessage = onmessage;
            window[id] = function() {
                if (runner.onmessage) {
                    runner.onmessage.apply(this, arguments);
                }
            };

            // container onload
            window['_' + id] = function() {

                if (!loaded) {
                    loaded = true;

                    // execute code
                    if (code) {
                        runner.exec(code, function() {

                            if (q.length) {
                                var Q;
                                while (Q = q.shift()) {
                                    runner[Q[0]].apply(this, Q[1]);
                                }
                            }
                        });
                    }
                }
            }

            // start container
            d.open();
            d.write('<script src="' + blob('var i="' + id + '",' + container) + '"></scr' + 'ipt>');
            d.close();
        }
    };

    // public exec API
    window['exec'] = exec;

})(window);