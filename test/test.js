const assert = require('assert')
const fs = require('fs')
const schema2td = require('../lib/schema2td')

describe('schema2td', () => {
  it('should fail on missing or invalid schema', () => {
    assert.throws(() => schema2td())
    assert.throws(() => schema2td({ type: 'badtype' }))
  })

  let examples = fs.readdirSync('test/schema2td-examples')
    .map(key => ({ key, ...require('./schema2td-examples/' + key) }))
    .filter(example => !example.skip)
  if (examples.find(e => e.only)) examples = examples.filter(e => e.only)

  for (const example of examples) {
    it('should match expected output for example ' + example.key, () => {
      const { td, validateSchema, validateTd } = schema2td(example.schema)
      if (example.td) assert.deepStrictEqual(td, example.td)
      for (const sample of example.samples || []) {
        validateSchema(sample)
        if (validateSchema.errors) assert.fail('sample should pass json schema validation ' + JSON.stringify(validateSchema.errors, null, 2))
        validateTd(sample)
        if (validateTd.errors) assert.fail('sample should pass JTD validation ' + JSON.stringify(validateTd.errors, null, 2))
      }
      for (const i in example.samplesKo || []) {
        const sample = example.samplesKo[i]
        validateSchema(sample)
        if (!validateSchema.errors) assert.fail('sample should fail on json schema validation ' + i)
        validateTd(sample)
        if (!validateTd.errors) assert.fail('sample should fail on JTD validation ' + i)
      }
    })
  }
})
