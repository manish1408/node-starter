var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// SSLMonitor model
var SSLMonitor = new Schema({
  Id                    : Schema.Types.ObjectId,
  Response              : String,
  CreationDate          : { type: Date, default: Date.now }
});

module.exports = mongoose.model('SSLMonitor', SSLMonitor);