class Student {
    constructor() {
        this.id = null;          // 学号
        this.name = null;        // 姓名
        this.publicKey = null;   // 公钥
        this.role = 'student';   // 角色
        this.class = null;       // 班级
    }

    static fromJson(data) {
        let student = new Student();
        Object.assign(student, data);
        return student;
    }
}

module.exports = Student; 