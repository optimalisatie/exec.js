# WebWorker vs exec.js Round Trip Test

The test `webworker-vs-execjs-ping.js` compares the round trip time for a WebWorker and exec.js. 

<sup>Chrome Version 57.0.2987.98 Built on 8.7, running on Debian 8.7 (64-bit)</sup>

![WebWorker vs Exec.js](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/webworker-vs-execjs-ping.png)

In Chrome 60 Beta the WebWorker startup latency is still at ~100ms on a 2016 Core M7 laptop (the performance is worse than Chrome 57 on a 2012 Core i5) while the `exec.js` performance is enhanced greatly reaching speeds as fast as 0,001ms per round trip. Chrome 58 on the same laptop performs worse.

<sup>Chrome Version 60.0.3112.72 (Official Build) beta (64-bit)</sup>

![WebWorker vs Exec.js Chrome 60](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/chrome-60.png)

In Chrome 55+ `exec.js` may be executed in a separate thread (multithreading). Testing is needed. (see Chrome [OOPIF](https://www.chromium.org/developers/design-documents/oop-iframes)).
