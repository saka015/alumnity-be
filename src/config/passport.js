const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/user.model");
const { generateToken } = require("../utils/generate.jwt");

console.log("Initializing Passport Google Strategy...");
console.log(
    "Google Client ID:",
    process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set"
);
console.log(
    "Google Client Secret:",
    process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"
);

passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/v1/auth/google/callback",
            scope: ["profile", "email"],
        },
        async(accessToken, refreshToken, profile, done) => {
            console.log("Google Strategy callback executed");
            console.log("Profile ID:", profile.id);
            console.log("Profile emails:", profile.emails);
            console.log("Profile display name:", profile.displayName);
            console.log("Profile photos:", profile.photos);

            try {
                const existingUser = await User.findOne({
                    email: profile.emails[0].value,
                });
                console.log("Existing user found:", existingUser ? "Yes" : "No");

                if (existingUser) {
                    if (existingUser.loginMethod !== "google") {
                        console.log(
                            "User exists but with different login method:",
                            existingUser.loginMethod
                        );
                        return done(null, false, {
                            message: "Account already exists with email login",
                        });
                    }

                    // Update profile picture if it's different
                    if (
                        profile.photos &&
                        profile.photos[0] &&
                        profile.photos[0].value !== existingUser.profilePicture
                    ) {
                        existingUser.profilePicture = profile.photos[0].value;
                        await existingUser.save();
                        console.log("Updated profile picture for existing user");
                    }

                    console.log("Returning existing Google user");
                    return done(null, existingUser);
                }

                console.log("Creating new user from Google profile");
                const newUser = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.emails[0].value.split("@")[0] +
                        Math.random().toString(36).substr(2, 5),
                    loginMethod: "google",
                    isVerified: true,
                    password: null,
                    profilePicture: profile.photos && profile.photos[0] ?
                        profile.photos[0].value :
                        null,
                });

                const savedUser = await newUser.save();
                console.log("New user saved successfully:", savedUser._id);
                return done(null, savedUser);
            } catch (error) {
                console.error("Error in Google Strategy:", error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user._id);
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try {
        console.log("Deserializing user:", id);
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error("Error deserializing user:", error);
        done(error, null);
    }
});

module.exports = passport;