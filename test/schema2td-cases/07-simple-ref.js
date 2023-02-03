exports.schema = {
  definitions: {
    foo: { type: 'string' }
  },
  oneOf: [
    { properties: { foo: { $ref: '#/definitions/foo' } } }
  ]
}

exports.td = {
  additionalProperties: true,
  optionalProperties: {
    foo: { type: 'string' }
  }
}
