import React, { useState } from 'react';
import CourseCard from '../CourseCard/Index';
import SearchBar from '../SearchBar/Index';  // 导入搜索组件
import '../../css/StudentCourses.css';
import '../../css/Courses.css';
import '../../css/Modal.css';

// 示例课程数据，添加更多详细信息
const coursesData = [
    {
        id: 1,
        name: 'Computer Science COMP5500',
        instructor: 'Dr. Smith',
        credits: 3,
        semester: 'Fall 2023',
        description: 'An introduction to the basic concepts of computer programming and computer science.',
        prerequisites: 'None',
        schedule: 'Mon/Wed 10:00-11:30',
        location: 'Room 101',
        capacity: 30,
        enrolled: 25
    },
    {
        id: 2,
        name: 'Computer Science COMP5501',
        instructor: 'Dr. Smith',
        credits: 3,
        semester: 'Fall 2023',
        description: 'An introduction to the basic concepts of computer programming and computer science.',
        prerequisites: 'None',
        schedule: 'Mon/Wed 10:00-11:30',
        location: 'Room 101',
        capacity: 30,
        enrolled: 25
    },
    {
        id: 4,
        name: 'Computer Science COMP5503',
        instructor: 'Dr. Smith',
        credits: 3,
        semester: 'Fall 2023',
        description: 'An introduction to the basic concepts of computer programming and computer science.',
        prerequisites: 'None',
        schedule: 'Mon/Wed 10:00-11:30',
        location: 'Room 101',
        capacity: 30,
        enrolled: 25
    },
    {
        id: 3,
        name: 'Computer Science COMP5504',
        instructor: 'Dr. Smith',
        credits: 3,
        semester: 'Fall 2023',
        description: 'An introduction to the basic concepts of computer programming and computer science.',
        prerequisites: 'None',
        schedule: 'Mon/Wed 10:00-11:30',
        location: 'Room 101',
        capacity: 30,
        enrolled: 25
    },
    // ... 其他课程数据
];

const StudentCourses = () => {

    const [courses, setCourses] = useState(coursesData);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleCardClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    return (
        <div className="courses-container">
            <div className="courses-header">
                <SearchBar />
            </div>
            <div className="courses-grid">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} onClick={handleCardClick}/>
                ))}
            </div>
            {isModalOpen&& (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                        <h2>{selectedCourse.name}</h2>
                        <div className="modal-info">
                            <div className="info-section">
                                <h3>Course Information</h3>
                                <p><strong>Instructor:</strong> {selectedCourse.instructor}</p>
                                <p><strong>Credits:</strong> {selectedCourse.credits}</p>
                                <p><strong>Semester:</strong> {selectedCourse.semester}</p>
                                <p><strong>Schedule:</strong> {selectedCourse.schedule}</p>
                                <p><strong>Location:</strong> {selectedCourse.location}</p>
                            </div>
                            <div className="info-section">
                                <h3>Description</h3>
                                <p>{selectedCourse.description}</p>
                            </div>
                            <div className="info-section">
                                <h3>Enrollment</h3>
                                <p><strong>Capacity:</strong> {selectedCourse.capacity}</p>
                                <p><strong>Enrolled:</strong> {selectedCourse.enrolled}</p>
                                <p><strong>Available Seats:</strong> {selectedCourse.capacity - selectedCourse.enrolled}</p>
                            </div>
                            <div className="info-section">
                                <h3>Prerequisites</h3>
                                <p>{selectedCourse.prerequisites}</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn checkin">
                                Student Check-in
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCourses;