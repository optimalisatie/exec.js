# WebWorker vs exec.js Round Trip Test

The test `webworker-vs-execjs-ping.js` compares the round trip time for a WebWorker and exec.js. 

As of `v1.0.4` WebWorkers are 2x faster (0,15ms vs 0,3ms) but WebWorkers require 100ms to startup compared to 10ms for exec.js, making exec.js faster for smaller workloads.

Further optimization may enable exec.js to lower the startup latency to 1-2ms and to achieve the same round trip performance as WebWorkers.

![WebWorker vs Exec.js](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/webworker-vs-execjs-ping.png)

In Chrome 55+ exec.js is multithreading with full access to DOM.

