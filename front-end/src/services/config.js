const config = {
    // API 端点
    baseURL: 'http://localhost:3001',
    endpoints: {
        checkStudent: '/query/checkStudent',
        checkTeacher: '/query/checkTeacher',
        studentRegister: '/operator/studentRegister',
        teacherRegister: '/operator/teacherRegister',
        teacherCourses: '/query/teacherCourses',
        courseAttendance: '/query/attendance',
        studentEnrolledCourses: '/query/studentEnrolledCourses',
        courseEnrolledStudents: '/query/courseEnrolledStudents',
        createLesson: '/operator/lessonPublish',
        walletBalance: '/query/studentBalance',
        startMining: '/miner/studentMine',
        courseLessonHistory: '/query/courseLessonHistory'
    }
};

export default config; 