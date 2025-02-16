import { Schema, model } from "mongoose";
import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

connect(process.env.DATABASE)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log("DB Error:", err));

const PollSchema = new Schema({
    username: String,
    title: String,
    options: [String],
    score: [Number],
});

const Poll = model("Score", PollSchema);
export default Poll;