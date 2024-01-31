// UNIQUE IDENTIFIERS
const shortnameRegexPattern = /^[a-z][a-z0-9_-]{2,31}$/;
/*
 * Masebook shortnames must have the following characteristics:
 *   - must be between 3 and 32 characters long
 *   - must consist of only alphanumeric characters and underscores
 *   - must start with a lowercase letter
 */

// ROLES
const levelToRole = ['none', 'member', 'mod', 'admin', 'owner'];
Object.freeze(levelToRole);

const roleToLevel = {};  // example: {none: 0 ...}
for (let i=0; i<levelToRole.length; i++) {
    roleToLevel[levelToRole[i]] = i;
}
roleToLevel[null] = 0;
Object.freeze(roleToLevel);


// Transforming objects
function expand(obj) {
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

// Handy DOM function for getting elements by ID without using document.getElementById directly
// caches requested elements in the target obj
const elements = new Proxy({}, {
    get(target, prop) {
        if (prop in target) {
            return target[prop];
        }
        else {
            const elem = document.getElementById(prop) || document.getElementsByName(prop)[0];
            target[prop] = elem;
            return elem;
        }
    }
});

// Custom fetch functions
async function post(url, body={}) {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(body),
    }

    return await fetch(url, options);
}