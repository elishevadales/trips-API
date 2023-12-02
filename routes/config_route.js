
const indexR = require("./index");
const usersR = require("./users");
const tripsR = require("./trips");

exports.routesInit = (app) => {

    app.use('/', indexR)
    app.use('/users', usersR)
    app.use('/trips', tripsR)
}