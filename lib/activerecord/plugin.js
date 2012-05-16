(function() {
  var Plugin;

  exports.Plugin = Plugin = (function() {

    Plugin.name = 'Plugin';

    function Plugin(model) {
      this.model = model;
    }

    Plugin.prototype.isValid = function() {
      return true;
    };

    Plugin.prototype.beforeInit = function() {
      return true;
    };

    Plugin.prototype.afterInit = function() {
      return true;
    };

    Plugin.prototype.afterFind = function() {
      return true;
    };

    Plugin.prototype.beforeSave = function() {
      return true;
    };

    Plugin.prototype.afterSave = function() {
      return true;
    };

    Plugin.prototype.beforeCreate = function() {
      return true;
    };

    Plugin.prototype.afterCreate = function() {
      return true;
    };

    Plugin.prototype.beforeUpdate = function() {
      return true;
    };

    Plugin.prototype.afterUpdate = function() {
      return true;
    };

    Plugin.prototype.beforeDelete = function() {
      return true;
    };

    Plugin.prototype.afterDelete = function() {
      return true;
    };

    return Plugin;

  })();

}).call(this);
