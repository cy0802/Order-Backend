const checkAdmin = (req, res, next) => {
  console.log("require user:");
  // console.log(req.user);
  if (!req.user || req.user.permission !== "admin") {
    console.log("Admin access required");
    return res.status(403).json({ error: 'Permission Denied' });
  }
  next();
};

const checkClerk = (req, res, next) => {
  if (!req.user || (req.user.permission !== "clerk" && req.user.permission != "admin")) {
    console.log("Clerk access required");
    return res.status(403).json({ error: 'Permission Denied' });
  }
  next();
}

module.exports = {
  checkAdmin,
  checkClerk
};
