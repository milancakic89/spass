exports.defaultTemplateData = (req) => {
    return {
      auth: null,
      message: '',
      error: false,
      csrfToken: req.csrfToken(),
    }
}