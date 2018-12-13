var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// GoogleMonitor model
var GoogleMonitor = new Schema({
  Id                    : Schema.Types.ObjectId,
  Response              : String,
  CreationDate          : { type: Date, default: Date.now }
});

module.exports = mongoose.model('GoogleMonitor', GoogleMonitor);