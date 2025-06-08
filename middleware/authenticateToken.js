
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;
// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // contains user_id
        console.log(`Authenticated user: ${user.user_id}`);
        next();
    });
};

export default authenticateToken;
export { authenticateToken };