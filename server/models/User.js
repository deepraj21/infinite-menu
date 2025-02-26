import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    githubId: String,
    username: String,
    profileImage: String,
    bio: String,
    profileLink: String,
});

export default mongoose.model("User", UserSchema);
