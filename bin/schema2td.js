const { Command } = require('commander')
const program = new Command()
const { writeFile } = require('fs').promises
const { resolve } = require('path')
const { version } = require('../package.json')

program
  .name('schema2td')
  .description('transform a JSON schema into a JSON Type Definition')
  .version(version)
  .option('--debug', 'activate debug logs')
  .argument('<in>', 'path of a JSON schema file')
  .argument('[out]', 'path of the JTD file to create')
  .action(async function () {
    const opts = this.opts()
    if (opts.debug) process.env.DEBUG = 'schema2td'
    const debug = require('debug')('schema2td')
    debug(`schema2td args=${JSON.stringify(this.args)}, opts=${JSON.stringify(opts)}`)
    const schema = require(resolve(this.args[0]))
    const { schema2td } = require('../dist/schema2td')
    const { td } = await schema2td(schema)
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
