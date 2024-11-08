class Teacher {
    constructor() {
        this.id = null;          // 工号
        this.name = null;        // 姓名
        this.publicKey = null;   // 公钥
        this.role = 'teacher';   // 角色
        this.subjects = [];      // 教授课程
    }

    static fromJson(data) {
        let teacher = new Teacher();
        Object.assign(teacher, data);
        return teacher;
    }
}

module.exports = Teacher; 