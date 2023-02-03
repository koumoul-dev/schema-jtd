exports.schema = {
  oneOf: [
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
