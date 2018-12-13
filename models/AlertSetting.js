var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// AlertSetting model
var AlertSetting = new Schema({
  Id                    : Schema.Types.ObjectId,
  Slack                 : String,
  Webhooks              : String,
  Email                 : String,
  SMS                   : Number
  CreationDate          : { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlertSetting', AlertSetting);