import React from 'react';
import '../../css/Students.css';

// 示例学生数据
const students = [
    { id: 1, name: 'Alice', age: 20, major: 'Computer Science' },
    { id: 2, name: 'Bob', age: 22, major: 'Mathematics' },
    { id: 3, name: 'Charlie', age: 21, major: 'Physics' },
    // 添加更多学生数据...
];

const Student = () => {
    return (
        <div className="student-container">
            <h2>学生信息</h2>
            <table className="student-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>姓名</th>
                        <th>年龄</th>
                        <th>专业</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.id}>
                            <td>{student.id}</td>
                            <td>{student.name}</td>
                            <td>{student.age}</td>
                            <td>{student.major}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Student; 