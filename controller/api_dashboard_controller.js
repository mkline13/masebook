import retrieveDashboardData from '../model/retrieve_dashboard_data.js';


export default function(db) {
    const api_dashboard_controller = (req, res) => {
        const dashboardData = retrieveDashboardData(db, 123);
        res.json(dashboardData);
    }

    return api_dashboard_controller;
};