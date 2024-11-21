const R = require('ramda');
const Wallets = require('./wallets');
const Wallet = require('./wallet');
const Transaction = require('../blockchain/transaction');
const TransactionBuilder = require('./transactionBuilder');
const Db = require('../util/db');
const ArgumentError = require('../util/argumentError');
const Config = require('../config');

const OPERATOR_FILE = 'wallets.json';

class Operator {
    constructor(dbName, blockchain) {
        this.db = new Db('data/' + dbName + '/' + OPERATOR_FILE, new Wallets());

        // INFO: In this implementation the database is a file and every time data is saved it rewrites the file, probably it should be a more robust database for performance reasons
        this.wallets = this.db.read(Wallets);
        this.blockchain = blockchain;
    }

    addWallet(wallet) {
        this.wallets.push(wallet);
        this.db.write(this.wallets);
        return wallet;
    }
    // 通过密码生成钱包
    createWalletFromPassword(password) {
        let newWallet = Wallet.fromPassword(password);
        return this.addWallet(newWallet);
    }    

    checkWalletPassword(walletId, passwordHash) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        return wallet.passwordHash == passwordHash;
    }

    getWallets() {
        return this.wallets;
    }

    getWalletById(walletId) {
        return R.find((wallet) => { return wallet.id == walletId; }, this.wallets);
    }
    // 通过钱包生成地址
    generateAddressForWallet(walletId) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        let address = wallet.generateAddress();
        this.db.write(this.wallets);
        return address;
    }

    getAddressesForWallet(walletId) {
        let wallet = this.getWalletById(walletId);
        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        let addresses = wallet.getAddresses();
        return addresses;
    }    

    getBalanceForAddress(addressId) {        
        let utxo = this.blockchain.getUnspentTransactionsForAddress(addressId);

        if (utxo == null || utxo.length == 0) throw new ArgumentError(`No transactions found for address '${addressId}'`);
        return R.sum(R.map(R.prop('amount'), utxo));
    }

    createTransaction(walletId, fromAddressId, toAddressId, amount, changeAddressId) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let wallet = this.getWalletById(walletId);

        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);

        let secretKey = wallet.getSecretKeyByAddress(fromAddressId);

        if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);

        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, amount);
        tx.change(changeAddressId || fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.sign(secretKey);        

        return Transaction.fromJson(tx.build());
    }
    // 考勤注册，这里需要修改，直接顺着上面的交易写就行了
    createAttendanceTransaction(walletId, fromAddressId, toAddressId ,studentId, courseId, verifyCode) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let wallet = this.getWalletById(walletId);

        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);
        // 这里以后要改成自己输入密钥
        let secretKey = wallet.getSecretKeyByAddress(fromAddressId);

        if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);
        // 构建metadata
        let metadata = {
            category: 'attendance',
            studentId: studentId,
            activityId: courseId, 
            verifyCode: verifyCode,
            timestamp: new Date().getTime()
        };
        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, 0);
        tx.change(fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('attendance');  // 设置交易类型
        tx.sign(secretKey);
        tx.setMetadata(metadata);

        return Transaction.fromJson(tx.build());
    }

    // 注册交易，注册后实现将学生ID和公钥上传到区块链
    createRegisterTransaction(walletId, fromAddressId, toAddressId, studentId, publicKey) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let wallet = this.getWalletById(walletId);

        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);
        // 这里以后要改成自己输入密钥
        let secretKey = wallet.getSecretKeyByAddress(fromAddressId);

        if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);
        // 构建metadata
        let metadata = {
            category: 'register',
            studentId: studentId,
            publicKey: publicKey,
            timestamp: new Date().getTime()
        };
        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, 0);
        tx.change(fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('register');  // 设置交易类型
        tx.sign(secretKey);
        tx.setMetadata(metadata);

        return Transaction.fromJson(tx.build());
    }   

    // 注册Course
    createCourseTransaction(walletId, fromAddressId, toAddressId, teacherId, courseId, publicKey) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let wallet = this.getWalletById(walletId);

        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);
        // 这里以后要改成自己输入密钥
        let secretKey = wallet.getSecretKeyByAddress(fromAddressId);

        if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);
        // 构建metadata
        let metadata = {
            category: 'course',
            teacherId: teacherId,
            courseId: courseId,
            publicKey: publicKey,
            timestamp: new Date().getTime()
        };
        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, 0);
        tx.change(fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('course');  // 设置交易类型
        tx.sign(secretKey);
        tx.setMetadata(metadata);

        return Transaction.fromJson(tx.build());
    }  
    
    //注册lesson
    createLessonTransaction(walletId, fromAddressId, toAddressId, teacherId, courseId, 
        activityId,verifyCode, start, end, publicKey) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let wallet = this.getWalletById(walletId);

        if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);
        // 这里以后要改成自己输入密钥
        let secretKey = wallet.getSecretKeyByAddress(fromAddressId);

        if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);
        // 构建metadata
        let metadata = {
            category: 'lesson',
            teacherId: teacherId,
            courseId: courseId,
            activityId: activityId,
            verifyCode: verifyCode,
            timeRange: {
                start: start,
                end: end
            },
            publicKey: publicKey,
            timestamp: new Date().getTime()
        };

        
        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, 0);
        tx.change(fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('course');  // 设置交易类型
        tx.sign(secretKey);
        tx.setMetadata(metadata);
        return Transaction.fromJson(tx.build());
    }

    async createStudentWalletAndRegister(password) {
          // 1. 创建钱包
          let wallet = this.createWalletFromPassword(password);
          console.log(wallet.id);
        
          // 2. 为钱包生成地址(这个地址将作为学生的公钥)
          let address = this.generateAddressForWallet(wallet.id);
          console.log(address);
          // 3. 获取私钥
          let secretKey = wallet.getSecretKeyByAddress(address);
          console.log(secretKey);
          // 4. 创建注册交易(使用学生的密码作为学生ID)
          let registerTx = this.createRegisterTransaction(
              wallet.id,    // walletId
              address,      // fromAddress (学生的地址)
              address,      // toAddress (同样使用学生的地址)
              password,     // studentId (使用密码作为学生ID)
              address       // publicKey (使用生成的地址作为公钥)
          );
  
          // 5. 返回所有需要的信息
          return {
              walletId: wallet.id,
              publicKey: address,
              secretKey: secretKey,
              studentId: password,
              transaction: registerTx
          };
    }




}

module.exports = Operator;