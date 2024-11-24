import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CourseCard from '../CourseCard/Index';
import SearchBar from '../SearchBar/Index';
import { 
    getTeacherCourses, 
    getCourseAttendance, 
    getCourseEnrolledStudents,
    createLessonAttendance 
} from '../../services/api';
import '../../css/TeacherCourses.css';
import '../../css/SearchBar.css';
import '../../css/CourseCard.css';
import '../../css/Modal.css';
import '../../css/Courses.css';
import Attendance from '../Attendance/Index';
import EnrolledStudents from '../EnrolledStudents/Index';

// // 示例课程数据，添加更多详细信息
// const coursesData = [
//     {
//         id: 1,
//         name: 'Computer Science COMP5500',
//         instructor: 'Dr. Smith',
//         credits: 3,
//         semester: 'Fall 2023',
//         description: 'An introduction to the basic concepts of computer programming and computer science.',
//         prerequisites: 'None',
//         schedule: 'Mon/Wed 10:00-11:30',
//         location: 'Room 101',
//         capacity: 30,
//         enrolled: 25
//     },
//     {
//         id: 2,
//         name: 'Computer Science COMP5501',
//         instructor: 'Dr. Smith',
//         credits: 3,
//         semester: 'Fall 2023',
//         description: 'An introduction to the basic concepts of computer programming and computer science.',
//         prerequisites: 'None',
//         schedule: 'Mon/Wed 10:00-11:30',
//         location: 'Room 101',
//         capacity: 30,
//         enrolled: 25
//     },
//     {
//         id: 4,
//         name: 'Computer Science COMP5503',
//         instructor: 'Dr. Smith',
//         credits: 3,
//         semester: 'Fall 2023',
//         description: 'An introduction to the basic concepts of computer programming and computer science.',
//         prerequisites: 'None',
//         schedule: 'Mon/Wed 10:00-11:30',
//         location: 'Room 101',
//         capacity: 30,
//         enrolled: 25
//     },
//     {
//         id: 3,
//         name: 'Computer Science COMP5504',
//         instructor: 'Dr. Smith',
//         credits: 3,
//         semester: 'Fall 2023',
//         description: 'An introduction to the basic concepts of computer programming and computer science.',
//         prerequisites: 'None',
//         schedule: 'Mon/Wed 10:00-11:30',
//         location: 'Room 101',
//         capacity: 30,
//         enrolled: 25
//     },
//     // ... 其他课程数据
// ];

