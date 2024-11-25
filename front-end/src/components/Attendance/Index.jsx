import React, { useState } from 'react';
import '../../css/Attendance.css';
import { generateRandomName } from '../../utils/nameGenerator';

import { 
    getTeacherCourses, 
    getCourseAttendance, 
    getCourseEnrolledStudents,
    createLessonAttendance 
} from '../../services/api';

const Attendance = ({
    dateRange,
    setDateRange,
    handleAttendanceQuery,
    attendanceRecords,
    courseId,  
    lessonHistory
}) => {
    console.log("attendanceRecords", attendanceRecords);

    const [showDetail, setShowDetail] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [error, setError] = useState(null);

    const handleRowClick = async (record) => {
        setError(null);
        try {
            const date = new Date(record.timestamp)
                .toISOString()
                .split('T')[0];
            
            const response = await getCourseAttendance({ courseId: courseId, startDate: date});
            
            const emptyRecord = {
                courseId: courseId,
                date: date,
                students: [],
                timestamp: record.timestamp,
                verifyCode: record.verifyCode
            };

            const records = response.total === 0 ? [emptyRecord] : response.records;
            setSelectedRecord({ ...record, detailedData: records[0] });
            setShowDetail(true);
        } catch (error) {
            console.error('Failed to load attendance records:', error);
            const emptyRecord = {
                courseId: courseId,
                date: new Date(record.timestamp).toISOString().split('T')[0],
                students: [],
                timestamp: record.timestamp,
                verifyCode: record.verifyCode
            };
            setSelectedRecord({ ...record, detailedData: emptyRecord });
            setShowDetail(true);
        }
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedRecord(null);
        setError(null); // 清除错误状态
    };

    return (
        <div className="attendance-view">
            {/* 错误提示 */}
            {error && (
                <div className="error-message">
                    <div className="error-content">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                        <button className="error-close" onClick={() => setError(null)}>×</button>
                    </div>
                </div>
            )}

            {/* 主视图 */}
            {!showDetail && (
                <>
                    <div className="attendance-header">
                        <div className="date-range-picker">
                            <div className="date-input-group">
                                <label>From:</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="date-input-group">
                                <label>To:</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                            <button className="search-btn" onClick={handleAttendanceQuery}>
                                Search
                            </button>   
                        </div>
                    </div>

                    <div className="attendance-stats">
                        <div className="stat-item">
                            <h4>Total Classes</h4>
                            <span>{lessonHistory.lessons.length}</span>
                        </div>
                    </div>

                    <div className="attendance-table-container">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Verify Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessonHistory?.lessons?.map((record, index) => (
                                    <tr key={index} onClick={() => handleRowClick(record)}>
                                        <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                                        <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                        <td>{record.verifyCode}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* 详情视图 */}
            {showDetail && selectedRecord && (
                <div className="attendance-detail-view">
                    <div className="detail-header">
                        <button className="back-btn" onClick={handleCloseDetail}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>
                        <p><strong>Date:</strong> {new Date(selectedRecord.timestamp).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {new Date(selectedRecord.timestamp).toLocaleTimeString()}</p>
                        <p><strong>Verify Code:</strong> {selectedRecord.verifyCode}</p>
                    </div>
                    <div className="detail-table-container">
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Check-in Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRecord.detailedData?.students
                                    .filter(student => student.verifyCode === selectedRecord.verifyCode)
                                    .map((student, index) => (
                                        <tr key={index}>
                                            <td>{student.studentId}</td>
                                            <td>{generateRandomName()}</td>
                                            <td className="status-cell status-present">
                                                <span className="status-icon">✓</span>
                                                <span className="status-text">Present</span>
                                            </td>
                                            <td>
                                                {student.timestamp ? 
                                                    new Date(student.timestamp).toLocaleTimeString() 
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;

