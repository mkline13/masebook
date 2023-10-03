import retrieveDashboardData from '../model/retrieve_dashboard_data.js';


export default function (db) {
    const dashboard_page_controller = (req, res) => {
        const dashboardData = retrieveDashboardData(db, 123);
        res.render('dashboard', dashboardData);
    }

    return dashboard_page_controller;
}