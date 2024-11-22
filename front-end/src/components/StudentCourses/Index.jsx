import React, { useState } from 'react';
import CourseCard from '../CourseCard/Index';
import SearchBar from '../SearchBar/Index';  // 导入搜索组件
import '../../css/TeacherCourses.css';

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
    return (
        <h2>My Courses</h2>
    );
};

export default StudentCourses;