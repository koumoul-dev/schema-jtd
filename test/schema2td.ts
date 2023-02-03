import assert from 'assert'
import fs from 'fs'
import { schema2td } from '../src/schema2td'

interface Example {
  key: string
  skip?: boolean
  only?: boolean
  schema: any
  td?: any
  samples?: any[]
  samplesKo?: any[]
}

describe('schema2td', () => {
  it('should fail on missing or invalid schema', () => {
    assert.throws(() => schema2td({ type: 'badtype' }))
  })

  let examples = fs.readdirSync('test/schema2td-examples')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    .map((key: string) => ({ key, ...require('./schema2td-examples/' + key) } as Example))
    .filter(example => !example.skip)
  if (examples.find(e => e.only)) examples = examples.filter(e => e.only)

  for (const example of examples) {
    it('should match expected output for example ' + example.key, () => {
      const { td, validateSchema, validateTd } = schema2td(example.schema)
      if (example.td) assert.deepStrictEqual(td, example.td)
      for (const sample of example.samples ?? []) {
        validateSchema(sample)
        if (validateSchema.errors) assert.fail('sample should pass json schema validation ' + JSON.stringify(validateSchema.errors, null, 2))
        validateTd(sample)
        if (validateTd.errors) assert.fail('sample should pass JTD validation ' + JSON.stringify(validateTd.errors, null, 2))
      }
      for (const sample of example.samplesKo ?? []) {
        validateSchema(sample)
        if (!validateSchema.errors) assert.fail('sample should fail on json schema validation ' + JSON.stringify(sample))
        validateTd(sample)
        if (!validateTd.errors) assert.fail('sample should fail on JTD validation ' + JSON.stringify(sample))
      }
    })
  }
})
