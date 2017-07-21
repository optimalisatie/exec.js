# Javascript Code Runner  [![npm version](https://badge.fury.io/js/exec.js.svg)](http://badge.fury.io/js/exec.js)
`exec.js` (922 bytes) is a high performance and low latency javascript code runner that enables to isolate and abort javascript code execution, including setTimeout/setInterval, promises and Fetch requests. It supports all browsers.

The code is executed in an isolated container with fine grained restriction capabilities, access to DOM and the ability to return functions and objects without serialization or cloning. 

For some workloads, the javascript performance appears to be significantly better than a WebWorker in modern browsers, without blocking UI (see [tests](https://github.com/optimalisatie/exec.js/tree/master/tests)). The startup latency can be reduced to <1ms compared to ~100ms for a WebWorker.

In modern/future browsers the code may be executed in a separate thread (see [Notes on multi-threading](#non-blocking-ui-by-using-requestidlecallback)).

Table of contents
=================

  * [Install](#install)
  * [Simple example](#simple-fetch-request)
  * [Abortable Fetch (extension)](#abortable-fetch)
  * [Security / code isolation](#security--code-isolation)
  * [Performance](#performance)
  * [DOM access](#access-to-dom)
  * [Abort code execution](#abort--cancel-code-execution)
  * [Content Security Policy (CSP) Whitelist](#content-security-policy-csp-whitelist)
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

Use `var runner = new exec(code[, onmessage][, sandbox][, csp]);` to execute javascript code in an isolated container. You can provide the code as a string or as a function.

```javascript
// start code runner with onmessage callback
var runner = new exec('setInterval(function() {console.log("startup code")},200);', 
    function onmessage(data) {
        console.info('response from container:', data);
    });

// start code runner with security isolation
var runner = new exec('console.log("secured code");',null,['allow-pointer-lock']);

// execute code in container
runner.exec('console.log("some code");');

// redefine onmessage callback
runner.on(function message(data) {
    console.info('response from container (redefined)',data);
});

// post data to container
runner.post('some data');

// execute code in container
runner.exec(function(postMessage) {

    // reconfigure message handler
    // note: use this.onmessage in runner.exec(Function)
    this.onmessage = function(data) {
        postMessage("received " + data + " in container");
    }
});

// execute code in container
runner.exec(function(postMessage) {

    // reconfigure message handler to process functions
    // note: use this.onmessage in runner.exec(Function)
    this.onmessage = function(fn) {

        fn(); // function passed from UI

        // pass a function back to UI
        postMessage(function(x,y,z) { /* ... */ });
    }
});

// post function to container
runner.post(function() { /* ... */ });

// stop code execution
runner.stop(); // this will abruptly stop any code execution including unfinished promises

// chain
new exec('onmessage=function(data){console.log(data);}',null,['allow-pointer-lock'])
    .post('test 1')
    .post('test 2')
    .on(function(data) {
        console.info('response from container:',data);
    })
    .exec('console.log("test 3");')
    .exec(function(postMessage){postMessage("post to UI");})
    .stop();

```

You can return data from your code using the `postMessage(data)` function. You can receive data in the container by defining `onmessage=function(e) { // e.data }` in the container.

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

Abortable fetch requires a dedicated `exec.js` container per fetch request. Use a container pool to improve performance.

### Performance

Enhance the performance of `exec.js` when making subsequent/simultaneous requests by creating a container pool. [Code isolation](#security--code-isolation) can be applied as a third parameter.

```javascript
// create container pool for performance
exec(5);

// exec(5,null,[]); // pool with code isolation enabled

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

### Security / code isolation

It is possible to isolate the code to be executed and block access to DOM, navigation, popups, form submission and other specific privileges by passing a third parameter with an array of [sandbox](https://www.w3schools.com/tags/att_iframe_sandbox.asp) parameters and/or a fourth parameter with [Content-Security-Policy](https://developers.google.com/web/fundamentals/security/csp/) (CSP) configuration.

```javascript
// enable code isolation
new exec(code,onmessage,[])

// enable code isolation with forms and API's enabled
new exec(code,null,['allow-forms','allow-pointer-lock']);

// enable code isolation and block loading of images, objects and media
new exec(code,null,[],{"img-src":"'none'","media-src":"'none'","object-src":"'none'"});

// restrict resource access to domain without code isolation
new exec(code,null,null,{"default-src":"domain.com"});
```

Code isolation is disabled by default. When enabled, the `allow-scripts` and `allow-same-origin` sandbox parameters are enabled by default. 

### Content Security Policy (CSP) Whitelist

To whitelist `exec.js` add `script-src 'nonce-execjs'` to the Content-Security-Policy. To use the `runner.exec()` method, `script-src: 'unsafe-eval'` is required.

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
// workload for exec.js and WebWorker
var calculation = 'var result=[],iterations = 50,multiplier = 1000000000;for (var i = 0; i < iterations; i++) { var candidate = i * (multiplier * Math.random()); var isPrime = true; for (var c = 2; c <= Math.sqrt(candidate); ++c) { if (candidate % c === 0) { isPrime = false; break; } } if (isPrime) {result.push(candidate);}}';
var PINGCODE = 'onmessage=function pong(){requestIdleCallback(function() {' + calculation + 'postMessage(result);});}';
var PINGCODE_WEBWORKER = 'onmessage=function pong(){' + calculation + 'postMessage(result);}';

// Full test code on https://github.com/optimalisatie/exec.js/blob/master/tests/webworker-vs-execjs-ping-heavy.js
```
