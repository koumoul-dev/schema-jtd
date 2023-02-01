exports.schema = {
  required: ['foo'],
  additionalProperties: false,
  properties: {
    foo: {
      type: 'object',
      required: ['bar'],
      properties: {
        bar: { type: 'string' },
        qux: { type: 'integer' }
      }
    }
  }
}

exports.td = {
  properties: {
    foo: {
      additionalProperties: true,
      properties: { bar: { type: 'string' } },
      optionalProperties: { qux: { type: 'int32' } }
    }
  }
}
