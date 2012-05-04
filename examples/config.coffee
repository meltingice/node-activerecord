ActiveRecord = require '../src'

module.exports = new ActiveRecord.Configuration
  sqlite:
    database: ':memory:'
  mysql:
    host: 'localhost'
    database: 'test'
    user: 'test'
    password: 'password'