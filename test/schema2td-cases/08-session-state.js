exports.schema = {
  $id: 'https://github.com/data-fair/lib/session-state',
  type: 'object',
  title: 'session state',
  properties: {
    user: {
      $ref: '#/definitions/user'
    },
    organization: {
      $ref: '#/definitions/organizationMembership'
    },
    account: {
      $ref: '#/definitions/account'
    },
    accountRole: {
      type: 'string'
    },
    lang: {
      type: 'string'
    },
    dark: {
      type: 'boolean'
    }
  },
  definitions: {
    organizationMembership: {
      type: 'object',
      additionalProperties: false,
      required: [
        'id',
        'name',
        'role'
      ],
      properties: {
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        role: {
          type: 'string'
        },
        department: {
          type: 'string'
        },
        departmentName: {
          type: 'string'
        },
        dflt: {
          type: 'boolean'
        }
      }
    },
    userRef: {
      type: 'object',
      additionalProperties: false,
      required: [
        'id',
        'name'
      ],
      properties: {
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      }
    },
    user: {
      type: 'object',
      additionalProperties: false,
      required: [
        'email',
        'id',
        'name',
        'organizations'
      ],
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        organizations: {
          type: 'array',
          items: {
            $ref: '#/definitions/organizationMembership'
          }
        },
        isAdmin: {
          type: 'integer',
          enum: [
            0,
            1
          ]
        },
        adminMode: {
          type: 'integer',
          enum: [
            0,
            1
          ]
        },
        asAdmin: {
          $ref: '#/definitions/userRef'
        },
        pd: {
          type: 'string',
          format: 'date'
        },
        ipa: {
          type: 'integer',
          enum: [
            0,
            1
          ]
        }
      }
    },
    account: {
      type: 'object',
      additionalProperties: false,
      required: [
        'type',
        'id',
        'name'
      ],
      properties: {
        type: {
          type: 'string'
        },
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        department: {
          type: 'string'
        },
        departmentName: {
          type: 'string'
        }
      }
    }
  }
}

exports.td = {
  definitions: {
    user: {},
    organizationMembership: {
      properties: { id: { type: 'string' }, name: { type: 'string' }, role: { type: 'string' } },
      optionalProperties: { department: { type: 'string' }, departmentName: { type: 'string' }, dflt: { type: 'boolean' } }
    },
    account: {
      properties: { type: { type: 'string' }, id: { type: 'string' }, name: { type: 'string' } },
      optionalProperties: { department: { type: 'string' }, departmentName: { type: 'string' } }
    },
    userRef: {
      properties: { id: { type: 'string' }, name: { type: 'string' } }
    }
  },
  optionalProperties: {
    user: { ref: 'user' },
    organization: { ref: 'organizationMembership' },
    account: { ref: 'account' },
    accountRole: { type: 'string' },
    lang: { type: 'string' },
    dark: { type: 'boolean' }
  },
  additionalProperties: true
}
