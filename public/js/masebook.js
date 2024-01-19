// UNIQUE IDENTIFIERS
export const shortnameRegexPattern = /^[a-z][a-z0-9_-]{2,31}$/;
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


// Transforming objects
export function expand(obj) {
    // the inverse of flatten
    const result = {};
    for (const k in obj) {
        const path = k.split('.').reverse();

        let prev = result;
        while (path.length > 1) {
            const k = path.pop();

            if (!(k in prev)) {
                prev[k] = {};
            }
            prev = prev[k];
        }
        prev[path.pop()] = obj[k];
    }
    return result;
}