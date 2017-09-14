var mongoose = require('mongoose');

var Message = mongoose.model('Message', {

  message: {
    type: Number,
    default: null
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Message};
