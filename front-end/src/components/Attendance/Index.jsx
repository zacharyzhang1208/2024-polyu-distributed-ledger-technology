import React, { useState } from 'react';
import '../../css/Attendance.css';

const Attendance = ({
    dateRange,
    setDateRange,
    handleAttendanceQuery,
    attendanceRecords,
    enrolledStudents
}) => {
    const [showDetail, setShowDetail] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleRowClick = (record) => {
        setSelectedRecord(record);
        setShowDetail(true);
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedRecord(null);
    };

    return (
        <div className="attendance-view">
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
                            <span>{attendanceRecords.length}</span>
                        </div>
                        <div className="stat-item">
                            <h4>Total Students</h4>
                            <span>{enrolledStudents.length}</span>
                        </div>
                        <div className="stat-item">
                            <h4>Average Attendance</h4>
                            <span>
                                {attendanceRecords.length > 0
                                    ? Math.round(
                                        attendanceRecords.reduce((acc, curr) => 
                                            acc + (curr.present / enrolledStudents.length) * 100, 0
                                        ) / attendanceRecords.length
                                    )
                                    : 0}%
                            </span>
                        </div>
                    </div>

                    <div className="attendance-table-container">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Attendance Rate</th>
                                    <th>Verify Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map((record, index) => (
                                    <tr 
                                        key={index}
                                        onClick={() => handleRowClick(record)}
                                        className="clickable-row"
                                    >
                                        <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                                        <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                        <td>{record.present || 0}</td>
                                        <td>{enrolledStudents.length - (record.present || 0)}</td>
                                        <td>{Math.round((record.present || 0) / enrolledStudents.length * 100)}%</td>
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
                                {enrolledStudents.map((student, index) => {
                                    const isPresent = selectedRecord.studentIds?.includes(student.studentId);
                                    return (
                                        <tr key={index}>
                                            <td>{student.studentId}</td>
                                            <td>{student.name || 'Student Name'}</td>
                                            <td>
                                                <span className={`status-badge ${isPresent ? 'present' : 'absent'}`}>
                                                    {isPresent ? 'Present' : 'Absent'}
                                                </span>
                                            </td>
                                            <td>{isPresent ? selectedRecord.checkInTime || '-' : '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;

