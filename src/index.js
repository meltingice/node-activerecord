require('coffee-script');

module.exports = {
  Configuration: require(__dirname + "/activerecord/configuration").Configuration,
  Model: require(__dirname + "/activerecord/model").Model,
  Observer: require(__dirname + "/activerecord/observer").Observer
};