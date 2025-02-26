import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import dotenv from "dotenv";
import cors from "cors";
import User from "./models/User.js"; 

dotenv.config();
const app = express();
app.use(cors({ origin: "https://git-connect.vercel.app", credentials: true }));

app.use(
    session({
        secret: "your_secret",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "https://git-connect-server.vercel.app/auth/github/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({ githubId: profile.id });
            if (!user) {
                user = new User({
                    githubId: profile.id,
                    username: profile.username,
                    profileImage: profile.photos[0].value,
                    bio: profile._json.bio || "",
                    profileLink: profile.profileUrl,
                });
                await user.save();
            }
            return done(null, user);
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

app.get("/", (req, res) => res.send("Server running"));

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
    "/auth/github/callback",
    passport.authenticate("github", {
        failureRedirect: "https://git-connect.vercel.app",
    }),
    (req, res) => {
        if (req.user) {
            res.redirect(`https://git-connect.vercel.app?user=${encodeURIComponent(JSON.stringify(req.user))}`);
        } else {
            res.redirect("https://git-connect.vercel.app");
        }
    }
);

app.get("/api/data", async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users from MongoDB
        const formattedData = users.map(user => ({
            image: user.profileImage,
            link: user.profileLink,
            title: user.username,
            description: user.bio
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => app.listen(5000, () => console.log("Server running on port 5000")))
    .catch((err) => console.error(err));
