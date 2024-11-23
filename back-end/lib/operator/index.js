const R = require('ramda');
const Wallets = require('./wallets');
const Wallet = require('./wallet');
const Transaction = require('../blockchain/transaction');
const TransactionBuilder = require('./transactionBuilder');
const Db = require('../util/db');
const ArgumentError = require('../util/argumentError');
const Config = require('../config');
const SymmetricCrypto = require('../util/symmetricCrypto');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');

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
    //初始化学校可注册人员
    
    // 考勤注册，这里需要修改，直接顺着上面的交易写就行了
    createAttendanceTransaction(studentAddress, courseAddress ,studentSecretKey,studentId, courseId, verifyCode) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(studentAddress);
        // let wallet = this.getWalletById(walletId);

        // if (wallet == null) throw new ArgumentError(`Wallet not found with id '${walletId}'`);
        
        let secretKey = studentSecretKey;

        // if (secretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${studentAddress}'`);
        // 构建metadata
        let metadataContent = {
            category: 'attendance',
            studentId: studentId,
            courseId: courseId, 
            verifyCode: verifyCode,
            timestamp: new Date().getTime()
        };
        // 使用 CryptoUtil 加密 metadata
        const metadataString = JSON.stringify(metadataContent);
        const metadataHash = CryptoUtil.hash(metadataString);
    
        // 使用私钥签名
        const signature = CryptoEdDSAUtil.signMessage(secretKey, metadataHash);
        let metadata = {
            ...metadataContent,
            hash: signature  // 添加签名作为 hash
        };
        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(courseAddress, 1);
        tx.change(studentAddress);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('attendance');  // 设置交易类型
        tx.sign(secretKey);
        tx.setMetadata(metadata);

        return Transaction.fromJson(tx.build());
    }

    // 生注册交易，注册后实现将学生ID和公钥上传到区块链
    //水龙头会自动给学生50元
    createStudentRegisterTransaction(walletId, fromAddressId, toAddressId, studentId, publicKey,
                                encryptedSecretKey,power=0,amount=0) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        // 水龙头的私钥
        let faucetSecretKey = Config.FAUCET_SECRET_KEY;

        if (faucetSecretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);
        // 构建metadata
        let metadataContent = {
            category: 'register',
            studentId: studentId,
            walletId: walletId,
            publicKey: publicKey,
            secretKey: encryptedSecretKey,
            power: power,
            timestamp: new Date().getTime()
        };
        // 使用 CryptoUtil 加密 metadata
        const metadataString = JSON.stringify(metadataContent);
        const metadataHash = CryptoUtil.hash(metadataString);
    
        // 使用这里是水龙头的私钥签名
        const signature = CryptoEdDSAUtil.signMessage(faucetSecretKey, metadataHash);
        let metadata = {
            ...metadataContent,
            hash: signature  // 添加签名作为 hash
        };

        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, amount);
        tx.change(fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('register');  // 设置交易类型
        tx.sign(faucetSecretKey);
        tx.setMetadata(metadata);

        return Transaction.fromJson(tx.build());
    }  

    // 教师注册交易，注册后实现将教师ID和公钥上传到区块链
    createTeacherRegisterTransaction(walletId, fromAddressId, toAddressId, teacherId, publicKey,
        encryptedSecretKey, amount=0) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        // 使用水龙头的私钥
        let faucetSecretKey = Config.FAUCET_SECRET_KEY;

        if (faucetSecretKey == null) throw new ArgumentError(`Secret key not found with Wallet id '${walletId}' and address '${fromAddressId}'`);
        
        // 构建metadata
        let metadataContent = {
            category: 'register',
            teacherId: teacherId,
            walletId: walletId,
            publicKey: publicKey,
            secretKey: encryptedSecretKey,
            power: 1,
            timestamp: new Date().getTime()
        };
        
        // 使用 CryptoUtil 加密 metadata
        const metadataString = JSON.stringify(metadataContent);
        const metadataHash = CryptoUtil.hash(metadataString);

        // 使用水龙头私钥签名
        const signature = CryptoEdDSAUtil.signMessage(faucetSecretKey, metadataHash);
        let metadata = {
            ...metadataContent,
            hash: signature  // 添加签名作为 hash
        };

        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, amount);
        tx.change(fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('register');  // 设置交易类型
        tx.sign(faucetSecretKey);  // 使用水龙头私钥签名
        tx.setMetadata(metadata);

        return Transaction.fromJson(tx.build());
    } 

    // 注册Course,注册后将教师ID课程ID和公钥上传到区块链
    createCourseTransaction(fromAddressId, toAddressId, teacherId, courseId, publicKey, encryptedSecretKey) {
        // console.log('开始创建课程交易:', {
        //     courseId,
        //     teacherId
        // });
        
        // 首先检查教师ID是否在允许列表中
        if (!this.checkIdInList(teacherId)) {
            throw new ArgumentError(`Invalid teacher ID: ${teacherId}`);
        }

        let utxo = this.blockchain.getUnspentTransactionsForAddress(fromAddressId);
        let faucetSecretKey = Config.FAUCET_SECRET_KEY;  

        if (!faucetSecretKey) {
            throw new ArgumentError('Faucet secret key not found');
        }

        // 构建metadata
        let metadataContent = {
            category: 'course',
            teacherId: teacherId,
            courseId: courseId,
            publicKey: publicKey,
            secretKey: encryptedSecretKey,
            timestamp: new Date().getTime()
        };

        // 使用 CryptoUtil 加密 metadata
        const metadataString = JSON.stringify(metadataContent);
        const metadataHash = CryptoUtil.hash(metadataString);

        // 使用水龙头私钥签名
        const signature = CryptoEdDSAUtil.signMessage(faucetSecretKey, metadataHash);
        let metadata = {
            ...metadataContent,
            hash: signature  // 添加签名作为 hash
        };

        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(toAddressId, 0); // 课程注册不需要转账金额
        tx.change(fromAddressId);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('course');  // 设置交易类型为课程注册
        tx.sign(faucetSecretKey);
        tx.setMetadata(metadata);

        const transaction = Transaction.fromJson(tx.build());
        // console.log('课程交易创建成功:', {
        //     id: transaction.id,
        //     type: transaction.type,
        //     metadata: transaction.metadata
        // });
        
        return transaction;
    }  
    
    //注册lesson
    createLessonTransaction(faucetAddress, coursePublicKey, teacherId, courseId, 
        courseSecretKey, faucetSecretKey, verifyCode) {
        let utxo = this.blockchain.getUnspentTransactionsForAddress(faucetAddress);

        if (!faucetSecretKey) {
            throw new ArgumentError('Faucet secret key not found');
        }

        // 构建metadata
        let metadataContent = {
            category: 'lesson',
            teacherId: teacherId,
            courseId: courseId,
            verifyCode: verifyCode,
            timestamp: new Date().getTime()
        };

        // 使用课程私钥对metadata进行签名
        const metadataString = JSON.stringify(metadataContent);
        const metadataHash = CryptoUtil.hash(metadataString);
        const signature = CryptoEdDSAUtil.signMessage(courseSecretKey, metadataHash);

        let metadata = {
            ...metadataContent,
            hash: signature  // 使用课程私钥的签名
        };

        let tx = new TransactionBuilder();
        tx.from(utxo);
        tx.to(coursePublicKey, 1); // 发送1个代币到课程地址
        tx.change(faucetAddress);
        tx.fee(Config.FEE_PER_TRANSACTION);
        tx.setType('lesson');
        tx.sign(faucetSecretKey); // 使用水龙头私钥签名交易
        tx.setMetadata(metadata);

        return Transaction.fromJson(tx.build());
    }
    //创建钱包,返回钱包ID，公钥，私钥，加密私钥
    createWallet(Id, password) {
        // 1. 创建钱包
        let wallet = this.createWalletFromPassword(Id);
        
        // 2. 为钱包生成地址(这个地址将作为公钥)
        let address = this.generateAddressForWallet(wallet.id);
        
        // 3. 获取私钥
        let secretKey = wallet.getSecretKeyByAddress(address);
        
        // 加密私钥 - 使用新的加密方法
        const encryptedSecretKey = CryptoUtil.encrypt(secretKey, password);
        
        return {
            walletId: wallet.id,
            publicKey: address,
            secretKey: secretKey,
            encryptedSecretKey: encryptedSecretKey
        }  
    }

    // 根据 studentId 查询公钥和私钥信息
    getRegisterInfoByStudentId(studentId) {
        if (!studentId) {
            throw new ArgumentError('studentId is required');
        }

        let allTransactions = this.blockchain.getAllTransactions();
        
        // 找到符合条件的注册记录
        let registerTransaction = allTransactions
            .find(transaction => {
                return transaction.meta && 
                       transaction.meta.category === 'register' && 
                       transaction.meta.studentId === studentId;
            });

        if (!registerTransaction) {
            return null;
        }

        return {
            publicKey: registerTransaction.meta.publicKey,
            secretKey: registerTransaction.meta.secretKey
        };
    }

    // 根据输入id查询是否在List中
    checkIdInList(id) {
        if (!id) {
            throw new ArgumentError('Id is required');
        }

        // 获取创世区块
        const genesisBlock = this.blockchain.getBlockByIndex(0);
        
        if (!genesisBlock) {
            console.error('Genesis block not found');
            return false;
        }

        // 获取创世区块中的第一个交易
        const genesisTransaction = genesisBlock.transactions[0];
        
        if (!genesisTransaction || !genesisTransaction.data || !genesisTransaction.data.List) {
            console.error('List not found in genesis block');
            return false;
        }

        // 检查 ID 是否在列表中
        const idExists = genesisTransaction.data.List.includes(id);
        
        if (!idExists) {
            console.error(`ID '${id}' is not in the allowed list`);
            return false;
        }

        return true;
    }

    // 根据 courseId 查询注册信息
    getRegisterInfoByCourseId(courseId) {
        if (!courseId) {
            throw new ArgumentError('courseId is required');
        }

        let allTransactions = this.blockchain.getAllTransactions();
        
        // console.log('查找课程ID:', courseId);
        
        let courseTransaction = allTransactions.find(transaction => {
            const metadata = transaction.metadata
            
            return transaction.type === 'course' && 
                   (metadata?.category === 'course' || 
                    transaction.data?.metadata?.category === 'course') && 
                   (metadata?.courseId === courseId || 
                    transaction.data?.metadata?.courseId === courseId);
        });

        if (!courseTransaction) {
            console.log('未找到课程交易，所有交易的详细信息：', 
                allTransactions.map(t => ({
                    type: t.type,
                    metadata: t.metadata || t.data?.metadata || t.meta,
                    data: t.data
                }))
            );
            return null;
        }

        const transactionData = courseTransaction.metadata || 
                              courseTransaction.data?.metadata || 
                              courseTransaction.meta;

        return {
            publicKey: transactionData.publicKey,
            encryptedSecretKey: transactionData.secretKey
        };
    }

    // 添加获取学生公钥和私钥的方法
    getStudentKeys(studentId) {
        if (!studentId) {
            throw new ArgumentError('studentId is required');
        }

        let allTransactions = this.blockchain.getAllTransactions();
        
        // 找到学生注册交易
        let studentTransaction = allTransactions.find(transaction => {
            const metadata = transaction.data?.metadata;
            return transaction.type === 'register' && 
                   metadata?.category === 'register' && 
                   metadata?.studentId === studentId;
        });

        if (!studentTransaction) {
            throw new ArgumentError(`Student not found with ID: ${studentId}`);
        }

        return {
            publicKey: studentTransaction.data.metadata.publicKey,
            encryptedSecretKey: studentTransaction.data.metadata.secretKey
        };
    }

    // 添加获取课程公钥的方法
    getCoursePublicKey(courseId) {
        if (!courseId) {
            throw new ArgumentError('courseId is required');
        }

        let allTransactions = this.blockchain.getAllTransactions();
        
        // 找到课程注册交易
        let courseTransaction = allTransactions.find(transaction => {
            const metadata = transaction.data?.metadata;
            return transaction.type === 'course' && 
                   metadata?.category === 'course' && 
                   metadata?.courseId === courseId;
        });

        if (!courseTransaction) {
            throw new ArgumentError(`Course not found with ID: ${courseId}`);
        }

        return courseTransaction.data.metadata.publicKey;
    }

}

module.exports = Operator;