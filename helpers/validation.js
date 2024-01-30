import Ajv from 'ajv';
import addKeywords from 'ajv-keywords';
import addFormats from 'ajv-formats';

const ajv = new Ajv({coerceTypes: true});

addKeywords(ajv, 'transform');
addFormats(ajv, ['email']);

// SCHEMAS
const shortnameSchema = {type: 'string', minLength: 3, maxLength: 32, pattern: '^[a-z][a-z0-9_-]{2,31}$'};

const permissionSchema = {type: 'integer', minimum: 0, maximum: 4};

const newSpaceFormSchema = {
    type: 'object',
    properties: {
        shortname: shortnameSchema,
        settings: {
            type: 'object',
            properties: {
                title: {type: 'string', minLength: 1, maxLength: 64, transform: ['trim']},
                description: {type: 'string', maxLength: 256, transform: ['trim']},
                public: {type: 'boolean'},
                show_in_dir: {type: 'boolean'}
            },
            required: ['title'],
            additionalProperties: false
        },
        permissions: {
            type: 'object',
            properties: {
                view_members: permissionSchema,
                view_posts: permissionSchema,
                create_posts: permissionSchema,
                delete_posts: permissionSchema,
                view_comments: permissionSchema,
                create_comments: permissionSchema,
                delete_comments: permissionSchema
            },
            required: ['view_members', 'view_posts', 'create_posts', 'delete_posts', 'view_comments', 'create_comments', 'delete_comments'],
            additionalProperties: false
        }
    },
    required: ['shortname', 'settings', 'permissions'],
    additionalProperties: false
}

const loginFormSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            minLength: 8,
            maxLength: 64
        }
    },
    required: ['email', 'password']
}

// VALIDATORS
export const validateNewSpaceForm = ajv.compile(newSpaceFormSchema);
export const validateShortname = ajv.compile(shortnameSchema);
export const validateLoginForm = ajv.compile(loginFormSchema);