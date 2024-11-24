import React, { useState } from 'react';
import { 
    getCourseAttendance,

} from '../../services/api';
import '../../css/EnrolledStudents.css';

const EnrolledStudents = ({
    enrolledStudents,
    selectedCourse,
}) => {
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedStudentName,setSelectedStudentName] = useState("");
    const [selectedStudentStatus,setSelectedStudentStatus] = useState("");

    
    const handleRowClick = async (record) => {
        try {
            // 获取该学生在当前课程的所有考勤记录
            const response = await getCourseAttendance({
                courseId: selectedCourse.courseId,
                studentId: record.studentId
            });

            // 按时间排序
            const sortedRecords = response.records.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            setSelectedRecord(sortedRecords);
            setSelectedStudentId(record.studentId);
            setSelectedStudentName(record.name);
            setSelectedStudentStatus(record.status);
            setShowDetail(true);

        } catch (error) {
            console.error('Failed to fetch student attendance records:', error);
        }
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedRecord(null);
    };

    return (
        <div className="enrolled-students-view">
            {/* main view */}
            {!showDetail && (
                <>
                    <div className="enrolled-stats">
                        <div className="stat-item">
                            <h4>Total Enrolled</h4>
                            <span>{enrolledStudents.length}</span>
                        </div>
                        <div className="stat-item">
                            <h4>Available Seats</h4>
                            <span>{selectedCourse.capacity - enrolledStudents.length}</span>
                        </div>
                        <div className="stat-item">
                            <h4>Enrollment Rate</h4>
                            <span>{Math.round((enrolledStudents.length / selectedCourse.capacity) * 100)}%</span>
                        </div>
                    </div>
                    <div className="enrolled-table-container">
                        <table className="enrolled-table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Enrollment Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map((student, index) => (
                                    <tr 
                                        key={index}
                                        onClick={() => handleRowClick(student)}
                                        className="clickable-row"
                                    >
                                        <td>{student.studentId}</td>
                                        <td>{student.name}</td>
                                        <td>{student.enrollmentDate}</td>
                                        <td>
                                            <span className="status-active">{student.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            

            {/* 添加学生考勤详情模态框 */}
            {showDetail && selectedRecord && (
                <div className="student-detail-modal" onClick={e => e.stopPropagation()}>
                    <div className="detail-header">
                        <button className="back-btn" onClick={handleCloseDetail}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>
                        <p><strong>Student ID:</strong> {selectedStudentId}</p>
                        <p><strong>Name:</strong> {selectedStudentName}</p>
                        <p><strong>Status:</strong> {selectedStudentStatus}</p>
                    </div>
                    <div className="detail-table-container">
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Check-in Time</th>
                                    <th>Verify Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRecord.map((record, index) => (
                                    <tr key={index}>
                                    <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                                    <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                        <td>
                                            <span className={`status-badge ${record.status?.toLowerCase()}`}>
                                                {record.status || 'Absent'}
                                            </span>
                                        </td>
                                        <td>{record.checkInTime || '-'}</td>
                                        <td>{record.verifyCode}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnrolledStudents; 