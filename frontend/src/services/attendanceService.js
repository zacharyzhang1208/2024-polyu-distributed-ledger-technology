// 考勤服务
class AttendanceService {
    // 创建考勤记录
    async createAttendance(data) {
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to create attendance');
        }

        return response.json();
    }

    // 获取学生的考勤记录
    async getStudentAttendance(studentId) {
        const response = await fetch(`/api/attendance/student/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch attendance records');
        }

        return response.json();
    }

    // 获取课程的考勤记录
    async getCourseAttendance(courseId, date) {
        const response = await fetch(`/api/attendance/course/${courseId}?date=${date}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch course attendance');
        }

        return response.json();
    }
}

export const attendanceService = new AttendanceService(); 