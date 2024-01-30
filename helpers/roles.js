
export const levelToRole = ['none', 'member', 'mod', 'admin', 'owner'];
Object.freeze(levelToRole);

export const roleToLevel = {};  // example: {none: 0 ...}
for (let i=0; i<levelToRole.length; i++) {
    roleToLevel[levelToRole[i]] = i;
}
roleToLevel[null] = 0;
Object.freeze(roleToLevel);