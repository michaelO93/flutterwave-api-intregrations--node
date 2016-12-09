/**
 * Created by michael-prime on 12/2/16.
 */
var crypto = require('crypto-js');
var forge = require('node-forge');
var utf8 = require('utf8');

module.exports = {

    encrypt: function (key, text) {
        key = crypto.MD5(utf8.encode(key)).toString(crypto.enc.Latin1);
        key = key + key.substring(0, 8);

        var cipher = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
        cipher.start({iv: ''});
        cipher.update(forge.util.createBuffer('text', utf8));
        cipher.finish();
        var encrypted = cipher.output;
        return (forge.util.encode64(encrypted.getBytes()));
    }

}