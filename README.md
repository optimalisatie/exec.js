# Cancellable-Javascript-Code-Runner
Execute javascript code in a cancellable execution container (iframe) with low latency / high performance.

A javascript code runner that enables to cancel promises and for example Fetch requests.

# Usage

Include `exec.js`.

```html
<script src="exec.js" />
```

Execute code and return data using the `returnData()` function. You can return transferable objects such as ArrayBuffer to enable low latency / high performance transfer of large objects. ([more info](https://developers.google.com/web/updates/2011/12/Transferable-Objects-Lightning-Fast))

```javascript
// fetch request
var runner = new exec(function() {
    fetch('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js')
        .then(function(response) {
            // return text
            response.text().then(function(text) { returnData(text); });
}).then(function(data) {
    console.log('fetch data',data); // text returned from Fetch request
});
```
