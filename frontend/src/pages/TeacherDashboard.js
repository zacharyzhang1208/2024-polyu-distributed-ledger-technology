import React, { useState, useEffect } from 'react';
import { Card, Table, DatePicker, Select, message } from 'antd';
import { attendanceService } from '../services/attendanceService';

const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        loadTeacherCourses();
    }, []);

    // 加载教师的课程
    const loadTeacherCourses = async () => {
        try {
            const response = await attendanceService.getTeacherCourses(userInfo.id);
            setCourses(response);
        } catch (error) {
            message.error('加载课程失败：' + error.message);
        }
    };

    // 查询考勤记录
    const handleSearch = async () => {
        if (!selectedCourse || !selectedDate) {
            message.warning('请选择课程和日期');
            return;
        }

        try {
            const records = await attendanceService.getCourseAttendance(
                selectedCourse,
                selectedDate.unix()
            );
            setAttendanceData(records);
        } catch (error) {
            message.error('查询考勤记录失败：' + error.message);
        }
    };

    const columns = [
        { title: '学号', dataIndex: ['student', 'id'] },
        { title: '姓名', dataIndex: ['student', 'name'] },
        { title: '签到时间', dataIndex: 'timestamp' },
        { title: '状态', dataIndex: 'attendanceType' },
        { title: '位置', dataIndex: 'location' }
    ];

    return (
        <div className="teacher-dashboard">
            <h2>欢迎，{userInfo.name}老师</h2>

            <Card title="考勤查询">
                <div style={{ marginBottom: 16 }}>
                    <Select
                        style={{ width: 200, marginRight: 16 }}
                        placeholder="选择课程"
                        onChange={setSelectedCourse}
                    >
                        {courses.map(course => (
                            <Select.Option key={course.id} value={course.id}>
                                {course.name}
                            </Select.Option>
                        ))}
                    </Select>

                    <DatePicker
                        style={{ marginRight: 16 }}
                        onChange={setSelectedDate}
                        placeholder="选择日期"
                    />

                    <Button type="primary" onClick={handleSearch}>
                        查询
                    </Button>
                </div>

                <Table
                    dataSource={attendanceData}
                    columns={columns}
                    rowKey="id"
                />
            </Card>
        </div>
    );
};

export default TeacherDashboard; 