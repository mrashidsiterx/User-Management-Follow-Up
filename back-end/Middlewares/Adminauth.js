const jwt = require("jsonwebtoken");
const admin_Secret = "adminToken";
module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader) {
      return res.status(401).send({
        message: "Authorization header missing",
        success: false,
      });
    }

    const token = authorizationHeader.split(" ")[1];

    jwt.verify(token, admin_Secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Auth failed", success: false });
      } else {
        req.body.adminId = decoded.id;

        next();
      }
    });
  } catch (error) {
    console.log(" error midddle whare ");
    console.log(error);
    return res
      .status(401)
      .send({ message: "Auth error failed", success: false, error });
  }
};
