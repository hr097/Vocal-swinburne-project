const jwt = require("jsonwebtoken");
const secretKey = process.env.TOKEN_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
        message: "Unauthorized User!",
        app_status: false,
        });
    }

    try {
        const decodedToken = jwt.verify(token, secretKey);
        if (decodedToken) {
            req.user = decodedToken;
            next();
        } 
        else {
            return res.status(403).json({
                message: "invalid token",
                app_status: false,
            });
        }
    } 
    catch (err) {
        return res.status(403).json({
        message: "invalid token",
        app_status: false,
        });
    }
};

module.exports = authenticateToken;
