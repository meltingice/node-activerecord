(function() {
  var Inflection;

  exports.Inflection = Inflection = (function() {

    function Inflection() {}

    Inflection.pluralize = function(word) {
      if (word.substr(-1) === "s") {
        return word;
      }
      return word + "s";
    };

    Inflection.singularize = function(word) {
      if (word.substr(-1) !== "s") {
        return word;
      }
      return word.slice(0, -1);
    };

    Inflection.camelize = function(word, uppercaseFirst) {
      if (uppercaseFirst == null) {
        uppercaseFirst = true;
      }
      word = word.replace(/(?:^|[-_])(\w)/g, function(_, c) {
        if (c) {
          return c.toUpperCase();
        } else {
          return '';
        }
      });
      if (!uppercaseFirst) {
        return word.charAt(0).toLowerCase() + word.slice(1);
      }
      return word;
    };

    Inflection.underscore = function(word, lowerCase) {
      if (lowerCase == null) {
        lowerCase = false;
      }
      word = word.replace(/([A-Z\d]+)([A-Z][a-z])/g, function(_, $1, $2) {
        return "" + $1 + "_" + $2;
      });
      word = word.replace(/([a-z\d])([A-Z])/, function(_, $1, $2) {
        return "" + $1 + "_" + $2;
      });
      word.replace('-', '_');
      if (lowerCase) {
        return word.toLowerCase();
      } else {
        return word;
      }
    };

    Inflection.capitalize = function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    };

    return Inflection;

  })();

}).call(this);
