const mongoose      = require('mongoose');
const Schema        = mongoose.Schema;

var sandboxSchema = new Schema({
    name: String,
    alias: String,
    team: String,
    teamColor: String,
    user: String,
    jenkinsLink: String
});

module.exports = mongoose.model('Sandbox', sandboxSchema);