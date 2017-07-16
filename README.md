# Cancellable Javascript Code Runner
A high performance and low latency javascript code runner that enables to isolate and abort javascript code execution, including setTimeout/setInterval, promises and Fetch requests. It supports most browsers including IE.

WebWorkers have a startup latency of ~40ms which make them unsuitable for some applications. This code runner does not have a significant latency or overhead and it's 690 bytes compressed.

In some modern browsers the code may be executed in a separate thread (multithreading) without the latency disadvantage of WebWorkers and with less code. (see Chrome [OOPIF](https://www.chromium.org/developers/design-documents/oop-iframes))

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

Use `var runner = new exec(your code);` to execute javascript code in an isolated container. You can provide the code as a string or as a function. It returns a promise with the extra method `runner.stop()` that instantly aborts execution and clears memory related to the code (the container is destroyed). 

You can return data from your code using the `returnData(data)` function. You can return transferable objects such as ArrayBuffer using `returnData(data, [transferableList])`. ([more info](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast))

### Simple Fetch request
```javascript
var runner = new exec(function() {
    fetch('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js')
        .then(function(response) {
            response.text().then(function(text) {
                returnData(text);
            });
        }).catch(function(err) {
            console.log(err.message);
        });
}).then(function(data) {
    console.log('fetch result', data);
});

// timeout in 5 seconds
setTimeout(function() {
    runner.stop(); // cancel Fetch request
},5000);
```

### Advanced Fetch request
```javascript
var runner = new exec(function() {
    fetch('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js')
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
                    returnData({
                        buffer: buffer,
                        headers: headers,
                        status: response.status,
                        statusText: response.statusText
                    }, [buffer]);
                });
        }).catch(function(err) {
            console.log(err.message);
        });
}).then(function(data) {

    // reconstruct Fetch response from arraybuffer
    var response = new Response(
        data.buffer, {
            headers: new Headers(data.headers),
            status: data.status,
            statusText: data.statusText
        }
    );
    console.info('fetch response', response);

    // response text
    response.text()
        .then(function(text) {
            console.info('fetch data', text.length);
        });

});

// timeout in 5 seconds
setTimeout(function() {
    runner.stop(); // cancel Fetch request
},5000);
```

### Abort / cancel code execution

To cancel code execution, use `runner.stop()`.

```javascript
var runner = new exec('setInterval(function() {console.log(123);},100);');
setTimeout(function() {
    runner.stop();
},1000);
```

## Internet Explorer

For IE a [Promise polyfill](https://github.com/taylorhakes/promise-polyfill) is required. The code could be modified to use a callback instead of a promise.
