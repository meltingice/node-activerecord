(function() {
  var Model, Module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Module = require('./module').Module;

  exports.Model = Model = (function(_super) {

    __extends(Model, _super);

    Model["extends"](require('./tablenaming')["static"]);

    Model.includes(require('./tablenaming').members);

    Model["extends"](require('./querying'));

    Model.includes(require('./properties'));

    Model.includes(require('./relations'));

    Model.includes(require('./events'));

    Model.prototype.config = null;

    Model.prototype.observer = null;

    Model.prototype.fields = [];

    Model.prototype.primaryKey = 'id';

    function Model(data) {
      if (data == null) {
        data = {};
      }
      this.data = {};
      this.initData = data;
      this.dirtyKeys = {};
      this.isDirty = false;
      this["new"] = true;
      this.createProperties();
      this.createRelations();
    }

    return Model;

  })(Module);

}).call(this);
