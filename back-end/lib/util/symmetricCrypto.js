const crypto = require('crypto');

class SymmetricCrypto {
    static encrypt(text, password) {
        try {
            // 使用密码生成密钥和初始化向量
            const key = crypto.scryptSync(password, 'salt', 32);
            const iv = crypto.randomBytes(16);

            // 创建加密器
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

            // 加密数据
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // 获取认证标签
            const authTag = cipher.getAuthTag();

            // 返回加密后的数据、IV和认证标签
            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            throw new Error('Encryption failed: ' + error.message);
        }
    }

    static decrypt(encryptedData, password) {
        try {
            // 使用密码生成密钥
            const key = crypto.scryptSync(password, 'salt', 32);
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const authTag = Buffer.from(encryptedData.authTag, 'hex');

            // 创建解密器
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);

            // 解密数据
            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error('Decryption failed: ' + error.message);
        }
    }
}

module.exports = SymmetricCrypto;