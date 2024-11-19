exports.paswordLengthCheck = (req, res, next) => {
    try{
        const isValid = [ { regex: /.{8,}/ }, // min 8 letters,
          { regex: /[0-9]/ }, // numbers from 0 - 9
          { regex: /[a-z]/ }, // letters from a - z (lowercase)
          { regex: /[A-Z]/}, // letters from A-Z (uppercase),
          { regex: /[^A-Za-z0-9]/} // special characters
        ].every((item) => item.regex.test(req.body.password));

        if(!isValid){
            req.session.error = true;
            req.session.message = "Password strength criteria not met";
            return res.redirect(req.originalUrl);
        }
        next();
    }catch(e){
        req.session.error = true;
        req.session.message = 'Check your inputs';
        return res.redirect('/auth/login')
    }
}