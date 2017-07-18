# Cancellable Javascript Code Runner  [![npm version](https://badge.fury.io/js/exec.js.svg)](http://badge.fury.io/js/exec.js)
exec.js (534 bytes) is a high performance and low latency javascript code runner that enables to isolate and abort javascript code execution, including setTimeout/setInterval, promises and Fetch requests. It supports most browsers including IE.

The code is executed in an isolated container with full access to DOM and the ability to return functions and objects without serialization, cloning or the need for transferable objects. The speed is 10x better than a WebWorker (see [tests](https://github.com/optimalisatie/exec.js/tree/master/tests)).

In some modern browsers (Chrome 55+) the code is executed in a separate thread (multithreading). (see Chrome [OOPIF](https://www.chromium.org/developers/design-documents/oop-iframes)). Chrome 55+ is used by over 50% of all internet users.

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
        .then(function(response) {
            response.text().then(function(text) {
                postMessage(text);
            });
        }).catch(function(err) {
            console.log(err.message);
        });
}, function(data) {
    console.log('fetch result', data.length);
});

// timeout in 5 seconds
setTimeout(function() {
    runner.stop(); // cancel Fetch request
},5000);
```

Fine tune the timeout to test Fetch request and/or response cancellation.

![Cancelled Fetch API Request and Response](https://raw.githubusercontent.com/optimalisatie/exec.js/master/tests/fetch-cancel.png)

### Advanced Fetch request

exec.js makes it possible to return original objects without the need for serialization, cloning or transferable objects.

```javascript
var runner = new exec(function(postMessage) {

    // fetch url on demand
    onmessage = function(url) {
        fetch(url)
            .then(postMessage)
            .catch(function(err) {
                console.log(err.message);
            });
    };
}, function(response) {

    console.info('fetch response', response);

    // response text
    response.text()
        .then(function(text) {
            console.info('fetch data', text.length);
        });

});

// fetch URL
runner.post('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js');

// another fetch request in idle container
setTimeout(function() {
    runner.post('https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js');
}, 1000);
```

### Abort / cancel code execution

To cancel code execution, use `runner.stop()`.

```javascript
var runner = new exec('setInterval(function() {console.log(123);},100);');
setTimeout(function() {
    runner.stop();
},1000);
```

### Multithreading with access to DOM

To access the DOM, use `parent.document` ([info](https://www.w3schools.com/jsref/prop_win_parent.asp)). DOM access is available in all browsers.

Multithreading (OOPIF) is enabled by default in Chrome 55+ and some earlier versions of Chrome. Information about multithreading in Firefox and other browsers is unavailable. Testing is needed. 

```javascript
var runner = new exec('setInterval(function() {var h = parent.document.createElement(\'h1\');h.innerHTML = \'test\';parent.document.body.insertBefore(h, parent.document.body.firstChild);},100);');
setTimeout(function() {
    runner.stop();
},1000);
```

### On the fly code execution

WebWorkers consist of fixed code and a communication mechanism with overhead. exec.js allows running code to be updated and communication handlers to be rewritten instantly.

```javascript
var runner = new exec('setInterval(function() {console.log("startup code")},200);', function(data) {
    console.info('response from container:', data);
});
setTimeout(function() {
    runner.exec('console.log("some other code");');
}, 100);

setTimeout(function() {

    console.log("setup/redefine message handler");
    runner.exec('onmessage=function(data){postMessage("received "+data+" in container");}');

    // test message handler
    console.log("post some data to container");
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


### Cancellable Fetch

Include `exec-fetch.js` (265 bytes) in the HTML document.

```html
<script src="exec.min.js"></script>
<script src="exec-fetch.min.js"></script>
```

The native [fetch](https://developers.google.com/web/updates/2015/03/introduction-to-fetch) method is now enhanced with a `.cancel()` method.

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

// cancel after 10ms
setTimeout(function() {
    request.cancel();
}, 10);

```
