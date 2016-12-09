var flutterwave = require("../flutter.api/services");
var AccountToken = require('./model/tokensave');

module.exports = {

    cardCharge: function (req, res, next) {
        var data = {
            "merchantid": process.env.test_merchant_key,
            "amount": flutterwave.encrypt(process.env.test_api_key, req.body.amount),
            "cardno": flutterwave.encrypt(process.env.test_api_key, req.body.cardno),
            "cvv": flutterwave.encrypt(process.env.test_api_key, req.body.cvc),
            "authmodel": flutterwave.encrypt(process.env.test_api_key, req.body.authmodel),
            "currency": flutterwave.encrypt(process.env.test_api_key, req.body.currency),
            "country": flutterwave.encrypt(process.env.test_api_key, req.body.country),
            "custid": flutterwave.encrypt(process.env.test_api_key, req.body.custid),
            "expirymonth": flutterwave.encrypt(process.env.test_api_key, req.body.expirymonth),
            "expiryyear": flutterwave.encrypt(process.env.test_api_key, req.body.expiryyear),
            "narration": flutterwave.encrypt(process.env.test_api_key, req.body.narration)
        };

        if (req.body.authmodel === 'PIN') {
            data.pin = "" + flutterwave.encrypt(process.env.test_api_key, req.body.pin);
        } else if (req.body.authmodel === 'BVN') {
            data.bvn = "" + flutterwave.encrypt(process.env.test_api_key, req.body.bvn);
        } else if (req.body.authmodel === 'VBVSECURECODE') {
            data.responseUrl = "" + flutterwave.encrypt(process.env.test_api_key, req.body.responseUrl);
        }

        flutterwave.chargeCard(data).then(function (response) {
            if (response.data.responsecode == '02' && response.data.otptransactionidentifier != null) {
                var result = response.data;
                req.session.otptransactionidentifier = response.data.otptransactionidentifier;
                return res.render('validate', {message: result});
            }

            if (response.data.responsecode == '00') {
                req.session.result = response.data;
                result = req.session.result;
                return res.render('success', {message: result});

            }

            if (response.data.responsecode != '00' || response.data.responsecode != '02') {

                result = response.data;

                console.log((result));
                return res.render('incomplete-transaction', {message: result});
            }

        }, function (error) {
            console.log(error);
            return res.render('error', {error: error})
        })

    },

    validateCard: function (req, res) {
        var data = {
            "merchantid": process.env.test_merchant_key,
            "otp": flutterwave.encrypt(process.env.test_api_key, req.body.otp),
            "otptransactionidentifier": flutterwave.encrypt(process.env.test_api_key, req.session.otptransactionidentifier)
        };

        console.log(req.session.otptransactionidentifier);
        flutterwave.validateCard(data).then(function (response) {
            var message = response.data;
            req.session.responsetoken = message.responsetoken;
            var token  =  new AccountToken();
            token.responsetoken = response.data.responsetoken;
            if(token){
                token.save(function (err) {
                    if(err){
                        return console.log(err);
                    }
                    return console.log('Hurray we got the token');
                });
            }
            console.log({Result: message});
            return res.render('success', {message: message})
        }, function (error) {
            return res.render('error', {error: error})
        })
    },

    verifyCardBIN: function (req, res) {
        var data = {
            "card6": req.body.card6,
            "pt": req.body.platform
        };

        flutterwave.verifyCardBIN(data).then(function (response) {

            return res.redirect('#card_bin_check');
        }, function (error) {
            return error;
        })
    },

    checkBVN: function (req, res) {
        var data = {
            "otpoption": flutterwave.encrypt(process.env.test_api_key, req.body.authmodel),
            "merchantid": process.env.test_merchant_key,
            "bvn": flutterwave.encrypt(process.env.test_api_key, req.body.bvn)
        };

        req.session.bvn = req.body.bvn;

        flutterwave.checkBVN(data).then(function (response) {
            if (response.data.responseCode == '00') {
                var result = response.data;
                req.session.resp = response.data;
                req.session.otptransactionReference = response.data.transactionReference;
                console.log(req.session.otptransactionReference);
                return res.render('bvn-validate', {message: result});
            }

            if(response.data.responseCode != '00'){
                return res.render('incomplete-transaction',{message: response.data})
            }
        }, function (error) {
            return res.render('error', {error: error});
        })
    },

    verifyBVN: function (req, res) {
        var data = {
            "otp": flutterwave.encrypt(process.env.test_api_key, req.body.otp),
            "merchantid": process.env.test_merchant_key,
            "transactionreference": flutterwave.encrypt(process.env.test_api_key, req.session.otptransactionReference),
            "bvn": flutterwave.encrypt(process.env.test_api_key, req.session.bvn)
        };
        console.log(req.session.bvn);
        console.log(data);
        flutterwave.verifyBVN(data).then(function (response) {
            console.log('got here');
            if (response.data.responseCode == '00') {
                console.log(response);
                return res.render('bvn-successful', {message: response.data});
            }
        }, function (error) {
            console.log(error);
            return res.render('error', {error: error})
        });
    },

    /* Pay APIs */

    linkaccount: function (req, res) {
        var data = {
            "accountnumber": flutterwave.encrypt(process.env.test_api_key, req.body.accountnumber),
            "merchantid": process.env.test_merchant_key,
            "country": flutterwave.encrypt(process.env.test_api_key, req.body.country)
        };

        flutterwave.linkaccount(data).then(function (response) {
            console.log(response);
            if (response.data.responsecode == '02' && response.data.uniquereference != null) {
                console.log(response.data);
                req.session.reference = response.data.uniquereference;
                var result = response.data;
                console.log(req.session.reference);
                return res.render('payAPI/validate1', {message: result})
            }

            if (response.data.responsecode != '00' || response.data.responsecode != '02') {
                result = response.data;
                return res.render('payAPI/incomplete', {message: result});
            }
        }, function (error) {
            console.error(error);
            return res.render('error', {error: error})
        })
    },

    validateAccountStep1: function (req, res) {
        var data = {
            "otp": flutterwave.encrypt(process.env.test_api_key, req.body.otp),
            "otptype": flutterwave.encrypt(process.env.test_api_key, req.body.otptype),
            "merchantid": process.env.test_merchant_key,
            "relatedreference": flutterwave.encrypt(process.env.test_api_key, req.session.reference),
            "country": flutterwave.encrypt(process.env.test_api_key, req.body.country)
        };

        flutterwave.validateAccountStep1(data).then(function (response) {
            if (response.data.responsecode == '02') {
                var result = response.data;
                return res.render('payAPI/validate2', {message: result})
            }

            if (response.data.responsecode != '02' || response.data.responsecode != '00') {
                result = response.data;
                console.log(result);
                return res.render('payAPI/incomplete', {message: result})
            }
        }, function (error) {
            console.log(error);
            return res.render('error', {error: error})
        });
    },

    validateAccountStep2: function (req, res) {

        var data = {
            "otp": flutterwave.encrypt(process.env.test_api_key, req.body.otp),
            "otptype": flutterwave.encrypt(process.env.test_api_key, req.body.otptype),
            "merchantid": process.env.test_merchant_key,
            "relatedreference": flutterwave.encrypt(process.env.test_api_key, req.session.reference),
            "country": flutterwave.encrypt(process.env.test_api_key, req.body.country)
        };

        flutterwave.validateAccountStep2(data).then(function (response) {
            if (response.data.responsecode == '00') {
                var result = response.data;
                req.session.accountToken = response.data.accounttoken;
                var acctToken = new AccountToken();
                acctToken.accounttoken = response.data.accounttoken;
                if (acctToken != null || acctToken != 'undefined') {
                    acctToken.save(function (err) {
                        if (err) {
                            return console.log(err)
                        }
                        return console.log('Hurray, we got the token');
                    })
                }
                console.log(req.session.accountToken);
                return res.render('payAPI/success', {message: result})
            }

            if (response.data.responsecode != '02' || response.data.responsecode != '00') {
                result = response.data;
                console.log(result);
                return res.render('payAPI/incomplete', {message: result})
            }
        }, function (error) {
            console.log(error);
            return res.render('error', {error: error})
        })
    },

    Disburse: function (req, res) {
        console.log(weeteetoken());
        flutterwave.getTokenFromDb()
            .then(function(resp){
                var data = {
                    "accounttoken": flutterwave.encrypt(process.env.test_api_key, resp.accounttoken),
                    "merchantid": process.env.test_merchant_key,
                    "uniquereference": flutterwave.encrypt(process.env.test_api_key, flutterwave.generateUniqueTransactionRef()),
                    "country": flutterwave.encrypt(process.env.test_api_key, req.body.country),
                    "destbankcode": flutterwave.encrypt(process.env.test_api_key, req.body.destbankcode),
                    "currency": flutterwave.encrypt(process.env.test_api_key, req.body.currency1),
                    "transferamount": flutterwave.encrypt(process.env.test_api_key, req.body.amount),
                    "narration": flutterwave.encrypt(process.env.test_api_key, req.body.narration),
                    "recipientname": flutterwave.encrypt(process.env.test_api_key, req.body.recipientname),
                    "sendername": flutterwave.encrypt(process.env.test_api_key, req.body.sendername),
                    "recipientaccount": flutterwave.encrypt(process.env.test_api_key, req.body.recipientaccount)
                };

                flutterwave.Disburse(data).then(function (response) {
                    console.log(data);
                    if (response.data.responsecode == '00') {
                        var result = response.data;
                        return res.render('payAPI/success', {message: result})
                    }

                    if (response.data.responsecode != '02' || response.data.responsecode != '00') {
                        result = response.data;
                        console.log(result);
                        return res.render('payAPI/incomplete', {message: result})
                    }
                }, function (error) {
                    console.log(error);
                    return res.render('error', {error: error})
                })

            })
            .catch(function(err){
                return res.render('error', { error: error})
            })

    },

    unlinkAccount:function (req,res) {
      var data = {
          "merchantid": process.env.test_merchant_key,
          "accountnumber": flutterwave.encrypt(process.env.test_api_key,req.body.accountnumber)
      };

        flutterwave.unlinkAccount(data).then(function (response) {
            console.log(response);
            if (response.data.responsecode == '00' && response.data.uniquereference != null) {
                var result = response.data;
                return res.render('payAPI/success', {message: result})
            }

            if (response.data.responsecode != '00' || response.data.responsecode != '02') {
                result = response.data;
                return res.render('payAPI/incomplete', {message: result});
            }
        }, function (error) {
            console.error(error);
            return res.render('error', {error: error})
        })
    },
    getTransactionStatus: function (req, res) {
        var data = {
            "merchantid": process.env.test_merchant_key,
            "uniquereference": flutterwave.encrypt(process.env.test_api_key, req.body.uniquereference)
        };
        flutterwave.getTransactionStatus(data).then(function (response) {
            if (response.data.responsecode == '00') {
                var result = response.data;
                return res.render('payAPI/success', {message: result});
            }

            if (response.data.responsecode != '00') {
                result = response.data;
                console.log(result);
                return res.render('payAPI/incomplete', {message: result});
            }
        }, function (error) {
            console.log(error);
            return res.render('error', {error: error});
        })
    },


    getlinkedAccounts:function (req,res) {
        var data ={
            "merchantid" : process.env.test_merchant_key
        };

        flutterwave.getlinkedAcconts(data).then(function (response) {
            if(response.data.responsecode == '00'){
                var results = response.data.linkedaccounts;
                return res.render('payAPI/success',{message: response.data, linked: results});
            }

            if(response.data.responsecode != '00'){
                return res.render('payAPI/incomplete',{message : response.data});
            }
        },function (error) {
            if(error){
                return res.render('error',{error:error});
            }
        })
    },

    tokenizeCard: function (req, res, next) {
        var data = {
            "merchantid": process.env.test_merchant_key,
            "cardno": flutterwave.encrypt(process.env.test_api_key, req.body.cardno),
            "cvv": flutterwave.encrypt(process.env.test_api_key, req.body.cvc),
            "authmodel": flutterwave.encrypt(process.env.test_api_key, req.body.authmodel),
            "valdateoption": flutterwave.encrypt(process.env.test_api_key, req.body.validateoption),
            "country": flutterwave.encrypt(process.env.test_api_key, req.body.country),
            "expirymonth": flutterwave.encrypt(process.env.test_api_key, req.body.expirymonth),
            "expiryyear": flutterwave.encrypt(process.env.test_api_key, req.body.expiryyear)
        };

        if (req.body.authmodel === 'BVN') {
            data.bvn = "" + flutterwave.encrypt(process.env.test_api_key, req.body.bvn);
        }

        flutterwave.tokenizeCard(data).then(function (response) {

            if (response.data.responsecode == '02') {
                result = response.data;
                console.log(result);
                req.session.otptransactionidentifier = response.data.otptransactionidentifier;
                return res.render('preAuth/validate', {message: result});
            }

            if (response.data.responsecode == '00') {
                var result  = response.data;
                req.session.responsetoken = response.data.responsetoken;
                var token  =  new AccountToken();
                token.responsetoken = response.data.responsetoken;
                if(token){
                    token.save(function (err) {
                        if(err){
                            return console.log(err);
                        }
                        return console.log('Hurray we got the token');
                    });
                }
                console.log(result);
                return res.render('success', {message: result});

            }

            if (response.data.responsecode != '00' || response.data.responsecode != '02') {
                result = response.data;
                console.log((result));
                return res.render('incomplete-transaction', {message: result});
            }

        }, function (error) {
            console.log(error);
            return res.render('error', {error: error})
        });

    },

    preAuth: function (req,res,next) {

        flutterwave.getTokenFromDb().then(function (resp) {
            console.log(resp.responsetoken);
            var data = {
                "merchantid": process.env.test_merchant_key,
                "currency": flutterwave.encrypt(process.env.test_api_key, req.body.currency2),
                "country": flutterwave.encrypt(process.env.test_api_key, req.body.country2),
                "amount": flutterwave.encrypt(process.env.test_api_key, req.body.amount),
                "chargetoken": flutterwave.encrypt(process.env.test_api_key,resp.responsetoken)
            };

            flutterwave.preAuth(data).then(function (response) {
                if(response.data.responsecode == '00'){
                    var result = response.data;
                    req.session.authorizeId = response.data.authorizeId;
                    req.session.transactionreference = response.data.transactionreference;
                    return res.render('success',{message: result});
                }

                if(response.data.responsecode != '00'){
                    result = response.data;
                    console.log(result);
                    return res.render('preAuth/incomplete',{message: result});
                }
            },function (error) {
                if(error){
                    return res.render('error',{error:error});
                }
            })
        }).catch(function (error) {
            return console.log(error);
        })

    }


};