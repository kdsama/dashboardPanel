const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./mongoose');
var {User} = require('./user');
var {Todo} = require('./todo');
var {Message} = require('./messages');

var {authenticate} = require('./authenticate');

var app = express();
app.use(bodyParser.json());


//login request
app.post('/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    //instead of taking them out seperately , taking the params as an object
  
    User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).status(200).send(); 
      });
    }).catch((e) => {
      res.status(400).send();
    });
  });

//Just register a few members to get it working 
  app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
  
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    })
  });

//Whenever the person clicks on the button , time should be stamped

app.post('/stamp', authenticate, (req, res) => {
    var todo = new Todo({
      createdAt: req.body.timeStamp,
      _creator: req.user._id
    });
  
    todo.save().then((doc) => {
      res.status(200).send();
    }, (e) => {
      res.status(400).send(e);
    });
  });
  
// to find the timeStamps of the particular person 
app.get('/stamp/:id', authenticate, (req, res) => {
    var id = req.params.id;
  
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    Todo.find({
      _creator:id
    }).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    });
  });
app.post('/messages',authenticate,(req,res) =>{
    var id = req.params.id
    var msg = req.params.message; //In this case The Person we are sending the message to , his id his mentioned
    //as only admin can send messages
    var message = new Message({
        message: msg,
        receiver: msg
      });
    
      message.save().then((doc) => {
        res.status(200).send();
      }, (e) => {
        res.status(400).send(e);
      });
});
app.get('/messages/:id',authenticate,(req,res) =>{

    var id = req.params.id;
    
      if (!ObjectID.isValid(id)) {
        return res.status(404).send();
      }
      Message.find({
        receiver:id
      }).then((doc) => {
        if (!doc) {
          return res.status(404).send();
        }
        res.send({doc});
      }).catch((e) => {
        res.status(400).send();
      });

});

app.listen(3000, () => {
    console.log('Started at port 3000');
  });