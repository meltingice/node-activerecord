(function() {
  var Logger, Plugin, util,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Plugin = require(__dirname + "/../plugin").Plugin;

  util = require('util');

  module.exports = Logger = (function(_super) {

    __extends(Logger, _super);

    Logger.name = 'Logger';

    function Logger() {
      return Logger.__super__.constructor.apply(this, arguments);
    }

    Logger.prototype.beforeInit = function() {
      util.log("Beginning initialization for " + this.model.__proto__.constructor.name);
      return true;
    };

    Logger.prototype.afterInit = function() {
      util.log("Finished initialization for " + this.model.__proto__.constructor.name);
      return true;
    };

    Logger.prototype.afterFind = function() {
      util.log("Found " + this.model.__proto__.constructor.name + " (" + this.model.primaryIndex + " = " + this.model[this.model.primaryIndex] + ")");
      return true;
    };

    Logger.prototype.beforeSave = function() {
      util.log("Preparing to save " + this.model.__proto__.constructor.name + " (" + this.model.primaryIndex + " = " + this.model[this.model.primaryIndex] + ")");
      return true;
    };

    Logger.prototype.afterSave = function() {
      util.log("Finished saving " + this.model.__proto__.constructor.name + " (" + this.model.primaryIndex + " = " + this.model[this.model.primaryIndex] + ")");
      return true;
    };

    Logger.prototype.beforeCreate = function() {
      util.log("Creating new " + this.model.__proto__.constructor.name + "...");
      return true;
    };

    Logger.prototype.afterCreate = function() {
      util.log("New " + this.model.__proto__.constructor.name + " created (" + this.model.primaryIndex + " = " + this.model[this.model.primaryIndex] + ")");
      return true;
    };

    Logger.prototype.beforeUpdate = function() {
      util.log("Updating " + this.model.__proto__.constructor.name + " (" + this.model.primaryIndex + " = " + this.model[this.model.primaryIndex] + ")");
      return true;
    };

    Logger.prototype.afterUpdate = function() {
      util.log("Updated " + this.model.__proto__.constructor.name + " (" + this.model.primaryIndex + " = " + this.model[this.model.primaryIndex] + ")");
      return true;
    };

    Logger.prototype.beforeDelete = function() {
      util.log("Preparing to delete " + this.model.__proto__.constructor.name + " (" + this.model.primaryIndex + " = " + this.model[this.model.primaryIndex] + ")");
      return true;
    };

    Logger.prototype.afterDelete = function() {
      util.log("Finished deleting " + this.model.__proto__.constructor.name);
      return true;
    };

    return Logger;

  })(Plugin);

}).call(this);
