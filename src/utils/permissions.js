/**
 * Role Definitions
 */
export const ROLES = {
    ADMIN: 'ADMIN',
    MARKETER: 'MARKETER',
    EDITOR: 'EDITOR',
    VIEWER: 'VIEWER'
};

/**
 * Permission Definitions
 */
export const PERMISSIONS = {
    // Campaign & Content
    CREATE_CAMPAIGN: 'CREATE_CAMPAIGN',
    EDIT_CONTENT: 'EDIT_CONTENT',
    DELETE_CONTENT: 'DELETE_CONTENT',

    // Approval Workflow
    SUBMIT_FOR_REVIEW: 'SUBMIT_FOR_REVIEW',
    APPROVE_CONTENT: 'APPROVE_CONTENT',
    REJECT_CONTENT: 'REJECT_CONTENT',

    // Administration
    MANAGE_TEAM: 'MANAGE_TEAM',
    MANAGE_BILLING: 'MANAGE_BILLING',
    VIEW_ANALYTICS: 'VIEW_ANALYTICS',
};

/**
 * Role Permissions Mapping
 */
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        PERMISSIONS.CREATE_CAMPAIGN,
        PERMISSIONS.EDIT_CONTENT,
        PERMISSIONS.DELETE_CONTENT,
        PERMISSIONS.SUBMIT_FOR_REVIEW,
        PERMISSIONS.APPROVE_CONTENT,
        PERMISSIONS.REJECT_CONTENT,
        PERMISSIONS.MANAGE_TEAM,
        PERMISSIONS.MANAGE_BILLING,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.MARKETER]: [
        PERMISSIONS.CREATE_CAMPAIGN,
        PERMISSIONS.EDIT_CONTENT,
        PERMISSIONS.DELETE_CONTENT,
        PERMISSIONS.SUBMIT_FOR_REVIEW,
        PERMISSIONS.APPROVE_CONTENT,
        PERMISSIONS.REJECT_CONTENT,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.EDITOR]: [
        PERMISSIONS.CREATE_CAMPAIGN,
        PERMISSIONS.EDIT_CONTENT,
        PERMISSIONS.SUBMIT_FOR_REVIEW,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.VIEWER]: [
        // Read-only access by default
        PERMISSIONS.VIEW_ANALYTICS
    ]
};

/**
 * Check if a user role has a specific permission
 * @param {string} role - The user's role (e.g., from userProfile.role)
 * @param {string} permission - The permission to check (from PERMISSIONS constant)
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
    if (!role) return false;
    const normalizedRole = role.toUpperCase();
    const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
    return permissions.includes(permission);
};

/**
 * Get a user-friendly label for the role
 * @param {string} role 
 * @returns {string}
 */
export const getRoleLabel = (role) => {
    if (!role) return 'Guest';
    return role.charAt(0) + role.slice(1).toLowerCase();
};

/**
 * Get the badge color for a role
 * @param {string} role 
 * @returns {string} Tailwind CSS classes
 */
export const getRoleBadgeColor = (role) => {
    switch (role?.toUpperCase()) {
        case ROLES.ADMIN:
            return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case ROLES.MARKETER:
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case ROLES.EDITOR:
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case ROLES.VIEWER:
            return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        default:
            return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
};
