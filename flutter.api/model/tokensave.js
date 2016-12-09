/**
 * Created by michael-prime on 12/7/16.
 */
var mongoose = require('mongoose');
var autoIncrement  = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);



var tokenSchema = new mongoose.Schema({
    accounttoken : {type :String},
    responsetoken : {type:String}

});

tokenSchema.plugin(autoIncrement.plugin, 'AccountToken');

var AccountToken=   mongoose.model('AccountToken', tokenSchema);
module.exports = AccountToken;