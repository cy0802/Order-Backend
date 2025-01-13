const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.admin !== "admin") {
    console.log("Admin access required");
    return res.status(403).json({ error: 'Permission Denied' });
  }
  next();
};

const checkClerk = (req, res, next) => {
  if (!req.user || req.user.admin !== "clerk") {
    console.log("Clerk access required");
    return res.status(403).json({ error: 'Permission Denied' });
  }
  next();
}

module.exports = {
  checkAdmin,
  checkClerk
};
