import retrieveDashboardData from '../model/retrieve_dashboard_data.js';


export default function dashboard_page_controller(req, res) {
    const dashboardData = retrieveDashboardData(req.db, 123);
    res.render('dashboard', dashboardData);
}