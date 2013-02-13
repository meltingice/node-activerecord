class ObserverError extends Error

module.exports =
  notify: (event) ->
    return true unless @observer?
    throw new ObserverError(event) if @observer[event].call(@) is false
    return true
