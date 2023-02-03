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
  definitions: {
    foo: { type: 'string' }
  },
  optionalProperties: {
    foo: { ref: 'foo' }
  }
}
