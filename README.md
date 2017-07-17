# Cancellable Javascript Code Runner
A high performance and low latency javascript code runner that enables to isolate and abort javascript code execution, including setTimeout/setInterval, promises and Fetch requests. It supports most browsers including IE.

WebWorkers have a startup latency of ~40ms and lack access to DOM which make them unsuitable for some applications. This code runner has full access to DOM and does not have a significant latency or overhead. It's 656 bytes compressed.

In some modern browsers (Chrome 55+) the code is executed in a separate thread (multithreading) without the latency disadvantage of WebWorkers and with less code. (see Chrome [OOPIF](https://www.chromium.org/developers/design-documents/oop-iframes))

The code is executed in an isolated container which may provide security advantages.

# Install

with npm:

`npm install exec.js`

with bower:

`bower install exec.js`

# Usage

Include `exec.js` in the HTML document.

```html
<script src="exec.min.js" />
```

Use `var runner = new exec(your code);` to execute javascript code in an isolated container. You can provide the code as a string or as a function. It returns an object with the methods `runner.post()` to post data to the container and `runner.stop()` that instantly aborts execution and clears memory. 

You can return data from your code using the `postMessage(data)` function. You can return transferable objects such as ArrayBuffer using `postMessage(data, [transferableList])`. ([more info](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast))

You can receive data in the container by defining `onmessage`, e.g. `onmessage=function(e) { // e.data }`.

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

### Advanced Fetch request
```javascript
var runner = new exec(function(postMessage) {

    // fetch url on demand
    onmessage = function(e) {
        var url = e.data;
        fetch(url)
            .then(function(response) {

                // return original Fetch response

                // headers
                var headers = {};
                for (key of response.headers.keys()) {
                    headers[key] = response.headers.get(key);
                }

                // return transferable arraybuffer
                // @link https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast
                response.arrayBuffer()
                    .then(function(buffer) {
                        postMessage({
                            url: url,
                            buffer: buffer,
                            headers: headers,
                            status: response.status,
                            statusText: response.statusText
                        }, [buffer]);
                    });
            }).catch(function(err) {
                console.log(err.message);
            });
    };
}, function(data) {

    // reconstruct Fetch response from arraybuffer
    var response = new Response(
        data.buffer, {
            headers: new Headers(data.headers),
            status: data.status,
            statusText: data.statusText
        }
    );
    console.info('fetch response for url', data.url, response);

    // response text
    response.text()
        .then(function(text) {
            console.info('fetch data for url', data.url, text.length);
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

To access the DOM, use `parent.document` ([info](https://www.w3schools.com/jsref/prop_win_parent.asp)). Multithreading (OOPIF) is enabled by default in Chrome 55+ and some earlier versions of Chrome. Information about Firefox and other browsers is unavailable. Testing is needed.

```javascript
var runner = new exec('setInterval(function() {var h = parent.document.createElement(\'h1\');h.innerHTML = \'test\';parent.document.body.insertBefore(h, parent.document.body.firstChild);},100);');
setTimeout(function() {
    runner.stop();
},1000);
```
