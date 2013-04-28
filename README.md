# node-activerecord

[![Build Status](https://secure.travis-ci.org/meltingice/node-activerecord.png?branch=refactoring)](http://travis-ci.org/meltingice/node-activerecord)

An ORM written in Coffeescript that supports multiple database systems (SQL, NoSQL, and even REST), as well as ID generation middleware. It is fully extendable to add new database systems and plugins.

**This branch is undergoing what is basically a complete rewrite. When this is more feature complete, it will be merged with the master branch and development will continue as normal.**

## Contributing

If you want to hack on node-activerecord a bit:

1. Fork this repository
2. Create a new branch for each feature off of the `refactoring` branch.
3. Send a pull request when ready.

### Developing

First run `npm install`. Once all dependencies are installed, there is a simple Cakfile to help aid you. Use it to watch and compile the codebase while working on it. Run `cake` to see all options.

Note: if you're using `cake watch` and you add a new file/folder, you will have to restart the cake process in order to pick it up.