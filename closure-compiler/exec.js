/** @interface */
window['exec'] = function(code, callback) {
    this.post = function() {}
    this.stop = function() {}
    this.exec = function() {}
}

window['fetch'] = function() {}
var cancellableFetch = function(args) {
    this.cancel = function() {}
}
cancellableFetch.prototype.catch = function() {}
cancellableFetch.prototype.then = function() {}