// heavy workload used by both exec.js and WebWorker
// requestIdleCallback to test non-blocking background task in new browsers
// change iterations to make test less or more heavy
var calculation = 'var result=[],iterations = 50,multiplier = 1000000000;for (var i = 0; i < iterations; i++) { var candidate = i * (multiplier * Math.random()); var isPrime = true; for (var c = 2; c <= Math.sqrt(candidate); ++c) { if (candidate % c === 0) { isPrime = false; break; } } if (isPrime) {result.push(candidate);}}';
var PINGCODE = 'onmessage=function pong(){requestIdleCallback(function() {' + calculation + 'postMessage(result);});}';
var PINGCODE_WEBWORKER = 'onmessage=function pong(){' + calculation + 'postMessage(result);}';

// optionally, prepare exec.js for performance
exec(1); // create pool with 1 container

// clear console
console.clear();

// exec.js round trip / ping test
var execTest = function(oncomplete) {

    console.time('exec.js completed');

    var n = 0;

    console.time('exec.js ping');

    // start exec.js
    var runner = new exec(PINGCODE, function onmessage() {

        console.timeEnd('exec.js ping');

        if (n < 10) {
            n++;
            console.time('exec.js ping');
            runner.post(null);
        } else {

            console.timeEnd('exec.js completed');

            runner.stop();

            if (oncomplete) {
                oncomplete();
            }
        }
    });

    // send first ping
    runner.post(null);
}

// web worker round trip / ping test
var wwTest = function(oncomplete) {

    console.time('ww completed');

    var n = 0;

    console.time('ww ping');

    // create worker
    var blob;

    // try Blob API
    try {
        blob = new Blob([PINGCODE_WEBWORKER], {
            type: 'text/javascript'
        });
    } catch (e) { // Backwards-compatibility
        var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(PINGCODE_WEBWORKER);
        blob = blob.getBlob('text/javascript');
    }

    // start WebWorker
    var worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = function(e) {

        console.timeEnd('ww ping');

        if (n < 10) {
            n++;
            console.time('ww ping');
            worker.postMessage(null);
        } else {

            console.timeEnd('ww completed');

            worker.terminate();

            if (oncomplete) {
                oncomplete();
            }
        }
    }

    // send first ping
    worker.postMessage(null);
};

// start test
setTimeout(function() {
    execTest(wwTest);
}, 0);
