# Stupid simple inflection. This will improve in time.
exports.Inflection = class Inflection
  @pluralize: (word) ->
    return word if word.substr(-1) is "s"
    word + "s"

  @singularize: (word) ->
    return word unless word.substr(-1) is "s"
    word.slice(0, -1)
    
  @camelize: (word, uppercaseFirst = true) ->
    word = word.replace /(?:^|[-_])(\w)/g, (_, c) ->
      if c then c.toUpperCase() else ''

    unless uppercaseFirst
      return word.charAt(0).toLowerCase() + word.slice(1)

    return word

  @underscore: (word, lowerCase = false) ->
    word = word.replace /([A-Z\d]+)([A-Z][a-z])/g, (_, $1, $2) ->
      "#{$1}_#{$2}"

    word = word.replace /([a-z\d])([A-Z])/, (_, $1, $2) ->
      "#{$1}_#{$2}"

    word.replace '-', '_'
    if lowerCase then word.toLowerCase() else word

  @capitalize: (word) ->
    word.charAt(0).toUpperCase() + word.slice(1)
