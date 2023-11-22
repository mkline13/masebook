

export default function dashboard(req, res) {
    const data = {
        pokes: [],
        feed: []
    }
    res.render('dashboard', data);
}