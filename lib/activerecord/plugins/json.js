(function() {
  var Plugin, json,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Plugin = require(__dirname + "/../plugin").Plugin;

  module.exports = json = (function(_super) {

    __extends(json, _super);

    json.name = 'json';

    function json() {
      return json.__super__.constructor.apply(this, arguments);
    }

    json.prototype.toJSON = function(incRelations, cb) {
      var assocName, association, field, pretty, queryWait, type, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (incRelations == null) {
        incRelations = false;
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!this.isLoaded()) {
        return {};
      }
      pretty = {};
      _ref = this.fields;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        if (this.fieldsProtected != null) {
          if (__indexOf.call(this.fieldsProtected, field) >= 0) {
            continue;
          }
        }
        pretty[field] = this[field];
      }
      if (incRelations) {
        queryWait = {};
        _ref1 = ['hasOne', 'belongsTo', 'hasMany'];
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          type = _ref1[_j];
          _results.push((function() {
            var _k, _len2, _ref2, _results1,
              _this = this;
            _ref2 = this[type]();
            _results1 = [];
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              association = _ref2[_k];
              if (Array.isArray(association)) {
                association = association[0];
              }
              assocName = association.toAssociationName(type === 'hasMany');
              queryWait[assocName] = true;
              _results1.push((function(type, assocName) {
                return _this[assocName](function(err, assoc) {
                  var key, m, val, _l, _len3;
                  queryWait[assocName] = false;
                  if (err) {
                    return;
                  }
                  if (type === 'hasMany') {
                    pretty[assocName] = [];
                    for (_l = 0, _len3 = assoc.length; _l < _len3; _l++) {
                      m = assoc[_l];
                      pretty[assocName].push(m.toJSON());
                    }
                  } else {
                    pretty[assocName] = assoc.toJSON();
                  }
                  for (key in queryWait) {
                    if (!__hasProp.call(queryWait, key)) continue;
                    val = queryWait[key];
                    if (val === true) {
                      return;
                    }
                  }
                  return cb(pretty);
                });
              })(type, assocName));
            }
            return _results1;
          }).call(this));
        }
        return _results;
      } else {
        return pretty;
      }
    };

    return json;

  })(Plugin);

}).call(this);
