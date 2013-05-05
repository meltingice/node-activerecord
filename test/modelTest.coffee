fs = require 'fs'

ActiveRecord = require __dirname + "/../src"

config = new ActiveRecord.Configuration
  mysql:
    host: 'localhost'
    database: 'node-activerecord-test'
    user: 'node-ar-test'
    password: ''
  redis:
    host: 'localhost'
    port: 6379
  idGenerators:
    redis:
      host: 'localhost'
      port: 6379
  # sqlite:
    # database: "#{__dirname}/test.db"



# Tests
genericUsersTests = ->
  describe 'User', ->
    # before (done) ->
      # sqlite3 = require('sqlite3').verbose()
      # db = new sqlite3.Database config.get('sqlite').database
      # db.serialize ->
      #   db.run "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), name VARCHAR(255))", [], done

    # after (done) ->
      # sqlite3 = require('sqlite3')
      # db = new sqlite3.Database "#{__dirname}/test.db"
      # db.serialize ->
      #   db.run "DROP TABLE users", [], ->
      #     fs.unlink "#{__dirname}/test.db", done

    describe "#new()", ->
      it "should create a new empty user", ->
        user = new User

        user.should.be.an.instanceof User
        user.should.have.property 'id', null
        user.should.have.property 'name', null
        user.should.have.property 'username', null

      it "should create a user with properties", ->
        user = new User username: 'foo', name: 'bar'

        user.should.have.property 'id', null
        user.should.have.property 'name', 'bar'
        user.should.have.property 'username', 'foo'

    describe "#set()", ->
      it "should allow updating properties", ->
        user = new User username: 'foo', name: 'bar'
        user.username = 'foofoo'
        user.name = 'barbar'

        user.should.have.property 'name', 'barbar'
        user.should.have.property 'username', 'foofoo'

      it "should allow setting undefined fields", ->
        user = new User()
        user.foo = "bar"

        user.should.have.property 'foo', 'bar'

    describe "#save()", ->
      it "should determine the correct table name", ->
        user = new User()
        user.tableName().should.equal "users"

      it "should save a user record to disk", (done) ->
        user = new User username: 'foo', name: 'bar'
        user.save done

      it "should update the primary key id", (done) ->
        user = new User username: 'foo', name: 'bar'
        user.save (err) ->
          throw "did not save" if err
          user.id.should.be.ok
          user.id.should.be.a 'number'

          done()

    # describe "#find()", ->
    #   it "should find a model given the primary ID", (done) ->
    #     # TODO: create test database
    #     # TODO: id should be in keys, problem because its primary key?
    #     User.find 39, (err, user) ->
    #       console.log user
    #       user.should.be.an.instanceof User
    #       user.id.should.equal 39
    #       done()

    #   it "should find a model given a SQL query", (done) ->
    #     User.find "SELECT * FROM users WHERE id = ?", 1, (err, user) ->
    #       user.should.be.an.instanceof User
    #       user.id.should.equal 1
    #       done()

    # describe "#findAll()", ->
    #   it "should find all models given an array of primary IDs", (done) ->
    #     User.findAll [1, 2], (err, users) ->
    #       users.should.be.an.instanceof Array
    #       users.length.should.equal 2

    #       users[0].should.be.an.instanceof User
    #       users[0].id.should.equal 1
    #       done()

    #   it "should find all models given a SQL query", (done) ->
    #     User.findAll "SELECT * FROM users", (err, users) ->
    #       users.should.be.an.instanceof Array
    #       users.length.should.be.above 0
    #       users[0].should.be.an.instanceof User
    #       done()

    # describe "#update()", ->
    #   it "should update the existing model", (done) ->
    #     User.find 1, (err, user) ->
    #       user.name = "newname"
    #       user.save (err) ->
    #         throw "did not save" if err
    #         user.id.should.equal 1
    #         user.name.should.equal "newname"

    #         # Re-fetch user
    #         User.find 1, (err, user) ->
    #           user.id.should.equal 1
    #           user.name.should.equal "newname"
    #           done()

    # describe "#delete()", ->
    #   it "should delete the model from the DB", (done) ->
    #     User.find 1, (err, user) ->
    #       user.delete (err) ->
    #         throw "did not delete" if err

    #         user.should.have.property 'id', null
    #         user.should.have.property 'name', null
    #         user.should.have.property 'username', null

    #         # Attempt to re-fetch user
    #         User.find 1, (err, user) ->
    #           user.should.be.an.instanceof User
    #           user.should.have.property 'id', null
    #           user.isLoaded().should.be.false
    #           done()


# Model definition
class User extends ActiveRecord.Model
  config: config
  fields: ['username', 'name']


describe 'Redis', ->

  User::adapter = 'redis'
  User::idGenerator = 'redis'
  genericUsersTests()

describe 'MySQL', ->
  User::adapter = 'mysql'
  genericUsersTests()