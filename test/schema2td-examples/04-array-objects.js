exports.schema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['foo'],
    properties: {
      foo: { type: 'string' }
    }
  }
}

exports.td = {
  elements: {
    properties: {
      foo: { type: 'string' }
    }
  }
}
