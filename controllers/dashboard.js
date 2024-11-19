const USER = require("../model/user");
const { getMessageThenClear } = require("./auth");
const { encryptText, dencryptText } = require("../utils/encrypt.js");

exports.dashboard = async (req, res) => {
  try {
    const user = await USER.findById(req.session.userId);
    const items = user.items.map((item, i) => {
      return {
        email: user.email,
        id: item._id,
        name: dencryptText(item.name),
        password: dencryptText(item.password),
        mappedPass: dencryptText(item.password)
          .split("")
          .map((i) => "*")
          .join(""),
      };
    });
    return res.render("pages/index", {
      auth: req.session.userId,
      email: user.email,
      ...getMessageThenClear(req),
      csrfToken: req.csrfToken(),
      items: items || [],
    });
  } catch (e) {
    console.log(e)
    return res.render("pages/index", {
      auth: req.session.userId,
      email: '',
      error: true,
      message: "Error fetching items",
      csrfToken: req.csrfToken(),
      items: [],
    });
  }
};

exports.addItem = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await USER.findById(req.session.userId);
    const item = { name: encryptText(name), password: encryptText(password) };
    user.items = [...user.items, item];
    await user.save();
    req.session.error = false;
    req.session.message = 'Item added';
    return res.redirect('/dashboard');
  } catch (e) {
    console.log(e)
    req.session.error = true;
    req.session.forceDestroy = true;
    req.session.message = "Login required";
    req.session.userId = null;
    req.session.user = null;
    return res.redirect("/auth/login");
  }
};


exports.deleteItem = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await USER.findById(req.session.userId);
    const items = [...user.items].filter((item) => {
      return !item._id.equals(id);
    });
    user.items = items;
    await user.save();
    req.session.error = false;
    req.session.message = 'Item removed';
    return res.redirect("/dashboard");
  } catch (e) {
    req.session.error = true;
    req.session.forceDestroy = true;
    req.session.message = "Login required";
    req.session.userId = null;
    req.session.user = null;
    return res.redirect("/auth/login");
  }
};

