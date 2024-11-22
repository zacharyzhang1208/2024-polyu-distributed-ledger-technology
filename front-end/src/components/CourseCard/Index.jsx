import React from 'react';
import '../../css/CourseCard.css';

const CourseCard = ({ course, onClick }) => {
    return (
        <div className="course-card" onClick={() => onClick(course)}>
            <h3>{course.name}</h3>
            <div className="course-info">
                <p>{course.instructor}</p>
                <p>{course.credits} Credits</p>
                <p>{course.semester}</p>
                <p>{course.schedule}</p>
            </div>
            <div className="course-footer">
                <div className="course-seats">
                    <span>{course.enrolled}/{course.capacity}</span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard; 