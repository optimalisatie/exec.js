/** @interface */
window['exec'] = function(code, onmessage) {
        this.post = function() {}
        this.stop = function() {}
        this.exec = function() {}
        this.on = function() {}
    }
    /** @interface */
window['fetch'] = function() {}
var abortableFetch = function(args) {
    this.abort = function() {}
}
abortableFetch.prototype.catch = function() {}
abortableFetch.prototype.then = function() {}