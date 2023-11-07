import retrieveDashboardData from '../model/retrieve_dashboard_data.js';


export default function api_dashboard_controller(req, res) {
    const dashboardData = retrieveDashboardData(db, 123);
    res.json(dashboardData);
};