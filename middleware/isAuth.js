const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {


  const authHeader = req.get('Authorization').split(' ')[1]
  if (!authHeader) {
    return res.status(401).json({ message: 'Your not authuenticated', messageType: 'warning' })
  }
  const token = authHeader
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "SomeSuperAsecretBymy");
  } catch (error) {
    return res.status(401).json({ message: 'Your not authuenticated', messageType: 'warning' })
  }

  if (!decodedToken) {
    return res.status(401).json({ message: 'Your not authuenticated', messageType: 'warning' })
  }
  
  req.token = token
  req.user = decodedToken


  next();
};
