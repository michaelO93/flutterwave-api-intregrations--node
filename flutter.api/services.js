var q = require('q');
var unirest = require('unirest');
var dotenv = require('dotenv');
var CryptoJS = require('crypto-js');
var forge = require('node-forge');
var Token = require('./model/tokensave');

var utf8 = require("utf8");
dotenv.load({path: '.env'});

var baseUrl = process.env.apiUrl;

module.exports = {

    encrypt: function (key, text) {
        text = (text) ? text.toString() : '';
        key = CryptoJS.MD5(utf8.encode(key)).toString(CryptoJS.enc.Latin1);
        key = key + key.substring(0, 8);
        var cipher = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
        cipher.start({iv: ''});
        cipher.update(forge.util.createBuffer(text, 'utf-8'));
        cipher.finish();
        var encrypted = cipher.output;
        return ( forge.util.encode64(encrypted.getBytes()) );
    },

    chargeCard: function (data) {
        var deferred = q.defer();
        console.log(data);
        unirest.post(baseUrl + '/card/mvva/pay')
            .headers({
                'Content-Type': 'application/json'
            })
            .send(data)
            .end(function (response) {
                console.log(response);
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    validateCard: function (data) {
        var deferred = q.defer();

        unirest.post(baseUrl + '/card/mvva/pay/validate')
            .headers({
                'Content-Type': 'application/json'
            })
            .send(data)
            .end(function (response) {
                if (response.body.status === 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body)
            });
        return deferred.promise;
    },

    verifyCardBIN: function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/fw/check')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                else {
                    deferred.reject(response.body);
                }
            });
        return deferred.promise;
    },

    checkBVN: function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/bvn/verify/')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body)
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    verifyBVN: function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/bvn/validate/')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body)
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    linkaccount: function (data) {
        console.log(data);
        var deferred = q.defer();
        unirest.post(baseUrl + '/pay/linkaccount')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    unlinkAccount: function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/pay/unlinkaccount')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },


    validateAccountStep1: function (data) {
        console.log(data);
        var deferred = q.defer();
        unirest.post(baseUrl + '/pay/linkaccount/validate')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    validateAccountStep2: function (data) {
        console.log(data);
        var deferred = q.defer();
        unirest.post(baseUrl + '/pay/linkaccount/validate')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    Disburse: function (data) {
        console.log(data);
        var deferred = q.defer();
        unirest.post(baseUrl + '/pay/send')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    generateUniqueTransactionRef: function () {
        var prefix = 'MOA?';
        var shortid = require('shortid');
        var key = shortid.generate();
        return prefix.concat(key);
    },

    getTokenFromDb : function () {
        var deferred = q.defer();
        Token.findOne({_id: 3},function (err,response) {
            if(err){
                console.log(err);
                deferred.reject(err);
            }
            console.log(response);
            deferred.resolve(response);
        });
        return deferred.promise;
    },

    getTransactionStatus: function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/pay/status')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },
    
    getlinkedAcconts : function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/pay/getlinkedaccounts')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },


    /*
    PRE - AUTHS
    */

    tokenizeCard:function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/card/mvva/tokenize')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    },

    preAuth: function (data) {
        var deferred = q.defer();
        unirest.post(baseUrl + '/card/mvva/preauthorize')
            .headers({
                'Content-Type': 'application/json'
            }).send(data)
            .end(function (response) {
                if (response.body.status == 'success') {
                    deferred.resolve(response.body);
                }
                deferred.reject(response.body);
            });
        return deferred.promise;
    }
};