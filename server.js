var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
// var morgan = require('morgan');
var busboy = require('connect-busboy');
var mongoose = require('mongoose');
var config = require('./config');
// var base58 = require('./base58.js');
var jsonwebtoken = require('jsonwebtoken');
// var User = require('./models/user');  
var UserController = require('./controller/UserController.js')
var EventController = require('./controller/EventController.js')
var app = express();


var apiRoutes = express.Router();

//for reading json formatted input
app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({  extended: true  }));

//for reading multipart/form-data
app.use(busboy());


mongoose.connect(config.database,function(err){
    if(err)
        console.log(err);
    else {
        console.log('database connected');
    }
});
//Api Routes

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});


apiRoutes.post('/login', UserController.login );

apiRoutes.post('/register', UserController.signup );

  apiRoutes.use(function(req, res, next) {
    var token = req.body.token || req.params.token || req.headers['authorization'] || req.headers.token;
    if( token ) {
      jsonwebtoken.verify(token, config.secretKey, function(err, decoded) {
        if(err) {
          res.status(403).send({ success: false, message: "Failed to authenticate"});
        } else {
          req.decoded = decoded;
          console.log(decoded);
          next();
        }
      });
    } else {
      res.status(403).send({ success: false, message: "No access token provided"});
    }
  });

apiRoutes.post('/createEvent', EventController.createEvent );
apiRoutes.get('/viewEvents', EventController.viewEvents );
apiRoutes.get('/searchEvents', EventController.searchEvents );

app.use('/api', apiRoutes);
app.use(express.static('./public'));
var server = app.listen(config.port, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})