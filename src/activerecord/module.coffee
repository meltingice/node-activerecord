# Really handy snippet from:
# http://arcturo.github.com/library/coffeescript/03_classes.html
  
moduleKeywords = ['extended', 'included']

exports.Module = class Module
  @extends: (obj) ->
    for key, value of obj when key not in moduleKeywords
      @[key] = value

    obj.extended?.apply(@)
    @

  @includes: (obj) ->
    for key, value of obj when key not in moduleKeywords
      # Assign properties to the prototype
      @::[key] = value

    obj.included?.apply(@)
    @