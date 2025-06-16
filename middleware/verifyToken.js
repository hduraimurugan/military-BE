import jwt from 'jsonwebtoken'

export const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.accessToken
        // console.log("accessToken", token);

    if (!token) return res.status(401).json({ message: 'Access denied. Token missing' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' })
    }
}

export const verifyRefreshToken = (req, res, next) => {
    const token = req.cookies.refreshToken
    // console.log("refreshToken", token);
    if (!token) {
        return res.status(401).json({ message: 'Refresh token missing' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' })
    }
}

export const verifyRole = (requiredRoles) => {
  return (req, res, next) => {
    console.log("Reg role", requiredRoles);
    console.log("user role", req.user.role);
    
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions' });
    }
    next();
  };
};
