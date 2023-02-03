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

  let cases = fs.readdirSync('test/schema2td-cases')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    .map((key: string) => ({ key, ...require('./schema2td-cases/' + key) } as Example))
    .filter(example => !example.skip)

  // use the CASE env var to restrict test cases, for example:
  // CASE=01 DEBUG=schema2td npm run test
  if (process.env.CASE) {
    cases = cases.filter(c => c.key.startsWith(process.env.CASE as string))
  }

  for (const c of cases) {
    it('should match expected output for case ' + c.key, () => {
      const { td, validateSchema, validateTd } = schema2td(c.schema)
      if (c.td) assert.deepStrictEqual(td, c.td)
      for (const sample of c.samples ?? []) {
        validateSchema(sample)
        if (validateSchema.errors) assert.fail('sample should pass json schema validation ' + JSON.stringify(validateSchema.errors, null, 2))
        validateTd(sample)
        if (validateTd.errors) assert.fail('sample should pass JTD validation ' + JSON.stringify(validateTd.errors, null, 2))
      }
      for (const sample of c.samplesKo ?? []) {
        validateSchema(sample)
        if (!validateSchema.errors) assert.fail('sample should fail on json schema validation ' + JSON.stringify(sample))
        validateTd(sample)
        if (!validateTd.errors) assert.fail('sample should fail on JTD validation ' + JSON.stringify(sample))
      }
    })
  }
})
