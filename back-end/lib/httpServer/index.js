const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const R = require('ramda');
const path = require('path');
const cors = require('cors');
const swaggerDocument = require('./swagger.json');
const Block = require('../blockchain/block');
const Transaction = require('../blockchain/transaction');
const TransactionAssertionError = require('../blockchain/transactionAssertionError');
const BlockAssertionError = require('../blockchain/blockAssertionError');
const HTTPError = require('./httpError');
const ArgumentError = require('../util/argumentError');
const CryptoUtil = require('../util/cryptoUtil');
const timeago = require('timeago.js');
const projectWallet = require('../operator/projectWallet');
const Config = require('../config'); 
const SymmetricCrypto = require('../util/symmetricCrypto');

class HttpServer {
    constructor(node, blockchain, operator, miner) {
        this.app = express();
        
        // 配置 CORS
        const corsOptions = {
            origin: 'http://localhost:8080', // webpack-dev-server 默认端口
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        };
        this.app.use(cors(corsOptions));
        this.app.use(bodyParser.json());
        this.app.set('view engine', 'pug');
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.locals.formatters = {
            time: (rawTime) => {
                const timeInMS = new Date(rawTime * 1000);
                return `${timeInMS.toLocaleString()} - ${timeago().format(timeInMS)}`;
            },
            hash: (hashString) => {
                return hashString != '0' ? `${hashString.substr(0, 5)}...${hashString.substr(hashString.length - 5, 5)}` : '<empty>';
            },
            amount: (amount) => amount.toLocaleString()
        };
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        this.app.get('/blockchain', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/index.pug', {
                    pageTitle: 'Blockchain',
                    blocks: blockchain.getAllBlocks()
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });

        this.app.get('/blockchain/blocks', (req, res) => {
            res.status(200).send(blockchain.getAllBlocks());
        });

        this.app.get('/blockchain/blocks/latest', (req, res) => {
            let lastBlock = blockchain.getLastBlock();
            if (lastBlock == null) throw new HTTPError(404, 'Last block not found');

            res.status(200).send(lastBlock);
        });

        this.app.put('/blockchain/blocks/latest', (req, res) => {
            let requestBlock = Block.fromJson(req.body);
            let result = node.checkReceivedBlock(requestBlock);

            if (result == null) res.status(200).send('Requesting the blockchain to check.');
            else if (result) res.status(200).send(requestBlock);
            else throw new HTTPError(409, 'Blockchain is update.');
        });

        this.app.get('/blockchain/blocks/:hash([a-zA-Z0-9]{64})', (req, res) => {
            let blockFound = blockchain.getBlockByHash(req.params.hash);
            if (blockFound == null) throw new HTTPError(404, `Block not found with hash '${req.params.hash}'`);

            res.status(200).send(blockFound);
        });

        this.app.get('/blockchain/blocks/:index', (req, res) => {
            let blockFound = blockchain.getBlockByIndex(parseInt(req.params.index));
            if (blockFound == null) throw new HTTPError(404, `Block not found with index '${req.params.index}'`);

            res.status(200).send(blockFound);
        });

        this.app.get('/blockchain/blocks/transactions/:transactionId([a-zA-Z0-9]{64})', (req, res) => {
            let transactionFromBlock = blockchain.getTransactionFromBlocks(req.params.transactionId);
            if (transactionFromBlock == null) throw new HTTPError(404, `Transaction '${req.params.transactionId}' not found in any block`);

            res.status(200).send(transactionFromBlock);
        });

