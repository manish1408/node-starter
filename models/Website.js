var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Website model
var Website = new Schema({
  Id                    : Schema.Types.ObjectId,
  Url                   : String,
  WebsiteName           : String,
  CreationDate          : { type: Date, default: Date.now },
  GoogleMonitorInterval : Number,
  UptimeMonitorInterval : Number,
  SSLMonitorInterval    : Number,
  BrokenLinksInterval   : Number,
  UserId                : String
});

module.exports = mongoose.model('Website', Website);