#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const { writeFile } = require('fs').promises
const { resolve } = require('path')
const AjvJtd = require('ajv/dist/jtd')
const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const { version } = require('../package.json')

program
  .name('schema2td')
  .description('transform a JSON schema into a JSON Type Definition')
  .version(version)
  .option('--debug', 'activate debug logs')
  .option('-a, --add <path...>', 'paths of additional schemas containing declarations')
  .argument('<in>', 'path of a JSON schema file')
  .argument('[out]', 'path of the JTD file to create')
  .action(async function () {
    const opts = this.opts()
    if (opts.debug) process.env.DEBUG = 'schema2td'
    const debug = require('debug')('schema2td')
    debug(`schema2td args=${JSON.stringify(this.args)}, opts=${JSON.stringify(opts)}`)

    const schema = require(resolve(this.args[0]))
    const ajv = new Ajv({ strict: false })
    addFormats(ajv)
    for (const add of opts.add) {
      ajv.addSchema(require(add))
    }
    const { schema2td } = require('../schema2td')
    const td = schema2td(schema, { ajv })

    const ajvTtd = new AjvJtd()
    try {
      ajvTtd.compile(td)
    } catch (err) {
      throw new Error('output DTD is invalid', { cause: { message: err.message, td: JSON.stringify(schema.td, null, 2) } })
    }

    const out = JSON.stringify(td, null, 2)
    if (this.args[1]) {
      await writeFile(this.args[1], out)
    } else {
      console.log(out)
    }
  })
  .parseAsync(process.argv)
  .then(() => process.exit())
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
