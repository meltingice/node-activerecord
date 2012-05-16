{Plugin} = require __dirname + "/../plugin"
util = require 'util'

module.exports = class Logger extends Plugin
  beforeInit: ->
    util.log "Beginning initialization for #{@model.__proto__.constructor.name}"
    true

  afterInit: ->
    util.log "Finished initialization for #{@model.__proto__.constructor.name}"
    true

  afterFind: ->
    util.log "Found #{@model.__proto__.constructor.name} (#{@model.primaryIndex} = #{@model[@model.primaryIndex]})"
    true

  beforeSave: ->
    util.log "Preparing to save #{@model.__proto__.constructor.name} (#{@model.primaryIndex} = #{@model[@model.primaryIndex]})"
    true

  afterSave: ->
    util.log "Finished saving #{@model.__proto__.constructor.name} (#{@model.primaryIndex} = #{@model[@model.primaryIndex]})"
    true

  beforeCreate: ->
    util.log "Creating new #{@model.__proto__.constructor.name}..."
    true

  afterCreate: ->
    util.log "New #{@model.__proto__.constructor.name} created (#{@model.primaryIndex} = #{@model[@model.primaryIndex]})"
    true

  beforeUpdate: ->
    util.log "Updating #{@model.__proto__.constructor.name} (#{@model.primaryIndex} = #{@model[@model.primaryIndex]})"
    true

  afterUpdate: ->
    util.log "Updated #{@model.__proto__.constructor.name} (#{@model.primaryIndex} = #{@model[@model.primaryIndex]})"
    true

  beforeDelete: ->
    util.log "Preparing to delete #{@model.__proto__.constructor.name} (#{@model.primaryIndex} = #{@model[@model.primaryIndex]})"
    true

  afterDelete: ->
    util.log "Finished deleting #{@model.__proto__.constructor.name}"
    true