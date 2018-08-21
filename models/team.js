const mongoose      = require('mongoose');
const Schema        = mongoose.Schema;

var teamSchema = new Schema({
    name: String,
    color: String
});

module.exports = mongoose.model('Team', teamSchema);