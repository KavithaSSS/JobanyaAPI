// module.exports = (app) => {
//     const language = require('..app/controllers');


// }
module.exports = function (app) {
    app.use('/api/controller', require('./api/controller'));
    
}