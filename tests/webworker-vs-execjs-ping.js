// simple ping pong code used by both exec.js and WebWorker
var PINGCODE = 'onmessage=function pong(){postMessage(null);}';

// exec.js round trip / ping test
var execTest = function(oncomplete) {

    console.time('exec.js completed');

    var n = 0;
    var ping = Math.random().toFixed(16).substring(2);

    console.time('exec.js ping ' + ping);

    // start exec.js
    var runner = new exec(PINGCODE, function onmessage() {

        console.timeEnd('exec.js ping ' + ping);

        if (n < 10) {
            n++;
            ping = Math.random().toFixed(16).substring(2);
            console.time('exec.js ping ' + ping);
            runner.post(null);
        } else {
            runner.stop();

            console.timeEnd('exec.js completed');

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
    var ping = Math.random().toFixed(16).substring(2);

    console.time('ww ping ' + ping);

    // create worker
    var blob;

    // try Blob API
    try {
        blob = new Blob([PINGCODE], {
            type: 'text/javascript'
        });
    } catch (e) { // Backwards-compatibility
        var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(PINGCODE);
        blob = blob.getBlob('text/javascript');
    }

    // start WebWorker
    var worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = function(e) {

        console.timeEnd('ww ping ' + ping);

        if (n < 10) {
            n++;
            ping = Math.random().toFixed(16).substring(2);
            console.time('ww ping ' + ping);
            worker.postMessage(null);
        } else {
            worker.terminate();

            console.timeEnd('ww completed');

            if (oncomplete) {
                oncomplete();
            }
        }
    }

    // send first ping
    worker.postMessage(null);
};

execTest(wwTest);