// 生成随机名字的辅助函数
const generateRandomName = () => {
    const firstNames = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'James', 'Mary'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const TeacherCourses = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [attendanceCode, setAttendanceCode] = useState('');
    const [showAttendanceList, setShowAttendanceList] = useState(false);
    const [showEnrolledStudents, setShowEnrolledStudents] = useState(false);
    const [showAttendanceDetail, setShowAttendanceDetail] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceFilters, setAttendanceFilters] = useState({
        studentId: '',
        startDate: '',
        endDate: ''
    });
    const [attendanceView, setAttendanceView] = useState('course'); // 'course', 'student', 'period'
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [showStudentDetail, setShowStudentDetail] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAttendanceRecords, setStudentAttendanceRecords] = useState([]);

    // 从 localStorage 获取教师ID
    const teacherId = JSON.parse(localStorage.getItem('user'))?.id;

    // 加载教师课程
    useEffect(() => {
        const loadTeacherCourses = async () => {
            try {
                console.log('Loading courses for teacher:', teacherId); // 调试日��
                const response = await getTeacherCourses(teacherId);
                console.log('Received courses:', response); // 调试日志
                
                // 将返回的课程数据转换为组件需要的格式
                const formattedCourses = response.courses.map(course => ({
                    id: course.courseId,           // 使用课程ID作为唯一标识
                    name: course.courseId,         // 使用课程ID作为显示名称
                    courseId: course.courseId,     // 保存原始课程ID
                    instructor: teacherId,         // 使用教师ID
                    credits: 3,                    // 默认学分
                    semester: 'Spring 2024',       // 当学期
                    description: 'Course description...',
                    prerequisites: 'None',
                    schedule: 'Mon/Wed 10:00-11:30',
                    location: 'Room 101',
                    capacity: 30,
                    enrolled: 0  // 初始值为0，后续会更新
                }));

                console.log('Formatted courses:', formattedCourses); // 调试日志
                setCourses(formattedCourses);
            } catch (error) {
                console.error('Failed to load courses:', error);
            }
        };

        if (teacherId) {
            loadTeacherCourses();
        }
    }, [teacherId]);

    // 处理搜索
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        const filtered = courses.filter(course => 
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
    const handleCardClick = async (course) => {
        setSelectedCourse(course);
        try {
            // 获取考勤记录
            const attendanceData = await getCourseAttendance({ courseId: course.courseId });
            setAttendanceRecords(attendanceData.records);
            
            // 计算已注册学生数量
            const uniqueStudents = new Set(attendanceData.records.map(record => record.studentId));
            course.enrolled = uniqueStudents.size;
            
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        }
    };

    // 关闭 Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // 修改处理创建签到的函数
    const handleCreateAttendance = async () => {
        try {
            const verifyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const response = await createLessonAttendance({
                teacherId,
                courseId: selectedCourse.courseId,
                verifyCode
            });
            
            setAttendanceCode(verifyCode);
            setShowQRCode(true);
        } catch (error) {
            console.error('Failed to create attendance:', error);
        }
    };

    // 关闭二维码页面
    const handleCloseQRCode = () => {
        setShowQRCode(false);
        setAttendanceCode('');
    };

    // 添加处理查看签到情况的函数
    const handleViewAttendance = async () => {
        try {
            // 获取已注册学生列表
            const enrolledResponse = await getCourseEnrolledStudents(selectedCourse.courseId);
            setEnrolledStudents(enrolledResponse.students);
            
            // 获取考勤记录
            const attendanceResponse = await getCourseAttendance({
                courseId: selectedCourse.courseId,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
            
            if (attendanceResponse.success) {
                setAttendanceRecords(attendanceResponse.records);
            }
            
            setShowAttendanceList(true);
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        }
    };

    // 关闭签到列表页面
    const handleCloseAttendanceList = () => {
        setShowAttendanceList(false);
    };

    // 修改处理查看已注册学生的函数
    const handleViewEnrolledStudents = async () => {
        try {
            const response = await getCourseEnrolledStudents(selectedCourse.courseId);
            
            // 为每个学生添加随机名字
            const studentsWithNames = response.students.map(student => ({
                ...student,
                name: generateRandomName(),
                enrollmentDate: new Date(student.timestamp).toLocaleDateString(),
                status: 'Active'
            }));

            setEnrolledStudents(studentsWithNames);
            setShowEnrolledStudents(true);
        } catch (error) {
            console.error('Failed to load enrolled students:', error);
        }
    };

    // 关闭已注册学生列表页面
    const handleCloseEnrolledStudents = () => {
        setShowEnrolledStudents(false);
    };

    // 添加处理点击签到记录的函数
    const handleAttendanceRowClick = (attendance) => {
        setSelectedAttendance(attendance);
        setShowAttendanceDetail(true);
    };

    // 关闭签到详情页面
    const handleCloseAttendanceDetail = () => {
        setShowAttendanceDetail(false);
        setSelectedAttendance(null);
    };

    // 处理考勤记录筛选
    const handleAttendanceFilter = async () => {
        try {
            const response = await getCourseAttendance({
                courseId: selectedCourse.courseId,
                ...attendanceFilters
            });
            setAttendanceRecords(response.records);
        } catch (error) {
            console.error('Failed to filter attendance:', error);
        }
    };

    // 处理考勤记录查询
    const handleAttendanceQuery = async () => {
        try {
            const queryParams = {
                courseId: selectedCourse.courseId,
                ...(selectedStudentId && { studentId: selectedStudentId }),
                ...(dateRange.startDate && { startDate: dateRange.startDate }),
                ...(dateRange.endDate && { endDate: dateRange.endDate })
            };

            console.log('Querying attendance with params:', queryParams);
            const response = await getCourseAttendance(queryParams);
            console.log('Attendance query response:', response);

            if (response.success) {
                setAttendanceRecords(response.records);
                // 可以添加提示信息
                console.log(`Found ${response.total} records`);
            }
        } catch (error) {
            console.error('Failed to fetch attendance records:', error);
            // 可以添加错误提示
        }
    };

    // 在视图切换时清空之前的记录
    const handleViewChange = (view) => {
        setAttendanceView(view);
        setAttendanceRecords([]);  // 清空之前的记录
        setDateRange({ startDate: '', endDate: '' });  // 重置日期范围
        setSelectedStudentId('');  // 重置学生ID
    };

    // 添加处理学生行点击的函数
    const handleStudentRowClick = async (student) => {
        try {
            // 获取该学生在当前课程的所有考勤记录
            const response = await getCourseAttendance({
                courseId: selectedCourse.courseId,
                studentId: student.studentId
            });

            // 按时间排序
            const sortedRecords = response.records.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            setStudentAttendanceRecords(sortedRecords);
            setSelectedStudent(student);
            setShowStudentDetail(true);
        } catch (error) {
            console.error('Failed to fetch student attendance records:', error);
        }
    };

    // 添加关闭学生详情的函数
    const handleCloseStudentDetail = () => {
        setShowStudentDetail(false);
        setSelectedStudent(null);
    };

    return (
        <div className="courses-container">
            <div className="courses-header">
                <SearchBar 
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    sortBy={sortBy}
                    onSort={handleSort}
                />
            </div>

            <div className="courses-grid">
                {courses.map(course => (
                    <CourseCard 
                        key={course.id}
                        course={course}
                        onClick={handleCardClick}
                    />
                ))}
            </div>
            
            {/* QRCode Modal */}
            {showQRCode && (
                <div className="modal-overlay" onClick={handleCloseQRCode}>
                    <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseQRCode}>×</button>
                        <h2>Course Attendance QR Code</h2>
                        <div className="qr-code-container">
                            <QRCodeSVG 
                                value={attendanceCode}
                                size={256}
                                level="H"
                            />
                        </div>
                        <div className="attendance-info">
                            <p><strong>Course:</strong> {selectedCourse.name}</p>
                            <p><strong>Attendance Code:</strong> {attendanceCode}</p>
                            <p><strong>Valid Until:</strong> {new Date(Date.now() + 30*60000).toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 考勤记录模态框 */}
            {showAttendanceList && (
                <div className="modal-overlay" onClick={handleCloseAttendanceList}>
                    <div className="attendance-list-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseAttendanceList}>×</button>
                        <h2>Attendance Records</h2>
                        <Attendance 
                            attendanceView={attendanceView}
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            selectedStudentId={selectedStudentId}
                            setSelectedStudentId={setSelectedStudentId}
                            handleAttendanceQuery={handleAttendanceQuery}
                            attendanceRecords={attendanceRecords}
                            enrolledStudents={enrolledStudents}
                        />
                    </div>
                </div>
            )}

            {/* 修改已注册学生列表模态框 */}
            {showEnrolledStudents && (
                <div className="modal-overlay" onClick={handleCloseEnrolledStudents}>
                    <div className="enrolled-students-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseEnrolledStudents}>×</button>
                        <h2>Enrolled Students</h2>
                        <EnrolledStudents 
                            enrolledStudents={enrolledStudents}
                            selectedCourse={selectedCourse}
                            onStudentClick={handleStudentRowClick}
                        />
                    </div>
                </div>
            )}

            {/* 添加签到详情页面 */}
            {showAttendanceDetail && selectedAttendance && (
                <div className="modal-overlay" onClick={handleCloseAttendanceDetail}>
                    <div className="attendance-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseAttendanceDetail}>×</button>
                        <h2>Attendance Detail</h2>
                        <div className="attendance-detail-header">
                            <p><strong>Date:</strong> {selectedAttendance.date}</p>
                            <p><strong>Time:</strong> {selectedAttendance.time}</p>
                            <p><strong>Attendance Rate:</strong> {selectedAttendance.rate}%</p>
                        </div>
                        <div className="attendance-detail-table-container">
                            <table className="attendance-detail-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Check-in Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedAttendance.students.map((student, index) => (
                                        <tr key={index}>
                                            <td>{student.id}</td>
                                            <td>{student.name}</td>
                                            <td>
                                                <span className={`status-badge ${student.status.toLowerCase()}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td>{student.status === 'Present' ? student.checkInTime : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 添加学生考勤详情模态框 */}
            {showStudentDetail && selectedStudent && (
                <div className="modal-overlay" onClick={handleCloseStudentDetail}>
                    <div className="student-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="detail-header">
                            <button className="back-btn" onClick={handleCloseStudentDetail}>
                                <i className="fas fa-arrow-left"></i> Back
                            </button>
                            <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                            <p><strong>Name:</strong> {selectedStudent.name}</p>
                            <p><strong>Status:</strong> {selectedStudent.status}</p>
                        </div>
                        <div className="detail-table-container">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Check-in Time</th>
                                        <th>Verify Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentAttendanceRecords.map((record, index) => (
                                        <tr key={index}>
                                            <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                                            <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                            <td>
                                                <span className={`status-badge ${record.status?.toLowerCase()}`}>
                                                    {record.status || 'Absent'}
                                                </span>
                                            </td>
                                            <td>{record.checkInTime || '-'}</td>
                                            <td>{record.verifyCode}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 原有的课程详情模态框 */}
            {isModalOpen && selectedCourse && !showQRCode && !showAttendanceList && !showEnrolledStudents && !showAttendanceDetail && (
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
                                className="modal-btn enrolled"
                                onClick={handleViewEnrolledStudents}
                            >
                                Enrolled Students
                            </button>
                            <button 
                                className="modal-btn enroll"
                                onClick={handleViewAttendance}
                            >
                                Attendance Situation
                            </button>
                            <button 
                                className="modal-btn attendance"
                                onClick={handleCreateAttendance}
                            >
                                Create Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCourses; 