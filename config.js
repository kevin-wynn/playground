var mongoConnect = 'mongodb+srv://'+process.env.mongoUsername+':'+process.env.mongoPassword+'@'+process.env.mongoCluster+'.mongodb.net/test?retryWrites=true';
if(process.env.NODE_ENV == 'dev') mongoConnect = 'mongodb://localhost:27017';
module.exports = {
    mongoConnect: mongoConnect
}