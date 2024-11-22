const R = require('ramda');

const projectWallet = (wallet) => {
    return {
        id: wallet.id,
        addresses: R.map((keyPair) => {
            return keyPair.publicKey;
        }, wallet.keyPairs)
    };
};

module.exports = projectWallet;
