const checkAdmin = async (req, res, next) => {
  try {
    const token = req.cookies["token"];
  } catch (error) {
    console.log(error);
    res.json({ message: "Please login!" });
  }
};

module.exports = checkAdmin;
