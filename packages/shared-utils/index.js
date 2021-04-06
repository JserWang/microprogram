#!/usr/bin/env node
;['platform', 'file'].forEach((m) => {
  Object.assign(exports, require(`./src/${m}`))
})
