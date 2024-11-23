const checkAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
      console.log("Admin access required");
      return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = checkAdmin;
