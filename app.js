var express = require('express');
var session = require('express-session');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var db = require('./db.js');

var port = 3000;
var app = express();
var saltRounds = 10;




db.createTables.then(function() {
  console.log('Tables Created');
}).catch(function() {
  console.log('Some of the Tables already Exists');
});


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
  secret: '12312sdgasdf@#Rfad',
  resave: false,
  saveUninitialized: true
}));

app.get('/', function(req, res) {
  if(req.session.username) {
    return res.redirect('/welcome');
  }
  var output = `
  <h1>Landing Page</h1>
  <p>If you want to do something, <a href="/auth/login">Login!</a></p>
  `;
  res.send(output);
});

app.get('/welcome', function(req, res) {
  if(req.session.username) {
    res.send(`
    <h1>Welcome!!!! ${req.session.username}</h1>
    <p>You are successfully logged in</p>
    <a href="/auth/logout">Log out</a>
    `);
  } else {
    res.send(`
      <h1>Warning!</h1>
      <p>
      You are not Authorized!!!!!
      </p>
      <a href="/auth/login">Log in</a>
    `);
  }
});

app.get('/temp', function(req, res) {
  console.log('Session : ', req.session);
  res.send('result : ' + req.session.count);
  res.end();
})

app.get('/auth/login', function(req, res) {
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="email" placeholder="email">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output)
});

app.post('/auth/login', function(req, res){
  var email = req.body.email.toString();
  var pwd = req.body.password;
  
  db.User.byEmail(email).then(function(user) {
    if(user === undefined) {
      res.redirect('/auth/signin');
    }
    bcrypt.compare(pwd, user.get('password'), function(err, result) {
      if(result) {
        req.session.username = user.get('username');
        res.redirect('/welcome');
      } else {
        res.send('Login Failed!');
      }
    });
  }).catch(function(err) {
    console.log(err);
    res.redirect('/auth/signin');
  })
});

app.get('/auth/logout', function(req, res) {
  delete req.session.username;
  res.redirect('/');
});

app.get('/auth/signin', function(req, res) {
  var output = `
  <h1>Sign in</h1>
  <form action="/auth/signin" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="text" name="email" placeholder="email">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>  
  `;
  res.send(output);
});

app.post('/auth/signin', function(req, res) {
  var username = req.body.username;
  var email = req.body.email;
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    db.User.forge({
      username: username,
      email: email,
      password: hash
    }).save().then(function(user) {
      console.log('Sign in Completed');
      res.redirect('/auth/login');
    }).catch(function(err) {
      console.log(err);
      res.redirect('/auth/signin');
    });
  })
});



app.listen(port, function() {
  console.log('Server listening on port:: ',port );
});