        this.app.get('/blockchain/transactions', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/transactions/index.pug', {
                    pageTitle: 'Unconfirmed Transactions',
                    transactions: blockchain.getAllUnconfirmedTransactions()
                });
            else
                res.status(200).send(blockchain.getAllUnconfirmedTransactions());
        });

        this.app.post('/blockchain/transactions', (req, res) => {
            let requestTransaction = Transaction.fromJson(req.body);
            let transactionFound = blockchain.getTransactionById(requestTransaction.id);

            if (transactionFound != null) throw new HTTPError(409, `Transaction '${requestTransaction.id}' already exists`);

            try {
                let newTransaction = blockchain.addTransaction(requestTransaction);
                res.status(201).send(newTransaction);
            } catch (ex) {
                if (ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, requestTransaction, ex);
                else throw ex;
            }
        });

        this.app.get('/blockchain/transactions/unspent', (req, res) => {
            res.status(200).send(blockchain.getUnspentTransactionsForAddress(req.query.address));
        });

        this.app.get('/operator/wallets', (req, res) => {
            let wallets = operator.getWallets();

            let projectedWallets = R.map(projectWallet, wallets);

            res.status(200).send(projectedWallets);
        });

        this.app.post('/operator/wallets', (req, res) => {
            let password = req.body.password;
            if (R.match(/\w/g, password).length <= 4) throw new HTTPError(400, 'Password must contain more than 4 words');

            let newWallet = operator.createWalletFromPassword(password);

            let projectedWallet = projectWallet(newWallet);

            res.status(201).send(projectedWallet);
        });

        this.app.get('/operator/wallets/:walletId', (req, res) => {
            let walletFound = operator.getWalletById(req.params.walletId);
            if (walletFound == null) throw new HTTPError(404, `Wallet not found with id '${req.params.walletId}'`);

            let projectedWallet = projectWallet(walletFound);

            res.status(200).send(projectedWallet);
        });

        this.app.post('/operator/wallets/:walletId/transactions', (req, res) => {
            let walletId = req.params.walletId;
            let password = req.headers.password;

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newTransaction = operator.createTransaction(walletId, req.body.fromAddress, req.body.toAddress, req.body.amount, req.body['changeAddress'] || req.body.fromAddress);

                newTransaction.check();

                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.status(201).send(transactionCreated);
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        // 考勤交易
        this.app.post('/operator/attendance', (req, res) => {
            try {
                // 1. 获取请求参数
                const { studentId, password, courseId, verifyCode } = req.body;

                // 参数验证
                if (!studentId || !password || !courseId || !verifyCode) {
                    throw new HTTPError(400, 'Missing required parameters');
                }

                // 2. 获取学生的公钥和加密的私钥
                const studentKeys = operator.getStudentKeys(studentId);
                if (!studentKeys) {
                    throw new HTTPError(404, `Student not found with ID: ${studentId}`);
                }

                // 3. 获取课程的公钥
                const coursePublicKey = operator.getCoursePublicKey(courseId);
                if (!coursePublicKey) {
                    throw new HTTPError(404, `Course not found with ID: ${courseId}`);
                }

                // 4. 使用密码解密学生私钥
                const decryptedSecretKey = SymmetricCrypto.decrypt(studentKeys.encryptedSecretKey, password);
                if (!decryptedSecretKey) {
                    throw new HTTPError(401, 'Invalid password');
                }

                // 5. 创建考勤交易
                const newTransaction = operator.createAttendanceTransaction(
                    studentKeys.publicKey,    // 学生公钥（发送方地址）
                    coursePublicKey,          // 课程公钥（接收方地址）
                    decryptedSecretKey,       // 解密后的学生私钥（用于签名）
                    studentId,                // 学生ID（元数据）
                    courseId,                 // 课程ID（元数据）
                    verifyCode                // 验证码（元数据）
                );

                // 6. 验证交易
                newTransaction.check();

                // 7. 添加到区块链
                const transactionCreated = blockchain.addTransaction(newTransaction);
                
                // 8. 返回成功响应
                res.status(201).send({
                    message: 'Attendance recorded successfully',
                    transaction: transactionCreated
                });

            } catch (ex) {
                // 错误处理
                if (ex instanceof ArgumentError) {
                    throw new HTTPError(400, ex.message);
                } else if (ex instanceof TransactionAssertionError) {
                    throw new HTTPError(400, ex.message);
                } else {
                    throw new HTTPError(500, 'Internal server error', null, ex);
                }
            }
        });
        
        //学生注册，输入学号和密码，返回公钥和私钥
        this.app.post('/operator/studentRegister', (req, res) => {
            let studentId = req.body.studentId;
            let password = req.body.password;
            
            //这里可以添加数据库逻辑,检查学生是否能够注册
            let isIdInList = operator.checkIdInList(studentId);
            if (!isIdInList) throw new HTTPError(400, `Student ID '${studentId}' is not in the allowed list`);

            try {
                let student = operator.createWallet(studentId,password);
                let faucetAddress = Config.FAUCET_ADDRESS;
                console.log("sign");
                console.log(student.walletId);
                
                // 50为初始余额
                // let faucetWalletId = Config.FAUCET_WALLET_ID;
                let newTransaction = operator.createStudentRegisterTransaction(student.walletId, faucetAddress, student.publicKey, 
                                                                        studentId, student.publicKey,student.encryptedSecretKey,0, 50);
       
                  //                                                      
                // 检查交易
                newTransaction.check();

                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.status(201).send({student, transactionCreated});

            }catch(ex){
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, studentId, ex);
                else throw ex;
            }
        });

         //教师注册，输入教师号和密码，返回公钥和私钥
        this.app.post('/operator/teacherRegister', (req, res) => {
            let teacherId = req.body.teacherId;
            let password = req.body.password;
            //这里可以添加数据库逻辑
            let isIdInList = operator.checkIdInList(teacherId);
            if (!isIdInList) throw new HTTPError(400, `Teacher ID '${teacherId}' is not in the allowed list`);

            try {
                let teacher = operator.createWallet(teacherId, password);
                let faucetAddress = Config.FAUCET_ADDRESS;
                console.log("sign");
                console.log(teacher.encryptedSecretKey);
                // 50为初始余额
                let faucetWalletId = Config.FAUCET_WALLET_ID;
                let newTransaction = operator.createTeacherRegisterTransaction(teacher.walletId, faucetAddress, teacher.publicKey, 
                                                                        teacherId, teacher.publicKey, teacher.encryptedSecretKey, 50);
                // 检查交易
                newTransaction.check();

                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.status(201).send({teacher, transactionCreated});

            }catch(ex){
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, teacherId, ex);
                else throw ex;
            }
        });

        // 注册Course,输入教师ID和课程ID，返回公钥和私钥
        // 这时候后教师ID已经注册过有了唯一的钱包ID，是在这钱包ID下注册程地址
        
        this.app.post('/operator/courseRegister', (req, res) => {
            let teacherId = req.body.teacherId;
            let courseId = req.body.courseId;
            try {
                let course = operator.createWallet(teacherId, courseId);
                let faucetAddress = Config.FAUCET_ADDRESS;
                console.log("sign");
                console.log(course.walletId);
                // 50为初始余额
                let faucetWalletId = Config.FAUCET_WALLET_ID;
                let newTransaction = operator.createCourseTransaction(faucetAddress, course.publicKey, teacherId, 
                    courseId, course.publicKey, course.encryptedSecretKey);
                                                              
                // 检查交易
                newTransaction.check();

                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.status(201).send({course, transactionCreated});

            }catch(ex){
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, teacherId, ex);
                else throw ex;
            }
        });

        // Lesson发布交易

        this.app.post('/operator/lessonPublish', (req, res) => {
            let teacherId = req.body.teacherId;
            let courseId = req.body.courseId;
            let verifyCode = req.body.verifyCode;

            try {
                // 检查必要参数
                if (!teacherId || !courseId || !verifyCode) {
                    throw new ArgumentError('Missing required parameters');
                }

                // 获取课程信息
                let courseKey = operator.getRegisterInfoByCourseId(courseId);
                if (!courseKey) {
                    throw new ArgumentError(`Course not found with id '${courseId}'`);
                }

                // 解密课程私钥
                let courseSecretKey = SymmetricCrypto.decrypt(courseKey.encryptedSecretKey, courseId);
                if (!courseSecretKey) {
                    throw new ArgumentError('Failed to decrypt course secret key');
                }

                let faucetAddress = Config.FAUCET_ADDRESS;
                let faucetSecretKey = Config.FAUCET_SECRET_KEY;

                // 创建课程发布交易
                let newTransaction = operator.createLessonTransaction(
                    faucetAddress,
                    courseKey.publicKey,
                    teacherId,
                    courseId,
                    courseSecretKey,
                    faucetSecretKey,
                    verifyCode
                );

                // 检查交易
                newTransaction.check();

                // 添加到区块链
                let transactionCreated = blockchain.addTransaction(newTransaction);
                res.status(201).send(transactionCreated);
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) {
                    throw new HTTPError(400, ex.message, null, ex);
                } else {
                    throw ex;
                }
            }
        }); 
        //学生加入课程
        // 在 httpServer/index.js 中添加路由
        this.app.post('/operator/enrollCourse', (req, res) => {
            try {
                const { 
                    studentId,
                    password, 
                    teacherId, 
                    courseId 
                } = req.body;

                // 参数验证
                if (!studentId || !password || !teacherId || !courseId) {
                    throw new Error('Missing required parameters');
                }

                // 1. 获取学生的公钥和加密的私钥
                const studentKeys = operator.getStudentKeys(studentId);
                if (!studentKeys) {
                    throw new HTTPError(404, `Student not found with ID: ${studentId}`);
                }

                // 2. 使用密码解密私钥
                const studentSecretKey = SymmetricCrypto.decrypt(studentKeys.encryptedSecretKey, password);
                if (!studentSecretKey) {
                    throw new HTTPError(401, 'Invalid password');
                }

                // 3. 获取课程的公钥
                const coursePublicKey = operator.getCoursePublicKey(courseId);
                if (!coursePublicKey) {
                    throw new HTTPError(404, `Course not found with ID: ${courseId}`);
                }

                // 4. 创建登记交易
                const transaction = operator.createEnrollTransaction(
                    studentKeys.publicKey,    // 学生公钥
                    studentSecretKey,         // 解密后的学生私钥
                    coursePublicKey,          // 课程公钥
                    studentId,                // 学生ID
                    teacherId,                // 教师ID
                    courseId                  // 课程ID
                );

                // 5. 添加到区块链
                const transactionCreated = blockchain.addTransaction(transaction);
                
                res.status(201).send({
                    message: '课程登记成功',
                    transaction: transactionCreated
                });

            } catch (ex) {
                if (ex instanceof HTTPError) {
                    throw ex;
                } else {
                    throw new HTTPError(400, ex.message);
                }
            }
        });


        this.app.get('/operator/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            try {
                let addresses = operator.getAddressesForWallet(walletId);
                res.status(200).send(addresses);
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.post('/operator/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            let password = req.headers.password;

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newAddress = operator.generateAddressForWallet(walletId);
                res.status(201).send({ address: newAddress });
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });
        // 查询地址余额
        this.app.get('/operator/balance', (req, res) => {
            let addressId = req.query.addressId;

            try {
                let balance = operator.getBalanceForAddress(addressId);
                res.status(200).send({ balance: balance });
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(404, ex.message, { addressId }, ex);
                else throw ex;
            }
        });

        this.app.get('/node/peers', (req, res) => {
            res.status(200).send(node.peers);
        });

        this.app.post('/node/peers', (req, res) => {
            let newPeer = node.connectToPeer(req.body);
            res.status(201).send(newPeer);
        });

        this.app.get('/node/transactions/:transactionId([a-zA-Z0-9]{64})/confirmations', (req, res) => {
            node.getConfirmations(req.params.transactionId)
                .then((confirmations) => {
                    res.status(200).send({ confirmations: confirmations });
                });
        });
        // 挖矿
        this.app.post('/miner/mine', (req, res, next) => {
            miner.mine(req.body.rewardAddress, req.body['feeAddress'] || req.body.rewardAddress)
                .then((newBlock) => {
                    newBlock = Block.fromJson(newBlock);
                    blockchain.addBlock(newBlock);
                    res.status(201).send(newBlock);
                })
                .catch((ex) => {
                    if (ex instanceof BlockAssertionError && ex.message.includes('Invalid index')) next(new HTTPError(409, 'A new block were added before we were able to mine one'), null, ex);
                    else next(ex);
                });
        });
        ////////////////// 查询考勤记录
        this.app.get('/query/attendance', (req, res) => {
            try {
                const { courseId, studentId, startDate, endDate } = req.query;
                
                // 参数验证
                if (!courseId) {
                    throw new Error('courseId is required');
                }

                let allTransactions = blockchain.getAllTransactions();
                
                // 筛选考勤记录
                let attendanceRecords = allTransactions
                    .filter(transaction => {
                        const metadata = transaction.data?.metadata;
                        let isMatch = transaction.type === 'attendance' && 
                                    metadata?.category === 'attendance' && 
                                    metadata?.courseId === courseId;

                        // 如果提供了学生ID，进一步筛选
                        if (isMatch && studentId) {
                            isMatch = metadata.studentId === studentId;
                        }

                        // 如果提供了日期范围，进一步筛选
                        if (isMatch && (startDate || endDate)) {
                            const recordDate = new Date(metadata.timestamp);
                            if (startDate && new Date(startDate) > recordDate) return false;
                            if (endDate && new Date(endDate) < recordDate) return false;
                        }

                        return isMatch;
                    })
                    .map(transaction => {
                        const metadata = transaction.data.metadata;
                        return {
                            studentId: metadata.studentId,
                            courseId: metadata.courseId,
                            verifyCode: metadata.verifyCode,
                            timestamp: metadata.timestamp,
                            status: 'Present',  // 如果有考勤记录就是出席
                            checkInTime: new Date(metadata.timestamp).toLocaleTimeString()
                        };
                    });

                // 如果是查询特定学生，计算出勤率
                if (studentId) {
                    // 获取该课程的所有考勤时间点
                    const allClassDates = [...new Set(attendanceRecords.map(r => 
                        new Date(r.timestamp).toLocaleDateString()
                    ))];

                    const attendanceRate = (attendanceRecords.length / allClassDates.length) * 100;

                    res.status(200).send({
                        success: true,
                        total: attendanceRecords.length,
                        totalClasses: allClassDates.length,
                        attendanceRate: Math.round(attendanceRate),
                        records: attendanceRecords
                    });
                } else {
                    // 按日期分组统计
                    const groupedRecords = attendanceRecords.reduce((acc, record) => {
                        const date = new Date(record.timestamp).toLocaleDateString();
                        if (!acc[date]) {
                            acc[date] = {
                                date,
                                totalStudents: 0,
                                presentCount: 0,
                                absentCount: 0,
                                timestamp: record.timestamp,
                                students: []
                            };
                        }
                        acc[date].totalStudents++;
                        acc[date].presentCount++;
                        acc[date].students.push(record);
                        acc[date].attendanceRate = Math.round((acc[date].presentCount / acc[date].totalStudents) * 100);
                        return acc;
                    }, {});

                    res.status(200).send({
                        success: true,
                        total: Object.keys(groupedRecords).length,
                        records: Object.values(groupedRecords)
                    });
                }
                
            } catch (ex) {
                res.status(400).send({
                    success: false,
                    message: ex.message
                });
            }
        });
        ////////////////// 查询学生是否注册
        this.app.get('/query/checkStudent', (req, res) => {
            try {
                const { studentId } = req.query;
                
                // 参数验证
                if (!studentId) {
                    throw new Error('studentId 是必需的参数');
                }

                let allTransactions = blockchain.getAllTransactions();
                
                // 检查是否存在学生注册交易
                const isStudentExists = allTransactions.some(transaction => {
                    // 检查交易类型是否为学生注册，并且studentId匹配
                    return transaction.type === 'register' && 
                           transaction.data && 
                           transaction.data.metadata && 
                           transaction.data.metadata.studentId === studentId;
                });

                res.status(200).send({
                    exists: isStudentExists,
                    message: isStudentExists ? '该学生已注册' : '该学生未注册'
                });
                
            } catch (ex) {
                throw new HTTPError(400, ex.message);
            }
        });

        // 查询教师是否可以注册
        this.app.get('/query/checkTeacher', (req, res) => {
            try {
                const { teacherId } = req.query;
                
                // 参数验证
                if (!teacherId) {
                    throw new Error('teacherId 是必需的参数');
                }

                // 检查教师ID是否在允许列表中
                const isTeacherAllowed = operator.checkIdInList(teacherId);
                
                // 检查是否已经注册
                let allTransactions = blockchain.getAllTransactions();
                const isTeacherExists = allTransactions.some(transaction => {
                    return transaction.type === 'register' && 
                           transaction.data && 
                           transaction.data.metadata && 
                           transaction.data.metadata.teacherId === teacherId;
                });

                res.status(200).send({
                    exists: isTeacherExists,
                    allowed: isTeacherAllowed,
                    message: isTeacherExists ? '该教师已注册' : 
                            !isTeacherAllowed ? '该教师ID不在允许注册列表中' : 
                            '该教师可以注册'
                });
                
            } catch (ex) {
                throw new HTTPError(400, ex.message);
            }
        });

        // 查询教师注册的课程
        this.app.get('/query/teacherCourses', (req, res) => {
            try {
                const { teacherId } = req.query;
                
                // 参数验证
                if (!teacherId) {
                    throw new Error('teacherId is required');
                }

                // 调用 operator 中的方法获取教师课程
                const teacherCourses = operator.getTeacherCourses(teacherId);
                
                // 返回标准格式的 JSON 响应
                res.status(200).send({
                    success: true,
                    total: teacherCourses.length,
                    courses: teacherCourses,
                    message: `Found ${teacherCourses.length} courses`
                });
                
            } catch (ex) {
                // 错误处理
                res.status(400).send({
                    success: false,
                    message: ex.message
                });
            }
        });

        // 查询学生选课列表
        this.app.get('/query/studentEnrolledCourses', (req, res) => {
            try {
                const { studentId } = req.query;
                
                // 参数验证
                if (!studentId) {
                    throw new Error('studentId is required');
                }

                // 调用 operator 中的方法获取选课列表
                const enrolledCourses = operator.getStudentEnrolledCourses(studentId);
                
                res.status(200).send({
                    success: true,
                    total: enrolledCourses.total,
                    courses: enrolledCourses.courses,
                    message: `找到 ${enrolledCourses.total} 门已选课程`
                });
            } catch (ex) {
                throw new HTTPError(400, ex.message);
            }
        });

        // 查询课程选课学生列表
        this.app.get('/query/courseEnrolledStudents', (req, res) => {
            try {
                const { courseId } = req.query;
                
                // 参数验证
                if (!courseId) {
                    throw new Error('courseId is required');
                }

                // 调用 operator 中的方法获取选课学生列表
                const enrolledStudents = operator.getCourseEnrolledStudents(courseId);
                
                res.status(200).send({
                    success: true,
                    total: enrolledStudents.total,
                    students: enrolledStudents.students,
                    message: `找到 ${enrolledStudents.total} 名选课学生`
                });
            } catch (ex) {
                throw new HTTPError(400, ex.message);
            }
        });

        // 查询课程历史验证码
        this.app.get('/query/courseLessonHistory', (req, res) => {
            try {
                const { courseId } = req.query;
                
                // 参数验证
                if (!courseId) {
                    throw new Error('courseId is required');
                }

                // 调用 operator 中的方法获取课程历史记录
                const lessonHistory = operator.getCourseLessonHistory(courseId);
                
                res.status(200).send({
                    success: true,
                    total: lessonHistory.total,
                    lessons: lessonHistory.lessons,
                    message: `找到 ${lessonHistory.total} 条课程记录`
                });
            } catch (ex) {
                throw new HTTPError(400, ex.message);
            }
        });

        // 查询学生余额
        this.app.get('/query/studentBalance', (req, res) => {
            try {
                const { studentId } = req.query;
                
                // 参数验证
                if (!studentId) {
                    throw new Error('studentId is required');
                }

                // 获取学生公钥
                const studentKeys = operator.getStudentKeys(studentId);
                if (!studentKeys) {
                    throw new HTTPError(404, `Student not found with ID: ${studentId}`);
                }

                // 使用公钥查询余额
                const balance = operator.getBalanceForAddress(studentKeys.publicKey);

                res.status(200).send({
                    success: true,
                    studentId: studentId,
                    publicKey: studentKeys.publicKey,
                    balance: balance,
                    message: `当前余额: ${balance}`
                });

            } catch (ex) {
                res.status(ex.status || 400).send({
                    success: false,
                    message: ex.message
                });
            }
        });

        // 学生挖矿
        this.app.post('/miner/studentMine', (req, res, next) => {
            try {
                const { studentId } = req.body;
                
                // 参数验证
                if (!studentId) {
                    throw new Error('studentId is required');
                }

                // 获取学生公钥作为奖励地址
                const studentKeys = operator.getStudentKeys(studentId);
                if (!studentKeys) {
                    throw new HTTPError(404, `Student not found with ID: ${studentId}`);
                }

                // 使用学生公钥作为奖励地址进行挖矿
                miner.mine(studentKeys.publicKey, studentKeys.publicKey)
                    .then((newBlock) => {
                        newBlock = Block.fromJson(newBlock);
                        blockchain.addBlock(newBlock);
                        res.status(201).send({
                            success: true,
                            studentId: studentId,
                            blockHash: newBlock.hash,
                            reward: Config.MINING_REWARD,
                            message: `挖矿成功! 区块哈希: ${newBlock.hash}`
                        });
                    })
                    .catch((ex) => {
                        if (ex instanceof BlockAssertionError && ex.message.includes('Invalid index')) {
                            next(new HTTPError(409, 'A new block were added before we were able to mine one'), null, ex);
                        } else {
                            next(ex);
                        }
                    });

            } catch (ex) {
                res.status(ex.status || 400).send({
                    success: false,
                    message: ex.message
                });
            }
        });

        this.app.use(function (err, req, res, next) {  // eslint-disable-line no-unused-vars
            if (err instanceof HTTPError) res.status(err.status);
            else res.status(500);
            res.send(err.message + (err.cause ? ' - ' + err.cause.message : ''));
        });

        // 登录
        this.app.post('/operator/login', (req, res) => {
            try {
                const { userId, password } = req.body;
        
            if (!userId || !password) {
                throw new HTTPError(400, 'Missing required parameters');
            }

            const loginResult = operator.createLoginTransaction(userId, password);
            
            // 将交易添加到区块链
            const transactionCreated = blockchain.addTransaction(loginResult.transaction);

            res.status(200).send({
                success: true,
                userType: loginResult.userType,
                publicKey: loginResult.publicKey,
                transaction: transactionCreated,
                message: 'Login successful'
        });

    } catch (ex) {
        res.status(ex.status || 400).send({
            success: false,
            message: ex.message
        });
            }
        });

        




    
    }

    

    listen(host, port) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, host, (err) => {
                if (err) reject(err);
                console.info(`Listening http on port: ${this.server.address().port}, to access the API documentation go to http://${host}:${this.server.address().port}/api-docs/`);
                resolve(this);
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) reject(err);
                console.info('Closing http');
                resolve(this);
            });
        });
    }
}

module.exports = HttpServer;