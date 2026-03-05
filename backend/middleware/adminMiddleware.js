exports.verifyAdmin = (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }

        next();

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
