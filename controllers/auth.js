const USER = require("../model/user.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const defaultTemplateData =
  require("../model/default_template_data.js").defaultTemplateData;

exports.getMessageThenClear = (req) => {
  const { error, message } = req.session;
  req.session.error = false;
  req.session.message = "";
  return { error, message };
};

function randomValue(len) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len)
    .toUpperCase();
}

exports.signupPage = (req, res) => {
  const defaultTemplate = defaultTemplateData(req);
  return res.render("pages/signup", {
    ...defaultTemplate,
    ...this.getMessageThenClear(req),
  });
};

exports.loginPage = (req, res) => {
  const defaultTemplate = defaultTemplateData(req);
  return res.render("pages/login", {
    ...defaultTemplate,
    ...this.getMessageThenClear(req),
  });
};

exports.verifyPage = (req, res) => {
  if (!req.session.verify) {
    res.redirect("/auth/login");
  }
  const defaultTemplate = defaultTemplateData(req);
  return res.render("pages/verify", {
    ...defaultTemplate,
    ...this.getMessageThenClear(req),
  });
};

exports.signup = async (req, res) => {
  const { email, password, repeat_password } = req.body;
  try {
    if (password !== repeat_password) {
      const defaultTemplate = defaultTemplateData(req);
      return res.render("pages/signup", {
        ...defaultTemplate,
        error: true,
        message: "Password and repeat password field must match",
      });
    }
    const allready_registered = await USER.findOne({ email });
    if (allready_registered) {
      const defaultTemplate = defaultTemplateData(req);
      return res.render("pages/signup", {
        ...defaultTemplate,
        error: true,
        message: "User allready exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const new_user = new USER({
      email,
      password: hashedPassword,
      activation_token: randomValue(20),
      items: [],
    });
    await new_user.save();
    req.session.error = false;
    req.session.message = "Success. Check your email";
    sendEmail("REGISTER", new_user, req, res);
  } catch (e) {
    return res.render("pages/signup", {
      auth: null,
      message: "Error occured",
      error: true,
      csrfToken: req.csrfToken(),
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      const defaultTemplate = defaultTemplateData(req);
      return res.render("pages/login", {
        ...defaultTemplate,
        error: true,
        message: "User not found",
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("pages/login", {
        auth: null,
        message: "Invalid username or password",
        error: true,
        csrfToken: req.csrfToken(),
      });
    }
    if (!user.activated) {
      return res.render("pages/login", {
        auth: null,
        message: "Account not activated",
        error: true,
        csrfToken: req.csrfToken(),
      });
    }
    
    req.session.verify = true;
    req.session.user = user;
    const verification = randomValue(8);
    req.session.verification = verification;
    sendEmail("VERIFY", user, req, res);
  } catch (e) {
    return res.render("pages/login", {
      auth: null,
      message: "Error occured",
      error: true,
      csrfToken: req.csrfToken(),
    });
  }
};

exports.verify = async (req, res) => {
  const { verification } = req.body;
  try {
    if (verification !== req.session.verification) {
      return sendEmail("WRONG_CODE", req.session.user, req, res);
    }
    req.session.userId = req.session.user._id;
    req.session.message = "Welcome";
    req.session.error = false;
    res.redirect("/dashboard");
  } catch (e) {
    return res.render("pages/login", {
      auth: null,
      message: "Error verifying user",
      error: true,
      csrfToken: req.csrfToken(),
    });
  }
};

exports.activateAccount = async (req, res) => {
  const { token } = req.params;
  try {
    if (!token) {
      const defaultTemplate = defaultTemplateData(req);
      return res.render("pages/login", {
        ...defaultTemplate,
        error: true,
        message: "Given account not found",
      });
    }
    const user = await USER.findOne({ activation_token: token });
    if (!user) {
      const defaultTemplate = defaultTemplateData(req);
      return res.render("pages/login", {
        ...defaultTemplate,
        error: true,
        message: "User not found",
      });
    }
    user.activated = true;
    user.activation_token = null;
    await user.save();
    req.session.error = false;
    req.session.message = "Account activated";
    res.redirect("/auth/login");
  } catch (e) {
    return res.render("pages/login", {
      auth: null,
      message: "Error occured",
      error: true,
      csrfToken: req.csrfToken(),
    });
  }
};

function sendEmail(type, user, req, res) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "applicationspass@gmail.com",
      pass: process.env.APP_EMAIL_PASS,
    },
  });

  let htmlMessage;
  let subject;
  let renderUrl = "pages/login";
  switch (type) {
    case "REGISTER":
      htmlMessage = `
            <h1>Registration complete</h1>
            <p>Account needs to be verified</p>
            <p>Click <a href="http://localhost:3000/auth/activate/${user.activation_token}">HERE</a> to activate your account</p>
        `;
      subject = "ACCOUNT ACTIVATION";
      break;

    case "VERIFY":
      htmlMessage = `
            <h1>Verification code</h1>
            <p>Your verification code is</p>
            <p style="font-size: 40px; color: blue">${req.session.verification}</p>
        `;
      subject = "VERIFICATION CODE";
      break;

    case "WRONG_CODE":
      htmlMessage = `
            <h1>Verification code</h1>
            <p>Your verification code is</p>
            <p style="font-size: 40px; color: blue">${req.session.verification}</p>
        `;
      subject = "VERIFICATION CODE";
      break;
  }

  const mailOptions = {
    from: "spass.activatione@gmail.com",
    to: user.email,
    subject: subject,
    html: htmlMessage,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.render(renderUrl, {
        auth: null,
        message: "Error sending email",
        error: true,
        csrfToken: req.csrfToken(),
      });
    }

    if (type === "VERIFY") {
      req.session.error = false;
      req.session.message = "Check your email";
      return res.redirect("/auth/verify");
    }

    if (type === "WRONG_CODE") {
      const defaultTemplate = defaultTemplateData(req);
      return res.render("pages/verify", {
        ...defaultTemplate,
        error: true,
        message: "Wrong code. New code sent to your email",
      });
    }

    return res.render(renderUrl, {
      auth: null,
      message: "Success. Check your email",
      error: false,
      csrfToken: req.csrfToken(),
    });
  });
}
