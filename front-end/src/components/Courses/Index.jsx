import React, { useState } from 'react';
import '../../css/Courses.css';

// 示例课程数据，添加更多详细信息
const coursesData = [
    {
        id: 1,
        name: 'Introduction to Computer Science',
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

const Courses = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [courses, setCourses] = useState(coursesData);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 处理搜索
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        const filtered = coursesData.filter(course => 
            course.name.toLowerCase().includes(term) ||
            course.instructor.toLowerCase().includes(term)
        );
        setCourses(filtered);
    };

    // 处理排序
    const handleSort = (e) => {
        const sortType = e.target.value;
        setSortBy(sortType);
        
        const sorted = [...courses].sort((a, b) => {
            if (sortType === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortType === 'credits') {
                return b.credits - a.credits;
            } else if (sortType === 'semester') {
                return a.semester.localeCompare(b.semester);
            }
            return 0;
        });
        setCourses(sorted);
    };

    // 处理课程卡片点击
    const handleCardClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    // 关闭 Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    return (
        <div className="courses-container">
            <div className="courses-header">
                <h2>Courses</h2>
                <div className="courses-controls">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <select 
                        value={sortBy}
                        onChange={handleSort}
                        className="sort-select"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="credits">Sort by Credits</option>
                        <option value="semester">Sort by Semester</option>
                    </select>
                </div>
            </div>

            <div className="courses-grid">
                {courses.map(course => (
                    <div 
                        key={course.id} 
                        className="course-card"
                        onClick={() => handleCardClick(course)}
                    >
                        <h3>{course.name}</h3>
                        <div className="course-info">
                            <p><i className="fas fa-user"></i> {course.instructor}</p>
                            <p><i className="fas fa-graduation-cap"></i> {course.credits} Credits</p>
                            <p><i className="fas fa-calendar"></i> {course.semester}</p>
                        </div>
                        <button 
                            className="enroll-btn"
                            onClick={(e) => {
                                e.stopPropagation(); // 防止触发卡片的点击事件
                                // 处理选课逻辑
                            }}
                        >
                            Enroll Now
                        </button>
                    </div>
                ))}
            </div>

            {/* 课程详情 Modal */}
            {isModalOpen && selectedCourse && (
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
                        <button className="modal-enroll-btn">Enroll in Course</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses; 