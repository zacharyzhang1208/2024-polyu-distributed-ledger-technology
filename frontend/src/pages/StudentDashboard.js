import React, { useState, useEffect } from 'react';
import { Card, Button, Table, message } from 'antd';
import { attendanceService } from '../services/attendanceService';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        loadCourses();
        loadAttendanceRecords();
    }, []);

    const loadCourses = async () => {
        try {
            const response = await attendanceService.getStudentCourses(userInfo.id);
            setCourses(response);
        } catch (error) {
            message.error('加载课程失败：' + error.message);
        }
    };

    const loadAttendanceRecords = async () => {
        try {
            const response = await attendanceService.getStudentAttendance(userInfo.id);
            setAttendanceRecords(response);
        } catch (error) {
            message.error('加载考勤记录失败：' + error.message);
        }
    };

    const handleCheckIn = async (courseId) => {
        try {
            await attendanceService.createAttendance({
                studentId: userInfo.id,
                courseId,
                location: 'classroom' // 这里可以添加实际的位置信息
            });
            message.success('签到成功！');
            loadAttendanceRecords();
        } catch (error) {
            message.error('签到失败：' + error.message);
        }
    };

    return (
        <div className="student-dashboard">
            <h2>欢迎，{userInfo.name}</h2>
            
            <Card title="今日课程">
                {courses.map(course => (
                    <Card.Grid key={course.id}>
                        <h3>{course.name}</h3>
                        <p>时间：{course.schedule.startTime} - {course.schedule.endTime}</p>
                        <Button 
                            type="primary" 
                            onClick={() => handleCheckIn(course.id)}
                        >
                            签到
                        </Button>
                    </Card.Grid>
                ))}
            </Card>

            <Card title="考勤记录" style={{ marginTop: 20 }}>
                <Table 
                    dataSource={attendanceRecords}
                    columns={[
                        { title: '课程', dataIndex: ['course', 'name'] },
                        { title: '时间', dataIndex: 'timestamp' },
                        { title: '状态', dataIndex: 'attendanceType' }
                    ]}
                />
            </Card>
        </div>
    );
};

export default StudentDashboard; 