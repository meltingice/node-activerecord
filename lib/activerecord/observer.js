(function() {
  var Observer;

  exports.Observer = Observer = (function() {

    function Observer() {}

    Observer.prototype.afterFind = function() {
      return true;
    };

    Observer.prototype.beforeSave = function() {
      return true;
    };

    Observer.prototype.beforeCreate = function() {
      return true;
    };

    Observer.prototype.beforeUpdate = function() {
      return true;
    };

    Observer.prototype.beforeDelete = function() {
      return true;
    };

    Observer.prototype.afterSave = function() {
      return true;
    };

    Observer.prototype.afterCreate = function() {
      return true;
    };

    Observer.prototype.afterUpdate = function() {
      return true;
    };

    Observer.prototype.afterDelete = function() {
      return true;
    };

    return Observer;

  })();

}).call(this);
