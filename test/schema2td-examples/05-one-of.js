exports.schema = {
  oneOf: [
    { properties: { foo: { type: 'string' } } },
    { properties: { bar: { type: 'string' } } }
  ]
}

exports.td = {
  optionalProperties: {
    foo: { type: 'string' },
    bar: { type: 'string' }
  }
}
