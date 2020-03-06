const express = require('express');
const app = express();



app.use(express.static('public'));

//Setting up server and port number
const port = 3000;
const server = app.listen(port, ()=> {
    console.log('Server is running on port ' + port);
});

//TODO: new note, profile,
