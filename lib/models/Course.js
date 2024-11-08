class Course {
    constructor() {
        this.id = null;           // 课程ID
        this.name = null;         // 课程名称
        this.teacherId = null;    // 教师ID
        this.schedule = {         // 课程时间表
            weekday: null,        // 周几
            startTime: null,      // 开始时间
            endTime: null         // 结束时间
        };
        this.attendanceWindow = { // 考勤时间窗口
            before: 15,           // 提前15分钟可以打卡
            after: 15             // 延后15分钟可以打卡
        };
    }

    static fromJson(data) {
        let course = new Course();
        Object.assign(course, data);
        return course;
    }
}

module.exports = Course; 