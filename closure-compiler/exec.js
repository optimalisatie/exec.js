/** @interface */
window['exec'] = function(code, callback) {
        this.post = function() {}
        this.stop = function() {}
        this.exec = function() {}
    }
    /** @interface */
window['fetch'] = function() {}
var abortableFetch = function(args) {
    this.abort = function() {}
}
abortableFetch.prototype.catch = function() {}
abortableFetch.prototype.then = function() {}