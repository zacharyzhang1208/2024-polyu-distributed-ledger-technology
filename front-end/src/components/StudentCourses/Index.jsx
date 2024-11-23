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
    const [showCheckin, setShowCheckin] = useState(false);  // 添加新的状态

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleCardClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    // 添加处理签到的函数
    const handleCheckin = () => {
        setShowCheckin(true);
    };

    // 关闭签到页面
    const handleCloseCheckin = () => {
        setShowCheckin(false);
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
            {isModalOpen && selectedCourse && !showCheckin && (
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
                            <button 
                                className="modal-btn checkin"
                                onClick={handleCheckin}
                            >
                                Student Check-in
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 添加签到子页面 */}
            {showCheckin && (
                <div className="modal-overlay" onClick={handleCloseCheckin}>
                    <div className="checkin-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseCheckin}>×</button>
                        <h2>Course Check-in</h2>
                        <div className="checkin-content">
                            <div className="checkin-info">
                                <p><strong>Course:</strong> {selectedCourse.name}</p>
                                <p><strong>Instructor:</strong> {selectedCourse.instructor}</p>
                                <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                            </div>
                            <div className="checkin-form">
                                <div className="form-group">
                                    <label>Check-in Code:</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter the check-in code"
                                        className="checkin-input"
                                    />
                                </div>
                                <button className="checkin-submit-btn">
                                    Submit Check-in
                                </button>
                            </div>
                            <div className="checkin-status">
                                <p>Please enter the check-in code provided by your instructor.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCourses;