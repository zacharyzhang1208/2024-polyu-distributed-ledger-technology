const SymmetricCrypto = require('../lib/util/symmetricCrypto');

// 假设这是原始数据
const originalData = "2540ac5131a22d8eadaa5ee8050b536f342c831c9a705140246aee7b1c82718eabd23014a68b1ddee28d7c43e3fcae131efef40fa37e82274c5be36bc4c4c009118cfd71a48b6ccd8f80a79c87a8a8104b6cfb9b665a5e422618279f40e8d996afb4868546ccedda6b7710dc9ddf2db42b7f202ee419494d53245cbf36d20b358351fa5797debf3ade1f258546a0d1ab297e0572fa55ed6dbf9770058a4b13f5fc04103bd11404821ea3eb0f0545ac910dada77bb65b2f600dd4dce33cc811483e19e677b61c38b727876b8d7324b48ac9affa7940f8c7a8f292363c5f41996a3783bdf752a8258f50d3866c54180f7d5f0cdef90672deeab4c4f33dd1f0ea8118b9388fd2866200ad036bc8711be7fb74ee9b00f4143d4e7ac5b1e4fc809eb073106f78ad9384726ec4a4575335429badffc8a9f6b422d6b80bf2380305d5ad0e62149a38fa5b0a757a1f83a5ffc9524f2d094a87084216cd9654b0d117ca3ce653e664cdfb374816a01c63b596aaae71de0255eb946d5f924c0f9b4ee3a868e3bc8fd8051f3831180a73f793876cf17e7b3c975c08b6ccf5455e90a96d1439902efe5135b318d3a919109ce23aa835227911313dee8cf88a9b4098e85cd7dc4132999b029300629ebf50c18bdb59aae33799da52184eddf52f87b5b2c79345415dd34163f9c960be02cfb7afe08080814387e8fc948487a799d3a6b6db4847";
const password = "myPassword123";

// 1. 加密数据
const encryptedData = SymmetricCrypto.encrypt(originalData, password);
console.log('加密后的数据:', encryptedData);
// 输出类似：
// {
//   encrypted: "a1b2c3...",
//   iv: "d4e5f6...",
//   authTag: "g7h8i9..."
// }

// 2. 解密数据
const decryptedData = SymmetricCrypto.decrypt(encryptedData, password);
console.log('解密后的数据:', decryptedData);
// 输出: "这是需要加密的私钥"