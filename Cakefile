fs = require 'fs'
util = require 'util'
coffee = require 'coffee-script'
glob = require 'glob'
{spawn} = require 'child_process'

search = "**/*.coffee"
inputDir = "src"
outputDir = "lib"

task 'watch', 'Automatically recompile whenever the source changes', ->
  util.log "Watching for source changes"

  glob "#{inputDir}/#{search}", (er, files) ->
    for file in files then do (file) ->
      fs.watchFile file, (curr, prev) ->
        if +curr.mtime isnt +prev.mtime
          util.log "#{file} updated"
          invoke 'compile'

task 'compile', 'Compile the Coffeescript source to JS', ->
  glob "#{inputDir}/#{search}", (er, files) ->
    for file in files
      inCode = fs.readFileSync file, "utf8"
      outCode = coffee.compile inCode
      outFile = "#{outputDir}/" + file.substr("#{inputDir}/".length).replace 'coffee', 'js'

      fs.writeFileSync outFile, outCode

      util.log "Compile: #{file} -> #{outFile}"
