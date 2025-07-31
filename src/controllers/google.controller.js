const passport = require("passport");
const { generateToken } = require("../utils/generate.jwt");

const googleLogin = (req, res, next) => {
    console.log("Google login initiated");
    passport.authenticate("google", { scope: ["profile", "email"] })(
        req,
        res,
        next
    );
};

const googleCallback = (req, res, next) => {
    console.log("Google callback received");
    console.log("Query params:", req.query);
    console.log("User agent:", req.get("User-Agent"));

    passport.authenticate("google", { session: false }, (err, user, info) => {
        console.log("Passport authenticate callback");
        console.log("Error:", err);
        console.log("User:", user ? "User found" : "No user");
        console.log("Info:", info);

        if (err) {
            console.error("Authentication error:", err);
            return res.redirect(
                `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/login?error=Authentication failed: ${err.message}`
            );
        }

        if (!user) {
            console.error("No user returned from Google");
            const errorMessage =
                info && info.message ? info.message : "Authentication failed";
            return res.redirect(
                `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/login?error=${encodeURIComponent(errorMessage)}`
            );
        }

        try {
            console.log("Generating token for user:", user._id);
            const token = generateToken(user._id);

            const isProduction = process.env.NODE_ENV === "production";
            const cookieOptions = {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                path: "/",
                domain: isProduction ? ".thekamalnayan.live" : undefined,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            };

            console.log("Setting cookie with options:", cookieOptions);
            res.cookie("token", token, cookieOptions);

            console.log("Redirecting to dashboard");
            res.redirect(
                `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/dashboard?success=Google login successful`
            );
        } catch (error) {
            console.error("Token generation error:", error);
            res.redirect(
                `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/login?error=Token generation failed`
            );
        }
    })(req, res, next);
};

module.exports = {
    googleLogin,
    googleCallback,
};