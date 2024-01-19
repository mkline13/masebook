import { shortnameRegexPattern } from '../public/js/masebook.js';
import Ajv from 'ajv';
import ajvkeywords from 'ajv-keywords';

const ajv = new Ajv({coerceTypes: true});

// allow the use of the 'transform' keyword in schemas
ajvkeywords(ajv, 'transform');

// SCHEMAS
const shortnameSchema = {type: 'string', minLength: 3, maxLength: 32, pattern: shortnameRegexPattern.toString().slice(1,-1)};
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

// VALIDATORS
export const validateNewSpaceForm = ajv.compile(newSpaceFormSchema);
export const validateShortname = ajv.compile(shortnameSchema);