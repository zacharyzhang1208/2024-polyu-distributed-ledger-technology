import React from 'react';
import '../../css/EnrolledStudents.css';

const EnrolledStudents = ({
    enrolledStudents,
    selectedCourse,
    onStudentClick
}) => {
    return (
        <div className="enrolled-students-view">
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
                                onClick={() => onStudentClick(student)}
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
        </div>
    );
};

export default EnrolledStudents; 