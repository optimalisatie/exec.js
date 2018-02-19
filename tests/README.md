# WebWorker vs exec.js Round Trip Test

The test `webworker-vs-execjs-ping.js` compares the round trip time for a WebWorker and exec.js. 

<sup>Chrome Version 57.0.2987.98 (64-bit)</sup>

![WebWorker vs Exec.js](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/webworker-vs-execjs-ping.png)

<sup>Chrome Version 60.0.3112.72 (64-bit)</sup>

![WebWorker vs Exec.js Chrome 60](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/chrome-60.png)

In Chrome 55+ `exec.js` may be executed in a separate thread (multi-threading). 
