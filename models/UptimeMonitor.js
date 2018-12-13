var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// UptimeMonitor model
var UptimeMonitor = new Schema({
  Id                    : Schema.Types.ObjectId,
  Response              : String,
  CreationDate          : { type: Date, default: Date.now }
});

module.exports = mongoose.model('UptimeMonitor', UptimeMonitor);