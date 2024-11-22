import React, { useState } from 'react';
import CourseCard from '../CourseCard/Index';
import SearchBar from '../SearchBar/Index';  // 导入搜索组件
import '../../css/StudentCourses.css';
import '../../css/Courses.css';
import '../../css/CourseCard.css';


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

const StudentCourses = () => {

    const [courses, setCourses] = useState(coursesData);

    return (
        <div className="courses-container">
            <div className="courses-header">
                <SearchBar />
            </div>
            <div className="courses-grid">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
};

export default StudentCourses;