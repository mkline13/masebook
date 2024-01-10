// UNIQUE IDENTIFIERS
export const uniqueIdentifierRegexPattern = /^[a-z][a-z0-9_]{2,31}$/;
/*
 * Masebook unique identifiers must have the following characteristics:
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
Object.freeze(roleToLevel);

// SPACE DEFAULTS
export const defaultSpaceSettings = {
    description: '',
    visible: false,
    show_in_dir: false,
}
Object.freeze(defaultSpaceSettings);

export const defaultSpacePermissions = {
    view_members:       roleToLevel.none,
    view_posts:         roleToLevel.none,
    create_posts:       roleToLevel.member,
    delete_posts:       roleToLevel.mod,
    view_comments:      roleToLevel.none,
    create_comments:    roleToLevel.member,
    delete_comments:    roleToLevel.mod,
}
Object.freeze(defaultSpacePermissions);

// USER SETTINGS
export const defaultUserSettings = {
    display_name: '',
    description: '',
    show_in_dir: false
}
Object.freeze(defaultUserSettings);

// MERGING SETTINGS/PERMISSIONS OBJECTS
export function mergeFull (defaults, obj) {
    // similar to 'Object.assign(defaults, obj);
    // merges two objects, ignoring keys that are not found in the 'defaults' object
    // only shallow-copies, references in the new object may be the same as in the old ones
    const result = {};
    for (const k in defaults) {
        result[k] = obj[k] ?? defaults[k];
    }
    return result;
}

export function mergeExludeDefaults (defaults, obj) {
    // similar to mergeFull but discards values that are the same as the defaults
    const result = {};
    for (const k in defaults) {
        if (obj[k] && obj[k] != defaults[k]) {
            result[k] = obj[k];
        }
    }
    return result;
}