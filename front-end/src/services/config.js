const config = {
    // API 端点
    endpoints: {
        checkStudent: '/query/checkStudent',
        checkTeacher: '/query/checkTeacher',
        studentRegister: '/operator/studentRegister',
        teacherRegister: '/operator/teacherRegister',
        teacherCourses: '/query/teacherCourses',
        courseAttendance: '/query/attendance',
        studentEnrolledCourses: '/query/studentEnrolledCourses',
        createLesson: '/operator/lessonPublish',
        walletBalance: '/query/studentBalance'
    }
};

export default config; 