# schema-jtd
JSON Schema and JSON Type Definition transformation utilities (contains the schema2td and td2schema commands).

## Why

  - need help migrating from one format to another ?
  - need to make a tool written for one format work with the other at low cost ?
  - need create an Open API documentation from your JTDs ?
  - need to create code bindings from your schemas ?

## JTD or JSON Schema ?

![](doc/both-the-road-to-el-dorado.gif)

Don't be too fast in chosing one and rejecting the other. JSON schema is good for a self documented API that makes many of its validation rules explicit, JTD is great for non-ambiguous types and generating code bindings.

A possible sequence that includes both:

  1. write an API specification including self documented JSON schemas
  2. use `schema2td` to produce JTD equivalents
  3. use `jtd-codegen` to produce code bindings
  4. use JTD for fast parsing and serializing at both ends of your API endpoints
  5. use a JSON Schema validator to validate the payload with extra rules ignored by JTD

## Limitations

  - `schema2td` will reject schemas with ambiguous typing (for example a oneOf with different types)
    - this might be resolved in the future using a vocabulary to resolve ambiguous typing (for example by flagging a oneOf to be ignored)
  - `td2schema` will be missing some semantics
    - this is partially compoensated by mapping some JTD metadata to JSON Schema attributes

