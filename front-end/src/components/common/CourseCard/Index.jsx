import React from 'react';
import '../../../css/CourseCard.css';

const CourseCard = ({ course, onClick }) => {
    return (
        <div className="course-card" onClick={() => onClick(course)}>
            <h3>{course.name}</h3>
            <div className="course-info">
                <p><strong>Instructor:</strong> {course.instructor}</p>
                <p><strong>Credits:</strong> {course.credits}</p>
                <p><strong>Semester:</strong> {course.semester}</p>
                <p><strong>Schedule:</strong> {course.schedule}</p>
            </div>
        </div>
    );
};

export default CourseCard; 