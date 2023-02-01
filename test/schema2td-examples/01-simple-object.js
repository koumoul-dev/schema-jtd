exports.schema = {
  required: ['foo'],
  properties: {
    foo: { type: 'string' },
    bar: { type: 'integer' },
    qux: { type: 'number' },
    quux: { type: 'boolean' },
    corge: { type: 'string', format: 'date' },
    grault: { type: 'string', format: 'date-time' }
  }
}

exports.td = {
  additionalProperties: true,
  properties: { foo: { type: 'string' } },
  optionalProperties: {
    bar: { type: 'int32' },
    qux: { type: 'float64' },
    quux: { type: 'boolean' },
    corge: { type: 'string' },
    grault: { type: 'timestamp' }
  }
}

exports.samples = [
  { foo: 'hello' },
  { foo: 'hello', bar: 10, qux: 1.1, quux: true, corge: new Date().toISOString().substring(0, 10), grault: new Date().toISOString() }
]

exports.samplesKo = [
  {},
  { foo: 10 },
  { foo: 'hello', bar: 1.1 },
  { foo: 'hello', qux: 'hello' },
  { foo: 'hello', quux: 'hello' },
  { foo: 'hello', grault: 'hello' }
]
