import assert from 'assert/strict'
import traverse from 'json-schema-traverse'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import equal from 'fast-deep-equal'
import rfdc from 'rfdc'
import Debug from 'debug'
import { type SchemaEnv } from 'ajv/dist/compile'

const clone = rfdc()

const debug = Debug('schema2td')

const typeMapping: Record<string, string> = {
  number: 'float64',
  integer: 'int32',
  string: 'string',
  boolean: 'boolean'
}

const formatMapping: Record<string, string> = {
  'date-time': 'timestamp'
}

interface Schema2TdOptions {
  ajv?: Ajv
}

// TODO: implement reference resolving similar to this : https://github.com/ajv-validator/ajv/blob/b3e0cb17d0e095b5c883042b2306571be5ec86b7/lib/compile/index.ts#L296
// use ajv as a store for the external schemas

const schema2tdRecurse = (schema: any, baseUri: string, ajv: Ajv): void => {
  assert.ok(schema, 'schema is required')
  const uriResolver = ajv.opts.uriResolver

  traverse(schema, {
    cb: {
      // pre is called before the children are traversed
      pre: (fragment, pointer, rootSchema, parentPointer, parentKeyword, parentFragment, key) => {
        fragment.td = fragment.td || {}
        if (fragment.$ref) {
          const fullRef = uriResolver.resolve(baseUri, fragment.$ref)

          // TODO switch baseUri here when referencing another schema
          const refSchemaEnv = ajv.refs[baseUri] as SchemaEnv
          const refFragment = refSchemaEnv.refs[fullRef] as any
          debug(`resolve ref, ref=${fragment.$ref}, baseUri=${baseUri}`)
          if (!refFragment) throw new Error(`failed to resolve ref=${fragment.$ref}`)
          if (!refFragment.td) schema2tdRecurse(refFragment, baseUri, ajv)
          const parsedRef = uriResolver.parse(fullRef)
          if (parsedRef.fragment?.startsWith('/definitions/') && !parsedRef.fragment.replace('/definitions/', '').includes('/')) {
            const definitionName = parsedRef.fragment.replace('/definitions/', '')
            rootSchema.td.definitions = rootSchema.td.definitions ?? {}
            if (rootSchema.td.definitions[definitionName] && !equal(rootSchema.td.definitions[definitionName], fragment.td)) {
              throw new Error(`conflictual definitions for name ${definitionName}`, { cause: [rootSchema.td.definitions[definitionName], fragment.td] })
            }
            debug(`store ref result in a definition ${definitionName}`, fragment.td)
            rootSchema.td.definitions[definitionName] = refFragment.td
            fragment.td = { ref: definitionName }
          } else {
            fragment.td = refFragment.td
            fragment.type = refFragment.type
          }
        }

        if (!fragment.type && fragment.properties) fragment.type = 'object'
        if (!fragment.type && fragment.items) fragment.type = 'array'

        // console.log(fragment, pointer, parentPointer, parentKeyword, parentFragment, property)
        if (typeof fragment.type === 'string' && typeMapping[fragment.type]) {
          fragment.td = { type: typeMapping[fragment.type] }
          if (typeMapping[fragment.type] === 'string') {
            if (fragment.enum) fragment.td = { enum: fragment.enum }
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
        if (!fragment.td) throw new Error(`schema fragment as no typedef ${pointer}`)
        if (fragment.type === 'object') {
          if (fragment.additionalProperties !== false) {
            fragment.td.additionalProperties = true
          }
        }

        if (!parentFragment || !parentKeyword) return
        if (parentKeyword === 'properties' && key) {
          if (parentFragment.required?.includes(key)) {
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

        if (['oneOf', 'anyOf', 'allOf'].includes(parentKeyword)) {
          if (fragment.type && parentFragment.type && fragment.type !== parentFragment.type) {
            throw new Error(`contradictory type in ${parentKeyword}, parent=${parentFragment.type}, item=${fragment.type}`)
          }
          if (fragment.type) {
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
    }
  })
}

export const schema2td = (schema: any, options: Schema2TdOptions = {}): any => {
  schema = clone(schema) as traverse.SchemaObject
  let ajv = options.ajv
  if (!ajv) {
    ajv = new Ajv({ strict: false })
    addFormats(ajv)
  }

  const baseUri = schema.$id || 'https://schema-jtd/anonymous-schema'

  try {
    // load schema into ajv under baseUri so that we can use ajv refs cache
    ajv.addSchema(schema, baseUri)
    ajv.getSchema(baseUri)
  } catch (err) {
    throw new Error('input JSON schema is invalid', { cause: (err as Error).message })
  }

  schema2tdRecurse(schema, baseUri, ajv)

  if (!schema.$id) ajv.removeSchema('https://schema-jtd/anonymous-schema')

  return schema.td
}
