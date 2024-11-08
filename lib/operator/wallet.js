const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');

class Wallet {
    constructor() {
        this.id = null;           // 钱包ID
        this.passwordHash = null; // 密码哈希
        this.secret = null;       // 密钥种子
        this.keyPairs = [];       // 密钥对数组
    }

    // 生成新的地址(公钥)
    generateAddress() {
        // 如果是新钱包，先生成密钥种子
        if (this.secret == null) {
            this.generateSecret();
        }

        // 生成新的密钥对
        let lastKeyPair = R.last(this.keyPairs);
        let seed = (lastKeyPair == null ? 
            this.secret : 
            CryptoEdDSAUtil.generateSecret(R.propOr(null, 'secretKey', lastKeyPair)));
        
        // 创建并存储新密钥对
        let keyPairRaw = CryptoEdDSAUtil.generateKeyPairFromSecret(seed);
        let newKeyPair = {
            index: this.keyPairs.length + 1,
            secretKey: CryptoEdDSAUtil.toHex(keyPairRaw.getSecret()),
            publicKey: CryptoEdDSAUtil.toHex(keyPairRaw.getPublic())
        };
        
        this.keyPairs.push(newKeyPair);
        return newKeyPair.publicKey;
    }

    generateSecret() {
        this.secret = CryptoEdDSAUtil.generateSecret(this.passwordHash);
        return this.secret;
    }

    getAddressByIndex(index) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('index', index), this.keyPairs));
    }

    getAddressByPublicKey(publicKey) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('publicKey', publicKey), this.keyPairs));
    }

    getSecretKeyByAddress(address) {
        return R.propOr(null, 'secretKey', R.find(R.propEq('publicKey', address), this.keyPairs));
    }

    getAddresses() {
        return R.map(R.prop('publicKey'), this.keyPairs);
    }

    static fromPassword(password) {
        let wallet = new Wallet();
        wallet.id = CryptoUtil.randomId();
        wallet.passwordHash = CryptoUtil.hash(password);
        return wallet;
    }

    static fromHash(passwordHash) {
        let wallet = new Wallet();
        wallet.id = CryptoUtil.randomId();
        wallet.passwordHash = passwordHash;
        return wallet;
    }

    static fromJson(data) {
        let wallet = new Wallet();
        R.forEachObjIndexed((value, key) => { wallet[key] = value; }, data);
        return wallet;
    }
}

module.exports = Wallet;