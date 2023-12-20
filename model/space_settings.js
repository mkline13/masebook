
// ROLES
export const levelToRole = ['none', 'member', 'mod', 'admin', 'owner'];

export const roleToLevel = {};  // example: {none: 0 ...}
for (let i=0; i<levelToRole.length; i++) {
    roleToLevel[levelToRole[i]] = i;
}

// DEFAULT SETTINGS
export const defaultSpaceSettings = {
    description: '',
    visible: false,
    show_in_dir: false,
}

// DEFAULT PERMISSIONS
export const defaultSpacePermissions = {
    view_members:       roleToLevel.none,
    view_posts:         roleToLevel.none,
    create_posts:       roleToLevel.member,
    delete_posts:       roleToLevel.mod,
    view_comments:      roleToLevel.none,
    create_comments:    roleToLevel.member,
    delete_comments:    roleToLevel.mod,
}

// Freeze objects so they can't be modified during runtime
Object.freeze(levelToRole);
Object.freeze(roleToLevel);
Object.freeze(defaultSpaceSettings);
Object.freeze(defaultSpacePermissions);


// console.log(roleToLevel, defaultSpacePermissions);