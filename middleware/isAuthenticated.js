exports.isAuthenticated = (req, res, next) => {
    if(!req.session.userId){
        req.session.destroy()
        return res.redirect('/auth/login')
    }
    next();
}