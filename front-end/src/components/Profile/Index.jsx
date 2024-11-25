import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, getWalletBalance } from '../../services/api';
import Button from '../common/Button/Index';
import '../../css/Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'wallet' or 'settings'
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [settings, setSettings] = useState({
    allowMining: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
    if (activeTab === 'wallet') {
      fetchWalletBalance();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setUserProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      alert('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      setLoading(true);
      const response = await getWalletBalance();
      setWalletBalance(response.data.balance);
    } catch (error) {
      alert('Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await updateUserProfile({
        ...formData,
        settings: settings // 包含设置信息
      });
      alert('Profile updated successfully');
      await fetchUserProfile();
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          Wallet
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'profile' ? (
        <>
          <h2 className="profile-title">Personal Profile</h2>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <Button 
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Update Profile
            </Button>
          </form>
        </>
      ) : activeTab === 'wallet' ? (
        <div className="wallet-section">
          <h2 className="profile-title">My Wallet</h2>
          <div className="wallet-card">
            <div className="balance-info">
              <div className="balance-label">Current Balance</div>
              <div className="balance-amount">${walletBalance.toFixed(2)}</div>
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
      ) : (
        <div className="settings-section">
          <h2 className="profile-title">Settings</h2>
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allowMining"
                  checked={settings.allowMining}
                  onChange={handleSettingChange}
                />
                Allow Mining
              </label>
            </div>

            <Button 
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Save Settings
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;