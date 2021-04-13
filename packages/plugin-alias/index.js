'use strict'

const path = require('path')
const through = require('through2')
const PluginError = require('plugin-error')

const COMMENTED_PATTERN = /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/[^\n\r]*(?:[\n\r]+|$))/
const IMPORT_PATTERNS = [
  /from (["'])(.*?)\1/,
  /import\((["'])(.*?)\1\)/,
  /require\((["'])(.*?)\1\)/
]

function parseImports(fileLines, dir) {
  return fileLines
    .map((line, index) =>
      filterImports(line).map((i) => ({ path: dir, index, import: i }))
    )
    .reduce((acc, val) => acc.concat(val), [])
}

function filterImports(line) {
  if (line.match(COMMENTED_PATTERN)) {
    return []
  }

  return IMPORT_PATTERNS.map((pattern) => line.match(RegExp(pattern, 'g')))
    .reduce((acc, val) => acc.concat(val), [])
    .filter((value) => value !== null)
    .map(
      (match) =>
        IMPORT_PATTERNS.reduce(
          (matched, pattern) => matched || match.match(pattern),
          null
        )[2]
    )
}

function resolveImports(file, imports, options) {
  const { baseUrl, paths, cwd } = options
  const aliasMap = {}

  for (const alias in paths) {
    /* istanbul ignore else  */
    if (paths.hasOwnProperty(alias)) {
      let resolved = alias
      if (alias.endsWith('/*')) {
        resolved = alias.replace('/*', '/')
      }

      aliasMap[resolved] = paths[alias]
    }
  }

  const lines = [...file]
  for (const imported of imports) {
    const line = file[imported.index]

    let resolved = ''
    for (const alias in aliasMap) {
      /* istanbul ignore else  */
      if (aliasMap.hasOwnProperty(alias) && imported.import.startsWith(alias)) {
        const choices = aliasMap[alias]

        if (choices !== undefined) {
          if (choices.endsWith('/*')) {
            resolved = choices.replace('/*', '/')
          }
          resolved = imported.import.replace(alias, resolved)

          break
        }
      }
    }

    if (resolved.length < 1) {
      continue
    }

    const dirname = path.dirname(imported.path)
    let relative = path.join(path.resolve(baseUrl || './'), cwd)
    relative = path.relative(dirname, relative)
    relative = path.join(relative, resolved)
    relative = path.relative(dirname, path.join(dirname, relative))
    relative = relative.replace(/\\/g, '/')

    if (relative.length === 0 || !relative.startsWith('.')) {
      relative = './' + relative
    }

    lines[imported.index] = line.replace(imported.import, relative)
  }

  return lines
}

function plugin(paths) {
  return through.obj(function (chunk, _, cb) {
    if (chunk.isNull()) {
      return cb()
    }

    if (chunk.isStream()) {
      this.emit(
        'error',
        new PluginError('@microprogram/plugin-alias', 'Stream not support')
      )
      return cb()
    }

    if (Object.keys(paths).length === 0) {
      return cb()
    }

    const lines = chunk.contents.toString().split('\n')
    const imports = parseImports(lines, chunk.path)
    if (imports.length === 0) {
      return cb(null, chunk)
    }

    const resolved = resolveImports(lines, imports, {
      cwd: './',
      baseUrl: './',
      paths
    })
    chunk.contents = Buffer.from(resolved.join('\n'))

    cb(null, chunk)
  })
}

module.exports = plugin
