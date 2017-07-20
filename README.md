# Javascript Code Runner  [![npm version](https://badge.fury.io/js/exec.js.svg)](http://badge.fury.io/js/exec.js)
`exec.js` (621 bytes) is a high performance and low latency javascript code runner that enables to isolate and abort javascript code execution, including setTimeout/setInterval, promises and Fetch requests. It supports all browsers.

The code is executed in an isolated container with fine grained restriction capabilities, full access to DOM and the ability to return functions and objects without serialization or cloning (no overhead). The speed is much better than a WebWorker (see [tests](https://github.com/optimalisatie/exec.js/tree/master/tests)).

In some modern browsers (Chrome 55+) the code may be executed in a separate thread (multi-threading). (see Chrome [OOPIF](https://www.chromium.org/developers/design-documents/oop-iframes) and [Notes on multi-threading](https://github.com/optimalisatie/exec.js#notes-on-multi-threading)).

Table of contents
=================

  * [Install](#install)
  * [Simple example](#simple-fetch-request)
  * [Abortable Fetch (extension)](#abortable-fetch)
  * [Security / Code Isolation](#security--isolation)
  * [Performance](#performance)
  * [DOM access](#access-to-dom)
  * [Abort code execution](#abort--cancel-code-execution)
  * [Non-blocking UI / multi-threading](#non-blocking-ui-by-using-requestidlecallback)
  * [Tests](/tests)

# Install

with npm:

`npm install exec.js`

with bower:

`bower install exec.js`

# Usage

Include `exec.js` in the HTML document.

```html
<script src="exec.min.js"></script>
```

Use `var runner = new exec(your code);` to execute javascript code in an isolated container. You can provide the code as a string or as a function. It returns an object with the methods `runner.post()` to post data to the container and `runner.stop()` that instantly aborts execution and clears memory. 

You can return data from your code using the `postMessage(data)` function. You can receive data in the container by defining `onmessage`, e.g. `onmessage=function(e) { // e.data }`.

### Simple Fetch request
```javascript
var runner = new exec(function(postMessage) {

    fetch('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js')
        .then(postMessage)
        .catch(function(err) {
            console.log(err.message);
        });

}, function(response) {

    // process fetch response    
    response.text().then(function(text) {
        console.log('fetch result', text.length);
    });
    
});

// timeout in 5 seconds
setTimeout(function() {
    runner.stop(); // cancel Fetch request
},5000);
```

### Abortable Fetch

Include `exec-fetch.js` (221 bytes) in the HTML document.

```html
<script src="exec.min.js"></script>
<script src="exec-fetch.min.js"></script>
```

The native [fetch](https://developers.google.com/web/updates/2015/03/introduction-to-fetch) API is now enhanced with a `.abort()` method. **This is not a Polyfill.**

```javascript
// normal fetch request
var request = fetch('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js')
    .then(function(response) {
        response.text().then(function(text) {
            console.log('response', text.length);
        });
    }).catch(function(err) {
        console.log('err', err.message);
    });

// abort request after 10ms
setTimeout(function() {
    request.abort();
}, 10);

```

Fine tune the timeout to test Fetch request and/or response cancellation.

![Cancelled Fetch API Request and Response](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/fetch-cancel.png)

### Performance

Abortable fetch requires a dedicated cancellable execution container per fetch request. Enhance then performance of `exec.js` when making many subsequent fetch (or exec) requests by creating an exec.js container pool. 

```javascript
// create container pool for performance
exec(5);

console.time('abortable fetch with pool');
var url = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js';
fetch(url).catch(function(err){}).abort();
fetch(url).catch(function(err){}).abort();
fetch(url).catch(function(err){}).abort();
fetch(url).catch(function(err){}).abort();
fetch(url).catch(function(err){}).abort();
console.timeEnd('abortable fetch with pool');
```

### Abort / cancel code execution

To cancel code execution, use `runner.stop()`.

```javascript
var runner = new exec('setInterval(function() {console.log(123);},100);');
setTimeout(function() {
    runner.stop();
},1000);
```

### Access to DOM

To access the DOM, use `parent.document` ([info](https://www.w3schools.com/jsref/prop_win_parent.asp)). DOM access is available in all browsers. 

```javascript
var runner = new exec('setInterval(function() {var h = parent.document.createElement(\'h1\');h.innerHTML = \'test\';parent.document.body.insertBefore(h, parent.document.body.firstChild);},100);');
setTimeout(function() {
    runner.stop();
},1000);
```

### Security / isolation

It is possible to isolate the code to be executed and block access to DOM, navigation, alert windows/popups, form submission and other specific privileges by passing a third parameter with an array of [sandbox](https://www.w3schools.com/tags/att_iframe_sandbox.asp) parameters.

```javascript
// enable code isolation
exec(code,onmessage,[])

// enable code isolation with forms and API's enabled
exec(code,onmessage,['allow-forms','allow-pointer-lock'])
```

The `allow-scripts` and `allow-same-origin` parameters are enabled by default. Sandbox isolation is disabled by default.

### On the fly code execution

WebWorkers consist of fixed code and a communication mechanism with overhead. `exec.js` allows running code to be updated instantly.

```javascript
var runner = new exec('setInterval(function() {console.log("startup code")},200);', 
    function onmessage(data) {
        console.info('response from container:', data);
    });

setTimeout(function() {
    runner.exec('console.log("some other code");');
}, 100);

setTimeout(function() {

    console.log('redefine "onmessage callback"');

    /* runner.onmessage() */
    runner.onmessage = function(data) {
        console.info('response in redefined "onmessage callback"',data);
    }

    console.log("setup/redefine message handler");

    /* runner.exec() */
    runner.exec('onmessage=function(data){postMessage("received "+data+" in container");}');

    // test message handler
    console.log("post some data to container");

    /* runner.post() */
    runner.post('some data');

    setTimeout(function() {

        console.log("setup/redefine message handler with function");

        runner.exec(function(postMessage) {
            onmessage = function(data) {
                postMessage("v2: received " + data + " in container");
            }
        });

        // test message handler
        console.log("post some data to container");
        runner.post('some data 2');

        setTimeout(function() {

            console.log('stop');
            runner.stop();

        }, 1000);

    }, 1000);

}, 1000);

```

### Notes on multi-threading

After further testing, multithreading with much better performance than WebWorkers is possible, however, as it seems it can only be achieved by starting Google Chrome 55+ with the flag `--process-per-site`.

Google states the following in online documentation about the future.

> Subframes are **currently** rendered in the same process as their parent page. Although cross-site subframes do not have script access to their parents and could safely be rendered in a separate process, Chromium does not yet render them in their own processes. Similar to the first caveat, this means that pages from different sites may be rendered in the same process. **This will likely change in future versions of Chromium.**
> 
> https://www.chromium.org/developers/design-documents/process-models

We've tested with Chrome 61.0.3159.5 (unstable) so it appears that multi-threading will not become available to subframes soon.

In Chrome 61 WebWorkers are still very slow with a startup latency of ~100ms on a 2016 Core M7 laptop.

### Non-blocking UI by using requestIdleCallback

In Chrome 59/60+ and possibly Firefox 53+ using `requestIdleCallback` ([info](https://developer.mozilla.org/nl/docs/Web/API/Window/requestIdleCallback)) makes it possible to use `exec.js` for non-blocking background computations with faster round trip performance than WebWorkers. In tests with a page with animated GIFs there was no effect on the animations while the computations were processed 30-40% faster than in a WebWorker, saving seconds. Further testing is needed. 

![WebWorker vs Exec.js Heavy Non-blocking UI](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/heavy-non-blocking-ui.png)

Test page: https://giphy.com/search/multi-tasking

The following code can be used to test non-blocking UI performance compared to a WebWorker. Use a page with animated GIFs to detect if the computations block the UI. (simply copy and paste the code in the console on a page).

```javascript
// heavy workload for exec.js and WebWorker
var PINGCODE = 'onmessage=function pong(){requestIdleCallback(function() {for (var i=0; i<999999;i++){var y = Math.pow(i,i);} var baseNumber = 3;var result = 0;for (var i = Math.pow(baseNumber, 10); i >= 0; i--) {result += Math.atan(i) * Math.tan(i);}; postMessage(y);});}';
var PINGCODE_WEBWORKER = 'onmessage=function pong(){for (var i=0; i<999999;i++){var y = Math.pow(i,i);} var baseNumber = 3;var result = 0;for (var i = Math.pow(baseNumber, 10); i >= 0; i--) {result += Math.atan(i) * Math.tan(i);}; postMessage(y);}';

// Full test code on https://github.com/optimalisatie/exec.js/blob/master/tests/webworker-vs-execjs-ping-heavy.js
```
