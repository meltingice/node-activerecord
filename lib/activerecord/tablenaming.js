(function() {
  var Inflection;

  Inflection = require('./support/inflection').Inflection;

  exports["static"] = {
    tableName: function() {
      return this.toTableName(this.name);
    },
    toTableName: function(name) {
      return Inflection.pluralize(Inflection.underscore(name, true));
    },
    relationName: function(plural) {
      var name;

      if (plural == null) {
        plural = false;
      }
      name = Inflection.camelize(this.tableName(), false);
      if (plural) {
        return Inflection.pluralize(name);
      } else {
        return name;
      }
    }
  };

  exports.members = {
    tableName: function() {
      return this.constructor.tableName();
    }
  };

}).call(this);
