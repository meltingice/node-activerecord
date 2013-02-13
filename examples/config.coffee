{Configuration} = require '../src'

module.exports = new Configuration
  sqlite:
    database: "#{__dirname}/test.db"
  mysql:
    host: 'localhost'
    database: 'test'
    user: 'test'
    password: 'password'
  redis:
    host: null
    port: null
  rest:
    url: 'https://api.heello.com'
    version: 1
  idGenerators:
    redis:
      host: null
      port: null
