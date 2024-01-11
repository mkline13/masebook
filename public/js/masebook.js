// UNIQUE IDENTIFIERS
export const shortnameRegexPattern = /^[a-z][a-z0-9_]{2,31}$/;
/*
 * Masebook shortnames must have the following characteristics:
 *   - must be between 3 and 32 characters long
 *   - must consist of only alphanumeric characters and underscores
 *   - must start with a lowercase letter
 */

// ROLES
export const levelToRole = ['none', 'member', 'mod', 'admin', 'owner'];
Object.freeze(levelToRole);

export const roleToLevel = {};  // example: {none: 0 ...}
for (let i=0; i<levelToRole.length; i++) {
    roleToLevel[levelToRole[i]] = i;
}
roleToLevel[null] = 0;
Object.freeze(roleToLevel);

// TODO: this probably shouldn't be public
// FORMATTING SPACE OBJECTS
export function foldSpace(data) {
    // makes copy of flat Space (as stored in database or provided by web form) and folds settings and permissions into their own namespaces
    const space = {
        settings: {},
        permissions: {}
    }

    for (const [k,v] of Object.entries(data)) {
        if (k.startsWith('s_')) {
            space.settings[k.substring(2)] = v;
        }
        else if (k.startsWith('p_')) {
            space.permissions[k.substring(2)] = v;
        }
        else {
            space[k] = v;
        }
    }

    return space;
}

export function flattenSpace(space) {
    // makes copy of space with all members flattened to one level deep

    const flattened = {};

    for (const [k,v] of Object.entries(space)) {
        flattened[k] = v;
    }

    const settings = flattened.settings;
    delete flattened.settings;

    const permissions = flattened.permissions;
    delete flattened.permissions;

    for (const [k,v] of Object.entries(settings)) {
        flattened['s_' + k] = v;
    }

    for (const [k,v] of Object.entries(permissions)) {
        flattened['p_' + k] = v;
    }

    return flattened;
}

// FORMATTING USER OBJECTS
export function foldUser(data) {
    // makes copy of flat Space (as stored in database or provided by web form) and folds settings and permissions into their own namespaces
    const user = {
        settings: {}
    }

    for (const [k,v] of Object.entries(data)) {
        if (k.startsWith('s_')) {
            user.settings[k.substring(2)] = v;
        }
        else {
            user[k] = v;
        }
    }

    return user;
}