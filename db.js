var knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'SB',
    password: '',
    database: 'SB',
    charset: 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

var createTables = knex.schema.createTable('users', function(table) {
  table.increments();
  table.string('username');
  table.string('email');
  table.string('password');
  table.timestamps();
}).createTable('links', function(table) {
  table.increments();
  table.string('link').primary();
  table.integer('user_id').references('users.id');
});


// User Model
var User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  
  links: function() {
    return this.hasMany(Link, 'user_id');
  },
  
  verifyPwd : function(pwd) {
    return this.get('password') === pwd;
  }
},{
  byEmail: function(email) {
    return this.forge().query({where: {email: email}}).fetch();
  }
});

var Link = bookshelf.Model.extend({
  tableName: 'links',
  
  user: function() {
    return this.belongsTo(User, 'user_id');
  }
});


// Users Collection
var Users = bookshelf.Collection.extend({
  model: User
});

// Users.forge().fetch()
//   .then(function(users) {
//     console.log('Got a bunch of users');
//     console.log(users);
//   });

module.exports = {
  createTables: createTables,
  User: User,
  Users: Users,
  Link: Link
};

// User.byEmail('echo3042@gmail.com')
//   .then(function(user) {
//     console.log('This is User : ', user.get('username'));
//   })
//   .catch(function(err) {
//     console.log('There is not User!');
//   });
  
  // var a = new User({
//   username: 'SB Lee',
//   email: 'echo3042@gmail.com',
//   password: 'asdf'
// });

// a.save().then(function(user) {
//   console.log(user);
// }).catch(function(err) {
//   console.log(err);
// });
