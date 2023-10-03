

export default function () {
    const login_page_controller = (req, res) => {
        // redirect to home page if logged in
        if (req.session.user) {
            return res.redirect('/');
        }

        res.render('login');
    }

    return login_page_controller;
}