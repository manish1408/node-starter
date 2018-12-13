var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// BrokenLinksMonitor model
var BrokenLinksMonitor = new Schema({
  Id                    : Schema.Types.ObjectId,
  Response              : String,
  CreationDate          : { type: Date, default: Date.now }
});

module.exports = mongoose.model('BrokenLinksMonitor', BrokenLinksMonitor);