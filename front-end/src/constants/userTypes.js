export const USER_TYPES = {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
};

// 定义每种用户类型的路由配置
export const USER_ROUTES = {
    [USER_TYPES.STUDENT]: [
        { path: '/checkin', icon: 'fas fa-book', label: 'Check In' },
    ],
    [USER_TYPES.TEACHER]: [
        { path: '/courses', icon: 'fas fa-chalkboard-teacher', label: 'Teaching Courses' },
        { path: '/students', icon: 'fas fa-user-graduate', label: 'Students' },
        { path: '/attandance', icon: 'fas fa-tasks', label: 'Attandance' },
    ]
};

// 定义每种用户类型的默认首页路由
export const DEFAULT_ROUTES = {
    [USER_TYPES.STUDENT]: '/checkin',
    [USER_TYPES.TEACHER]: '/students'
};
