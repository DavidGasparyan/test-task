import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET;

const verifyToken = (req, res, next) => {
  const [,token] = req.headers.authorization.split('Bearer ');
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    req.user = decoded;
    next();
  });
};

export default verifyToken;
