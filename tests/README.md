# WebWorker vs exec.js Round Trip Test

The test `webworker-vs-execjs-ping.js` compares the round trip time for a WebWorker and exec.js. 

As of `v1.1.0`, exec.js is 10x to 40x faster than WebWorkers. In the newest versions of Chrome the round trip speed of exec.js is 0,005ms compared to 0,2ms for WebWorkers.

<sup>Chrome Version 57.0.2987.98 Built on 8.7, running on Debian 8.7 (64-bit)</sup>

![WebWorker vs Exec.js](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/webworker-vs-execjs-ping.png)

In Chrome 55+ the code may be executed in a separate thread (multithreading). Testing is needed. (see Chrome [OOPIF](https://www.chromium.org/developers/design-documents/oop-iframes)).