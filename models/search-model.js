var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongooseHidden = require('mongoose-hidden')();

var SearchSchema = new Schema({
  term:String,
  when:Date
});

SearchSchema.plugin(mongooseHidden);

module.exports = mongoose.model('search',SearchSchema);