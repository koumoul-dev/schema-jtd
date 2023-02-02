const assert = require('assert')
const traverse = require('json-schema-traverse')
const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const AjvJtd = require('ajv/dist/jtd')

const ajv = new Ajv({ strict: false })
addFormats(ajv)
const ajvTtd = new AjvJtd()

const typeMapping = {
  number: 'float64',
  integer: 'int32',
  string: 'string',
  boolean: 'boolean'
}

const formatMapping = {
  'date-time': 'timestamp'
}

module.exports = (schema, options = {}) => {
  assert.ok(schema, 'schema is required')
  schema = JSON.parse(JSON.stringify(schema))
  let validateSchema, validateTd
  try {
    validateSchema = ajv.compile(schema)
  } catch (err) {
    throw new Error('input JSON schema is invalid', { cause: err.message })
  }
  traverse(schema, {
    cb: {
      // pre is called before the children are traversed
      pre: (fragment, pointer, rootSchema, parentPointer, parentKeyword, parentFragment, key) => {
        fragment.td = fragment.td || {}

        if (!fragment.type && fragment.properties) fragment.type = 'object'
        if (!fragment.type && fragment.items) fragment.type = 'array'

        // console.log(fragment, pointer, parentPointer, parentKeyword, parentFragment, property)
        if (fragment.type && typeMapping[fragment.type]) {
          fragment.td.type = typeMapping[fragment.type]
          if (typeMapping[fragment.type] === 'string') {
            if (fragment.enum) fragment.td.enum = fragment.enum
            if (fragment.format && formatMapping[fragment.format]) {
              fragment.td.type = formatMapping[fragment.format]
            }
          }
        } else if (fragment.type === 'array') {
          fragment.td.elements = {}
        }
      },
      // post is called after the children are traversed
      post: (fragment, pointer, rootSchema, parentPointer, parentKeyword, parentFragment, key) => {
        if (!fragment.type) throw new Error('schema has no type', { cause: fragment })
        if (parentKeyword === 'properties') {
          if (parentFragment.required && parentFragment.required.includes(key)) {
            parentFragment.td.properties = parentFragment.td.properties || {}
            parentFragment.td.properties[key] = fragment.td
          } else {
            parentFragment.td.optionalProperties = parentFragment.td.optionalProperties || {}
            parentFragment.td.optionalProperties[key] = fragment.td
          }
        }
        if (parentKeyword === 'items') {
          parentFragment.td.elements = fragment.td
        }
        if (fragment.type === 'object') {
          if (fragment.additionalProperties !== false) {
            fragment.td.additionalProperties = true
          }
        }
        if (['oneOf', 'anyOf', 'allOf'].includes(parentKeyword)) {
          if (parentFragment.type && fragment.type !== parentFragment.type) {
            throw new Error(`contradictory type in ${parentKeyword}, parent=${parentFragment.type}, item=${fragment.type}`)
          }
          parentFragment.type = fragment.type
          if (fragment.type === 'object') {
            parentFragment.td.optionalProperties = {
              ...parentFragment.td.optionalProperties,
              ...fragment.td.properties,
              ...fragment.td.optionalProperties
            }
          } else {
            parentFragment.td.type = fragment.td.type
          }
        }
      }
    }
  })
  try {
    validateTd = ajvTtd.compile(schema.td)
  } catch (err) {
    console.log(schema.td)
    throw new Error('output DTD is invalid', { cause: err.message })
  }

  return { td: schema.td, validateSchema, validateTd }
}
