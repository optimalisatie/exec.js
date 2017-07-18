# WebWorker vs exec.js Round Trip Test

The test `webworker-vs-execjs-ping.js` compares the round trip time for a WebWorker and exec.js. 

As of `v1.0.11`, exec.js is 10x faster than WebWorkers without 100ms to startup latency.

![WebWorker vs Exec.js](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/webworker-vs-execjs-ping.png)

In Chrome 55+ exec.js is multithreading with full access to DOM and with the ability to return original objects without serialization, cloning or the need for transferable objects.
