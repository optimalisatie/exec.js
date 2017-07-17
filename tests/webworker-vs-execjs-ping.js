// simple ping code used by both exec.js and WebWorker
var PINGCODE = 'onmessage=function(){postMessage(null);}';

// ping test
var execTest = function(oncomplete) {

    var n = 0;
    var ping = Math.random().toFixed(16).substring(2);

    console.time('exec.js ping ' + ping);

    var runner = new exec(PINGCODE, function() {
        console.timeEnd('exec.js ping ' + ping);

        if (n < 10) {
            n++;
            ping = Math.random().toFixed(16).substring(2);
            console.time('exec.js ping ' + ping);
            runner.post(null);
        } else {
            runner.stop();
            if (oncomplete) {
                oncomplete();
            }
        }
    });
    runner.post(null);
}


// web worker
var wwTest = function(oncomplete) {

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
            if (oncomplete) {
                oncomplete();
            }
        }
    }

    worker.postMessage(null);
};

execTest(wwTest);