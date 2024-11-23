import config from '../config';

const createApiRequest = async (endpoint, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(endpoint, {
        ...defaultOptions,
        ...options
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '请求失败');
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
    return createApiRequest(`${config.endpoints.teacherCourses}?teacherId=${teacherId}`);
};

export const getStudentEnrolledCourses = async (studentId) => {
    return createApiRequest(`${config.endpoints.studentEnrolledCourses}?studentId=${studentId}`);
};

export const getCourseEnrolledStudents = async (courseId) => {
    return createApiRequest(`${config.endpoints.courseEnrolledStudents}?courseId=${courseId}`);
}; 