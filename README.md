# Cancellable-Javascript-Code-Runner
Execute javascript code in a cancellable execution container (iframe) with low latency / high performance.

A javascript code runner that enables to abort execution of promises and Fetch requests.

# Usage

Include `exec.js`.

```html
<script src="exec.js" />
```

Execute code and return data using the `returnData()` function. You can return transferable objects such as ArrayBuffer to enable low latency / high performance transfer of large objects. ([more info](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast))

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
```

### Fetch response
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
```

### Abort / cancel Fetch request
```javascript
// ... example code above
runner.stop();
```
