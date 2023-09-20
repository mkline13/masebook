import retrieveDashboardData from '../model/retrieve_dashboard_data.js';

const dashboard_page_controller = (req, res) => {
    const dashboardData = retrieveDashboardData(123);
    res.render('dashboard', dashboardData);
}

export default dashboard_page_controller;