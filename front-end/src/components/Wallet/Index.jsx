import React, { useState, useEffect } from 'react';
import { getWalletBalance, startMining } from '../../services/api';
import Button from '../common/Button/Index';
import '../../css/Wallet.css';

const Wallet = () => {
  const [loading, setLoading] = useState(false);
  const [miningLoading, setMiningLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [settings, setSettings] = useState({
    allowMining: false,
  });

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('User information not found');
      }
      
      const response = await getWalletBalance(user.id);
      setWalletBalance(response.balance || 0);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      alert('Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMining = async (e) => {
    e.preventDefault(); // 防止表单提交
    try {
      setMiningLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
      if (!user || !user.id) {
        throw new Error('User information not found');
      }

      const response = await startMining(user.id);
      console.log('Mining started:', response);
      
      if (response.success) {
        alert('Mining started successfully!');
        // 开始挖矿后刷新余额
        await fetchWalletBalance();
      } else {
        throw new Error(response.message || 'Failed to start mining');
      }
    } catch (error) {
      console.error('Failed to start mining:', error);
      alert(error.message || 'Failed to start mining');
      // 如果挖矿失败，关闭挖矿开关
      setSettings(prev => ({
        ...prev,
        allowMining: false
      }));
    } finally {
      setMiningLoading(false);
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return <div className="wallet-loading">Loading...</div>;
  }

  return (
    <div className="wallet-container">
      <div className="wallet-sections">
        {/* Wallet Section */}
        <div className="section-card">
          <h2 className="section-title">My Wallet</h2>
          <div className="wallet-card">
            <div className="balance-info">
              <div className="balance-label">Current Balance</div>
              <div className="balance-amount">
                ${typeof walletBalance === 'number' ? walletBalance.toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="wallet-actions">
              <Button 
                onClick={fetchWalletBalance}
                loading={loading}
              >
                Refresh Balance
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="section-card">
          <h2 className="section-title">Mining Settings</h2>
          <form className="settings-form" onSubmit={handleStartMining}>
            <div className="settings-group">
              <div className="settings-item">
                <label className="settings-label">
                  <span className="label-text">Allow Mining</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      name="allowMining"
                      checked={settings.allowMining}
                      onChange={handleSettingChange}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <p className="settings-description">
                  Enable this option to participate in mining activities
                </p>
              </div>
            </div>

            {settings.allowMining && (
                <Button 
                  type="submit"
                  loading={miningLoading}
                  disabled={miningLoading}
                >
                  {miningLoading ? 'Starting Mining...' : 'Start Mining'}
                </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Wallet;