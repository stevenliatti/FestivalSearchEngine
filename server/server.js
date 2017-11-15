const express = require('express');

const app = express();

app
.get('/', function(req, res) {
    let test = {
        "foo": 42,
        "bar": "Hello"
    }
    res.json(test);
    console.log("Hello");
})

;

app.listen(8080);
