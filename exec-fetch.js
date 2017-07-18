/**
 * Abortable Fetch API (requires exec.js)
 * @link https://github.com/optimalisatie/exec.js
 */

// fetch extended with .abort() method
(function(window) {

    // fetch not supported
    if (!window.fetch) {
        return;
    }

    var abortableFetch = function(args) {

        // start fetch execution container
        var runner = new exec('onmessage=function(a,b,c){fetch.apply(self,a).then(b).catch(c);}');

        // abort fetch request
        this.abort = function() {
            runner.stop();
            return this;
        };

        // promise
        this.promise = new Promise(function(resolve, reject) {
            runner.post(args, resolve, reject);
        });

        // catch
        this.catch = function(fail) {
            this.promise = this.promise.catch(fail);
            return this;
        };

        // then
        this.then = function(success, fail) {
            this.promise = this.promise.then(success, fail);
            return this;
        };

        return this;
    };

    // override fetch
    window['fetch'] = function() {
        return new abortableFetch(arguments);
    }
})(window);