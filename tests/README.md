# WebWorker vs exec.js Round Trip Test

The test `webworker-vs-execjs-ping.js` compares the round trip time for a WebWorker and exec.js. 

As of `v1.0.16`, exec.js is 10x to 40x faster than WebWorkers. In the newest versions of Chrome the round trip speed of exec.js is 0,005ms compared to 0,2ms for WebWorkers while being multi-threaded.

<sup>Chrome Version 57.0.2987.98 Built on 8.7, running on Debian 8.7 (64-bit)</sup>

![WebWorker vs Exec.js](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/webworker-vs-execjs-ping.png)

In Chrome 55+ exec.js is multithreading with full access to DOM and with the ability to return functions and objects without serialization, cloning or the need for transferable objects.
