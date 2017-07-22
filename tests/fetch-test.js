// normal fetch request
var request = fetch('https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js')
    .then(function(response) {
        response.text().then(function(text) {
            console.log('response', text.length);
        });
    }).catch(function(err) {
        console.log('err', err.message);
    });

// abort request after 1s
setTimeout(function() {
    request.abort();
}, 1000);