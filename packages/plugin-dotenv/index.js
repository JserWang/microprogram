'use strict'

const { lookupFile } = require('@microprogram/shared-utils')
const fs = require('fs')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const through = require('through2')
const PluginError = require('plugin-error')

const cwd = process.cwd()

function loadEnv(mode) {
  const env = {}

  const envFiles = [
    /** mode local file */ `.env.${mode}.local`,
    /** mode file */ `.env.${mode}`,
    /** local file */ `.env.local`,
    /** default file */ `.env`
  ]

  // check if there are actual env variables
  // these are typically provided inline and should be prioritized
  for (const key in process.env) {
    if (env[key] === undefined) {
      env[key] = process.env[key]
    }
  }

  for (const file of envFiles) {
    const path = lookupFile(cwd, [file], true)
    if (path) {
      const parsed = dotenv.parse(fs.readFileSync(path))

      dotenvExpand({
        parsed
      })

      for (const [key, value] of Object.entries(parsed)) {
        if (env[key] === undefined) {
          env[key] = value
        }
      }
    }
  }
  return env
}

function plugin(mode) {
  const env = loadEnv(mode)

  const pattern = new RegExp(
    '\\b(' +
      Object.keys(env)
        .map((str) => {
          return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
        })
        .join('|') +
      ')\\b',
    'g'
  )

  return through.obj(function (chunk, _, cb) {
    if (chunk.isNull()) {
      return cb()
    }

    if (chunk.isStream()) {
      this.emit(
        'error',
        new PluginError('@microprogram/plugin-dotenv', 'Stream not support')
      )
      return cb()
    }

    const code = chunk.contents.toString()
    const parsedCode = code.replace(pattern, (_, match) => `${env[match]}`)

    chunk.contents = new Buffer.from(parsedCode)

    cb(null, file)
  })
}

module.exports = plugin
