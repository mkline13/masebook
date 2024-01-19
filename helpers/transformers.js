
function _hasChildren(obj) {
    return typeof(obj) === 'object' && Object.keys(obj).length > 0;
}

function _assignPrepend(target, src, prefix) {
    for (const k in src) {
        const newKey = prefix + '.' + k;
        target[newKey] = src[k];
    }
}

export function flatten(obj, depth=1) {
    // flattens object hierarchy and replaces keys with paths
    // note: does not deep copy, particularly arrays
    // you can specify max depth so it's safer to use for user data
    const result = {};
    for (const k in obj) {
        if (_hasChildren(obj[k]) && depth >= 0) {
            const sub = flatten(obj[k], depth-1, k);
            _assignPrepend(result, sub, k);
        }
        else {
            result[k] = obj[k];
        }
    }
    return result;
}

/*
// flatten example

const a = {
    b: {
        c: 33
    }
};

const a1 = flatten(a);
console.dir(a1)

// {
//     'b.c': 33
// }

*/

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

export function expandAndReplace(obj, replacements) {
    // the inverse of flatten BUT also replaces keys with new values specified in the replacements map
    const popReplace = arr => {
        const k = arr.pop();
        return replacements[k] ?? k;
    }

    const result = {};
    for (const k in obj) {
        const path = k.split('.').reverse();

        let prev = result;
        while (path.length > 1) {
            let k = popReplace(path);

            if (!(k in prev)) {
                prev[k] = {};
            }
            prev = prev[k];
        }
        prev[popReplace(path)] = obj[k];
    }
    return result;
}