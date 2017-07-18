/**
 * Cancellable Fetch API (requires exec.js)
 * @link https://github.com/optimalisatie/exec.js
 */

// fetch extended with .cancel() method
(function(window) {

    var cancellableFetch = function(args) {

        // start fetch execution container
        var runner = new exec('onmessage = function(req) {window.fetch.apply(window, req[0]).then(req[1]).catch(req[2]);}');

        // cancel fetch request
        this.cancel = function() {
            runner.stop();
            return this;
        };

        // promise
        this.promise = new Promise(function(resolve, reject) {
            runner.post([args, resolve, reject]);
        });

        return this;
    };
    cancellableFetch.prototype = Object.create(Promise.prototype);
    cancellableFetch.prototype.constructor = cancellableFetch;
    cancellableFetch.prototype.catch = function(fail) {
        this.promise = this.promise.catch(fail);
        return this;
    }
    cancellableFetch.prototype.then = function(success, fail) {
        this.promise = this.promise.then(success, fail);
        return this;
    };

    // override fetch
    window['fetch'] = function() {
        return new cancellableFetch(arguments);
    }
})(window);