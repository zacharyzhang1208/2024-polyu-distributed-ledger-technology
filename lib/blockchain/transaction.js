const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');
const TransactionAssertionError = require('./transactionAssertionError');
const Config = require('../config');

/*
Transaction structure:
{ // Transaction
    "id": "84286bba8d...7477efdae1", // random id (64 bytes)
    "hash": "f697d4ae63...c1e85f0ac3", // hash taken from the contents of the transaction: sha256 (id + data) (64 bytes)
    "type": "regular", // transaction type (regular, fee, reward)
    "data": {
        "inputs": [ // Transaction inputs
            {
                "transaction": "9e765ad30c...e908b32f0c", // transaction hash taken from a previous unspent transaction output (64 bytes)
                "index": "0", // index of the transaction taken from a previous unspent transaction output
                "amount": 5000000000, // amount of satoshis
                "address": "dda3ce5aa5...b409bf3fdc", // from address (64 bytes)
                "signature": "27d911cac0...6486adbf05" // transaction input hash: sha256 (transaction + index + amount + address) signed with owner address's secret key (128 bytes)
            }
        ],
        "outputs": [ // Transaction outputs
            {
                "amount": 10000, // amount of satoshis
                "address": "4f8293356d...b53e8c5b25" // to address (64 bytes)
            },
            {
                "amount": 4999989999, // amount of satoshis
                "address": "dda3ce5aa5...b409bf3fdc" // change address (64 bytes)
            }
        ]
    }
}
*/

class Transaction {
    constructor() {
        this.id = null;          // 交易唯一标识符
        this.hash = null;        // 交易数据的哈希值
        this.type = null;        // 交易类型：'attendance'(考勤)/'reward'(奖励)/'register'(注册)
        this.data = {
            // 基础字段
            signature: null,      // 交易签名
            publicKey: null,      // 发起者公钥
            timestamp: null,      // 时间戳

            // 考勤专用字段
            studentId: null,      // 学生ID
            courseId: null,       // 课程ID
            attendanceType: null, // 考勤状态：'present'/'late'/'absent'
            location: null,       // 签到位置

            // 注册专用字段
            userInfo: null,       // 用户信息
            role: null,          // 用户角色：'student'/'teacher'
        };
    }

    // 验证交易有效性
    check() {
        // 首先验证交易哈希
        if (this.hash !== this.calculateHash()) {
            throw new TransactionAssertionError('Invalid transaction hash');
        }

        // 根据不同交易类型进行验证
        switch(this.type) {
            case 'attendance': this.checkAttendance(); break;
            case 'register': this.checkRegister(); break;
            case 'reward': this.checkReward(); break;
        }
    }

    checkAttendance() {
        // 验证考勤记录
        if (!this.data.studentId || !this.data.courseId || !this.data.timestamp) {
            throw new TransactionAssertionError('Missing required attendance fields');
        }

        // 验证签名
        const isValidSignature = CryptoEdDSAUtil.verifySignature(
            this.data.publicKey,
            this.data.signature,
            this.calculateDataHash()
        );

        if (!isValidSignature) {
            throw new TransactionAssertionError('Invalid attendance signature');
        }
    }

    calculateHash() {
        return CryptoUtil.hash(this.id + this.type + JSON.stringify(this.data));
    }

    calculateDataHash() {
        // 计算要签名的数据的哈希
        const dataToSign = {
            studentId: this.data.studentId,
            courseId: this.data.courseId,
            timestamp: this.data.timestamp,
            location: this.data.location
        };
        return CryptoUtil.hash(JSON.stringify(dataToSign));
    }

    static fromJson(data) {
        let transaction = new Transaction();
        Object.assign(transaction, data);
        return transaction;
    }
}

module.exports = Transaction;
