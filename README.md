# Cancellable Javascript Code Runner
Execute javascript code in a cancellable execution container (iframe) with low latency / high performance.

A high performance and low latency javascript code runner that enables to abort javascript code execution, including promises and Fetch requests. It supports most browsers including IE.

# Usage

Include `exec.js` in the HTML document.

```html
<script src="exec.min.js" />
```

Use `var runner = new exec(your code);` to execute javascript code. It returns a promise. You can return data from your code using the `returnData()` function. You can return transferable objects such as ArrayBuffer to enable low latency and high performance processing for large objects. ([more info](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast))

### Simple Fetch request
```javascript
var runner = new exec(function() {
    fetch('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js')
        .then(function(response) {
            // return text
            response.text().then(function(text) { returnData(text); });
}).then(function(data) {
    console.log('fetch data',data); // text returned from Fetch request
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
                    }, buffer);
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
var runner = new exec('setInterval(function() {console.log(123); },100);');
setTimeout(function() {
    runner.stop();
},1000);
```
