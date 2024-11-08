import React, { useState } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const response = await authService.login({
                ...values,
                role
            });
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('userInfo', JSON.stringify(response.userInfo));
            
            message.success('登录成功！');
            navigate(role === 'student' ? '/student' : '/teacher');
        } catch (error) {
            message.error('登录失败：' + error.message);
        }
    };

    return (
        <div className="login-container">
            <Form
                name="login"
                onFinish={onFinish}
                className="login-form"
            >
                <h2>考勤系统登录</h2>
                
                <Form.Item
                    name="id"
                    rules={[{ required: true, message: '请输入ID！' }]}
                >
                    <Input 
                        prefix={<UserOutlined />} 
                        placeholder={role === 'student' ? "学号" : "工号"} 
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码！' }]}
                >
                    <Input.Password 
                        prefix={<LockOutlined />}
                        placeholder="密码"
                    />
                </Form.Item>

                <Form.Item>
                    <Radio.Group value={role} onChange={e => setRole(e.target.value)}>
                        <Radio value="student">学生</Radio>
                        <Radio value="teacher">教师</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        登录
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login; 