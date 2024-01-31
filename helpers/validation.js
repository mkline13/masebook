import Ajv from 'ajv';
import addKeywords from 'ajv-keywords';
import addFormats from 'ajv-formats';

const ajv = new Ajv({coerceTypes: true});

addKeywords(ajv, 'transform');
addFormats(ajv, ['email', 'password']);

// FUNCTIONS
// TODO: use in schema
function isStrongPassword(string) {
    return  /[a-z]/.test(string) &&
            /[A-Z]/.test(string) &&
            /[0-9]/.test(string) &&
            /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(string);
}

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


const passwordSchema = {
    type: 'string',
    minLength: 4,  // TODO: make minLength at least 8 before release
    maxLength: 64
}

const loginFormSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email'
        },
        password: passwordSchema,
    },
    required: ['email', 'password']
}

const postTextSchema = {
    type: 'string',
    minLength: 1,
    maxLength: 512,
    transform: ['trim']
}

// VALIDATORS
export const validateNewSpaceForm = ajv.compile(newSpaceFormSchema);
export const validateShortname = ajv.compile(shortnameSchema);
export const validatePassword = ajv.compile(passwordSchema);
export const validateLoginForm = ajv.compile(loginFormSchema);
export const validatePostText = ajv.compile(postTextSchema);