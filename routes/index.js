var express = require('express');
var router = express.Router(),
    flutter = require('../flutter.api/controllers.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.post('/pay/card',function (req,res,next) {
   next();
}, flutter.cardCharge);

router.get('/payApi',function (req,res,next) {
    res.render('payAPI/index');
});

router.post('/pay/linkaccount',function (req,res,next) {
    next();
},flutter.linkaccount);

router.post('/pay/unlinkaccount',function (req,res,next) {
    next();
},flutter.unlinkAccount);



router.post('/pay/validateAccountStep1',function (req,res,next) {
    next();
},flutter.validateAccountStep1);

router.post('/pay/validateAccountStep2',function (req,res,next) {
    next();
},flutter.validateAccountStep2);

router.post('/pay/disburse',function (req,res,next) {
    next();
},flutter.Disburse);

router.post('/pay/getTransactionStatus',function (req,res,next) {
    next();
},flutter.getTransactionStatus);

router.post('/pay/validate',function (req,res,next) {
    next();
}, flutter.validateCard);

router.post('/cardbincheck',function (req,res,next) {
    next();
}, flutter.verifyCardBIN);


router.post('/checkBVN',function (req,res,next) {
    next();
},flutter.checkBVN);

router.get('/preAuths',function (req,res,next) {
    res.render('preAuth/index');
});

router.post('/card/tokenize',function (req,res,next) {
    next();
},flutter.tokenizeCard);

router.post('/card/preauth',function (req,res,next) {
    next();
},flutter.preAuth);

router.post('/verifyBVN',function (req,res,next) {
    next();
},flutter.verifyBVN);

router.get('/error', function (req, res) {
    return res.render('error');
});

router.get('/success',function (req,res) {
    return res.render('success');
});

module.exports = router;
