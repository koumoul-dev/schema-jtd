exports.schema = {
  required: ['foo', 'bar'],
  allOf: [
    { properties: { foo: { type: 'string' } } },
    { properties: { bar: { type: 'string' } } }
  ]
}

exports.td = {
  additionalProperties: true,
  optionalProperties: {
    foo: { type: 'string' },
    bar: { type: 'string' }
  }
}
