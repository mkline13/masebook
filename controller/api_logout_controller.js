
export default function api_logout_controller(req, res) {
    req.session.user = null;
    
    req.session.save(function (err) {
        if (err) return next(err);

        req.session.regenerate(function (err) {
            if (err) next(err);
            return res.redirect('/');
        });
    });
}
