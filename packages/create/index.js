#!/usr/bin/env node

const { copy, emptyDir, resolveConfig } = require('@microprogram/shared-utils')
// @ts-check
const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const { prompt } = require('enquirer')
const { yellow, green, lightRed, stripColors } = require('kolorist')

const cwd = process.cwd()

const differencesJson = 'differences.json'

const TEMPLATES = [green('wechat-js'), green('wechat-ts')]

const TYPES = [yellow('page'), lightRed('component')]

const { path: configPath } = resolveConfig()

module.exports = init

async function init(template) {
  let isValidTemplate = false
  let message = 'Select a template:'

  // --template expects a value
  if (typeof template === 'string') {
    const availableTemplates = TEMPLATES.map(stripColors)
    isValidTemplate = availableTemplates.includes(template)
    message = `${template} isn't a valid template. Please choose from below:`
  }

  if (!template || !isValidTemplate) {
    /**
     * @type {{ t: string }}
     */
    const { t } = await prompt({
      type: 'select',
      name: 't',
      message,
      choices: TEMPLATES
    })
    template = stripColors(t)
  }

  const templateDir = getTemplateDir(template)

  let type = argv.p ? 'page' : 'component'
  const typePath = argv.p ? configPath.page : configPath.component
  let name = argv.p || argv.page || argv.c || argv.component
  let targetPath = argv.t || argv.target || null
  if (!name) {
    const { createType } = await prompt({
      type: 'select',
      name: 'createType',
      message: 'Select a type:',
      choices: TYPES
    })
    type = stripColors(createType)

    const { directoryName } = await prompt({
      type: 'input',
      name: 'directoryName',
      message: `${type} name:`
    })

    name = directoryName
  }

  if (!targetPath) {
    targetPath = path.join(cwd, configPath.src, typePath, name)
  } else {
    targetPath = path.join(cwd, configPath.src, targetPath, typePath, name)
  }

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true })
  } else {
    const existing = fs.readdirSync(targetPath)
    if (existing.length > 0) {
      /**
       * @type {{ yes: boolean }}
       */
      const { yes } = await prompt({
        type: 'confirm',
        name: 'yes',
        initial: 'Y',
        message:
          `Target directory ${targetPath} is not empty.\n` +
          `Remove existing files and continue?`
      })

      if (yes) {
        emptyDir(targetPath)
      } else {
        return
      }
    }
  }

  const differences = require(path.join(templateDir, differencesJson)).extname
  const files = fs.readdirSync(templateDir)

  for (const file of files.filter((f) => f !== differencesJson)) {
    const extname = path.extname(file)
    if (differences.includes(extname)) {
      copy(
        path.join(templateDir, `${type}_index${extname}`),
        path.join(targetPath, `index${extname}`)
      )
    } else {
      copy(path.join(templateDir, file), path.join(targetPath, file))
    }
  }

  console.log(`\nDone.`)
  console.log()
}

function getTemplateDir(template) {
  const platformTemplate = template.split('-')
  return path.join(
    __dirname,
    platformTemplate[0],
    `template-${platformTemplate[1]}`
  )
}
