import config from './config';

const createApiRequest = async (endpoint, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    const fullUrl = `${config.baseURL}${endpoint}`;
    console.log('Requesting:', fullUrl); // 调试日志

    const response = await fetch(fullUrl, {
        ...defaultOptions,
        ...options
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

export const checkStudentRegistration = async (studentId) => {
    return createApiRequest(`${config.endpoints.checkStudent}?studentId=${studentId}`);
};

export const registerStudent = async (studentData) => {
    return createApiRequest(config.endpoints.studentRegister, {
        method: 'POST',
        body: JSON.stringify({
            studentId: studentData.username,
            password: studentData.password
        })
    });
};

export const registerTeacher = async (teacherData) => {
    return createApiRequest(config.endpoints.teacherRegister, {
        method: 'POST',
        body: JSON.stringify({
            teacherId: teacherData.username,
            password: teacherData.password
        })
    });
};

export const checkTeacherRegistration = async (teacherId) => {
    return createApiRequest(`${config.endpoints.checkTeacher}?teacherId=${teacherId}`);
};

export const getTeacherCourses = async (teacherId) => {
    try {
        console.log('Fetching courses for teacher:', teacherId); // 调试日志
        const response = await createApiRequest(`${config.endpoints.teacherCourses}?teacherId=${teacherId}`);
        console.log('API response:', response); // 调试日志
        return response;
    } catch (error) {
        console.error('Error fetching teacher courses:', error);
        throw error;
    }
};

export const getStudentEnrolledCourses = async (studentId) => {
    return createApiRequest(`${config.endpoints.studentEnrolledCourses}?studentId=${studentId}`);
};

export const getCourseEnrolledStudents = async (courseId) => {
    return createApiRequest(`${config.endpoints.courseEnrolledStudents}?courseId=${courseId}`);
};

export const getCourseAttendance = async (params) => {
    const queryParams = new URLSearchParams(params).toString();
    console.log(queryParams);
    return createApiRequest(`${config.endpoints.courseAttendance}?${queryParams}`);
};

export const createLessonAttendance = async (data) => {
    return createApiRequest(config.endpoints.createLesson, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const getUserProfile = () => {
    // return axios.get('/api/user/profile');
    return createApiRequest(config.endpoints.userProfile);
};

export const updateUserProfile = (data) => {
    return createApiRequest(config.endpoints.updateProfile, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const getWalletBalance = (studentId) => {
    return createApiRequest(`${config.endpoints.walletBalance}?studentId=${studentId}`);
};

export const getCourseLessonHistory = (courseId) => {
    return createApiRequest(`${config.endpoints.courseLessonHistory}?courseId=${courseId}`);
};

export const startMining = (studentId) => {
    console.log("start mining");
    console.log(config.endpoints.startMining);
    console.log(studentId);
    return createApiRequest(`${config.endpoints.startMining}`, {
        method: 'POST',
        body: JSON.stringify({ studentId })
    });
}; 