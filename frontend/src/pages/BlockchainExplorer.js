import React, { useState, useEffect } from 'react';
import { Card, Table, Tabs, Typography } from 'antd';
import { blockchainService } from '../services/blockchainService';

const { TabPane } = Tabs;
const { Text } = Typography;

const BlockchainExplorer = () => {
    const [blocks, setBlocks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBlockchainData();
    }, []);

    // 加载区块链数据
    const loadBlockchainData = async () => {
        setLoading(true);
        try {
            const [blocksData, txData] = await Promise.all([
                blockchainService.getAllBlocks(),
                blockchainService.getAllTransactions()
            ]);
            setBlocks(blocksData);
            setTransactions(txData);
        } catch (error) {
            message.error('加载区块链数据失败：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const blockColumns = [
        { 
            title: '区块高度', 
            dataIndex: 'index',
            key: 'index' 
        },
        { 
            title: '区块哈希', 
            dataIndex: 'hash',
            render: hash => <Text copyable>{hash}</Text>
        },
        { 
            title: '前块哈希', 
            dataIndex: 'previousHash',
            render: hash => <Text copyable>{hash}</Text>
        },
        { 
            title: '时间戳', 
            dataIndex: 'timestamp',
            render: ts => new Date(ts * 1000).toLocaleString()
        },
        { 
            title: '交易数量', 
            dataIndex: 'transactions',
            render: txs => txs.length
        }
    ];

    const transactionColumns = [
        { 
            title: '交易ID', 
            dataIndex: 'id',
            render: id => <Text copyable>{id}</Text>
        },
        { 
            title: '类型', 
            dataIndex: 'type' 
        },
        { 
            title: '时间戳', 
            dataIndex: ['data', 'timestamp'],
            render: ts => new Date(ts * 1000).toLocaleString()
        },
        { 
            title: '详情', 
            dataIndex: 'data',
            render: data => {
                switch(data.type) {
                    case 'attendance':
                        return `学生${data.studentId}的考勤记录`;
                    case 'register':
                        return `${data.role}注册`;
                    default:
                        return JSON.stringify(data);
                }
            }
        }
    ];

    return (
        <div className="blockchain-explorer">
            <h2>区块链浏览器</h2>

            <Tabs defaultActiveKey="blocks">
                <TabPane tab="区块列表" key="blocks">
                    <Card>
                        <Table
                            dataSource={blocks}
                            columns={blockColumns}
                            rowKey="hash"
                            loading={loading}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="交易列表" key="transactions">
                    <Card>
                        <Table
                            dataSource={transactions}
                            columns={transactionColumns}
                            rowKey="id"
                            loading={loading}
                        />
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default BlockchainExplorer; 