var mysql = require('../lib/mysql')
  , crypto = require('crypto')

var CLIENT = mysql.client;

var BASE_FIND_QUERY
  = "SELECT "
  + "  u.id AS user_id, "
	+ "  u.email, "
	+ "  u.passwd, "
	+ "  u.last_login, "
	+ "  u.active, "
	+ "  c.id AS collection_id, "
	+ "  c.name, "
	+ "  c.obfurl, "
	+ "  c.discoverable, "
	+ "  b.id AS badge_id, "
	+ "  b.badge_ref "
  + "FROM user AS u "
  + "LEFT JOIN collection AS c "
  + "ON c.user_id = u.id "
  + "LEFT JOIN collection_badge AS b "
  + "ON b.collection_id = c.id "

var User = {}
User.newUser = function (data, callback) {
  sqlinsert('user', data, callback);
}

User.newCollection = function (data, callback) {
  sqlinsert('collection', data, callback);
}
module.exports = User;

var sqlinsert = function (table, data, callback) {
  var values = Object.values(data);
  var queryString
    = 'INSERT INTO `' + table + '` '
    + fields(data)
    + ' VALUES '
    + placeholders(values);
  
  CLIENT.query(queryString, values, function (err, result) {
    if (err) return callback(err);
    CLIENT.query('SELECT * FROM `' + table + '` WHERE id = ?', [result.insertId], function (err, results) {
      if (err) return callback(err);
      callback(null, results.pop());
    })
  });
}

var generateUniqueUrl = function (userdata, name) {
  var sum = crypto.createHash('sha1');
  sum.update((new Date).toISOString() + userdata.email + name)
  return sum.digest('hex');
}
var placeholders = function (values) {
  return arrToSql(values.map(function () { return '?'}));
}
var fields = function (data) {
  return arrToSql(Object.keys(data));
}
var arrToSql = function (arr) {
  return ' (' + arr.join(', ') + ') ';
}
Object.values = function (obj) {
  return Object.keys(obj).map(function (k) {return obj[k]});
}