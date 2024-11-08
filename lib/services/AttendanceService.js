const moment = require('moment');
const Transaction = require('../blockchain/transaction');
const CryptoUtil = require('../util/cryptoUtil');

class AttendanceService {
    constructor(blockchain, operator) {
        this.blockchain = blockchain;
        this.operator = operator;
    }

    // 创建考勤记录
    async createAttendance(studentId, courseId, location, wallet) {
        // 验证考勤时间
        if (!this.isValidAttendanceTime(courseId)) {
            throw new Error('Invalid attendance time');
        }

        const transaction = new Transaction();
        transaction.id = CryptoUtil.randomId();
        transaction.type = 'attendance';
        transaction.data = {
            studentId,
            courseId,
            timestamp: moment().unix(),
            location,
            publicKey: wallet.getAddresses()[0],
            attendanceType: this.determineAttendanceType(courseId)
        };

        // 签名
        const dataHash = transaction.calculateDataHash();
        transaction.data.signature = CryptoEdDSAUtil.signHash(
            wallet.getSecretKeyByAddress(transaction.data.publicKey),
            dataHash
        );

        // 添加到区块链
        return this.blockchain.addTransaction(transaction);
    }

    // 获取学生的考勤记录
    getStudentAttendance(studentId, startDate, endDate) {
        return this.blockchain.blocks
            .flatMap(block => block.transactions)
            .filter(tx => 
                tx.type === 'attendance' &&
                tx.data.studentId === studentId &&
                tx.data.timestamp >= startDate &&
                tx.data.timestamp <= endDate
            );
    }

    // 获取课程的考勤记录
    getCourseAttendance(courseId, date) {
        return this.blockchain.blocks
            .flatMap(block => block.transactions)
            .filter(tx => 
                tx.type === 'attendance' &&
                tx.data.courseId === courseId &&
                moment.unix(tx.data.timestamp).isSame(date, 'day')
            );
    }

    // ... 其他辅助方法
}

module.exports = AttendanceService; 