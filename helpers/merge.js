

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