const config = {
    // API 端点
    endpoints: {
        checkStudent: '/query/checkStudent',
        checkTeacher: '/query/checkTeacher',
        studentRegister: '/operator/studentRegister',
        teacherRegister: '/operator/teacherRegister',
        teacherCourses: '/query/teacherCourses',
        courseAttendance: '/query/attendance',
        courseEnrolledStudents: '/query/courseEnrolledStudents',
        createLesson: '/operator/lessonPublish',
        walletBalance: '/query/studentBalance'
    }
};

export default config; 