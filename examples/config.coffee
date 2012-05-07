ActiveRecord = require '../lib'

module.exports = new ActiveRecord.Configuration
  sqlite:
    database: "#{__dirname}/test.db"
  mysql:
    host: 'localhost'
    database: 'test'
    user: 'test'
    password: 'password'
  rest:
    url: 'https://api.heello.com'
    version: 1
