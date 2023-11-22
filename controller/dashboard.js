

export default function dashboard(req, res) {
    const data = {
        pokes: [],
        feed: [],
        page_alerts: [
            {message: 'Hello world!', severity: 'info'},
            {message: 'Uh-oh, world!', severity: 'warning'},
            {message: 'Goodbye world!', severity: 'critical'}
        ]
    }
    res.render('dashboard', data);
}