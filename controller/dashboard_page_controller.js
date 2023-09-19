const retrieveDashboardData = require('../model/retrieve_dashboard_data');


const dashboard_controller = (req, res) => {
    dashboardData = retrieveDashboardData(123);
    res.render('dashboard', dashboardData);
}


module.exports = dashboard_controller;