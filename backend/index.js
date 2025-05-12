const express = require("express");
const app = express();

app.get("/", function(req, res) {
    return res.send("Hello World e3eee");
});

app.listen(3000, function(){
    console.log('Listening on port 3000');
});