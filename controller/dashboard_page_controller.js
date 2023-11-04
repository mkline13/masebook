import retrieveDashboardData from '../model/retrieve_dashboard_data.js';


export default function (db) {
    const controller = (req, res) => {
        const dashboardData = retrieveDashboardData(db, 123);
        res.render('dashboard', dashboardData);
    }

    return controller;
}