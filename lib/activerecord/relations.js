(function() {
  var relationTypes;

  relationTypes = ['hasOne', 'belongsTo', 'hasMany'];

  module.exports = {
    createRelations: function() {
      var relation, type, _i, _len, _results;

      _results = [];
      for (_i = 0, _len = relationTypes.length; _i < _len; _i++) {
        type = relationTypes[_i];
        if (this[type] == null) {
          continue;
        }
        _results.push((function() {
          var _j, _len1, _ref, _results1,
            _this = this;

          _ref = this[type]();
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            relation = _ref[_j];
            _results1.push((function(relation, type) {
              var name;

              name = relation.relationName(type === 'hasMany');
              return _this[name] = function(cb) {
                return this.getRelation(relation, cb);
              };
            })(relation, type));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }
  };

}).call(this);
