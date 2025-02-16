import express from "express";
import cors from "cors";
import Poll from "./db.js";

const PORT = process.env.PORT | 3000;

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://polls-backend.app", "https://fast-polls.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

app.post('/api/createpoll', async (req, res) => {
    const {username, title, options} = req.body;
    const found = await Poll.find({username});
    if(found){
        await Poll.deleteOne({username});
    }
    if(title && options){
        const result = await Poll.create({username, title, options, score: Array(options.length).fill(0)});
        return res.send(req.body);
    }
    else{
        res.send({message: "wrong inputs"});
    }
})

app.get('/api/polls', async (req, res) => {
    const { username } = req.query; // Use query instead of body
    // console.log('Received username:', username);
    if (!username) {
        return res.status(400).send({ message: "Username is required" });
    }
    const result = await Poll.findOne({ username });
    if (!result) {
        return res.send({ message: "not found" });
    }
    res.send({ title: result.title, options: result.options, score: result.score });
});


app.post('/api/select', async (req, res) => {
    const { username, selectOption } = req.body;
    // console.log(req.body);
    // Input validation
    if (typeof username !== 'string' || typeof selectOption !== 'number') {
        return res.status(400).send({ message: "Invalid input" });
    }

    try {
        // Fetch the poll to validate selection
        const poll = await Poll.findOne({ username });
        if (!poll) {
            return res.status(404).send({ message: "Poll not found" });
        }

        // Validate selectOption
        if (selectOption < 0 || selectOption >= poll.score.length) {
            return res.status(400).send({ message: "Invalid option index" });
        }

        // Increment the selected score
        const update = { $inc: { [`score.${selectOption}`]: 1 } };
        const result = await Poll.updateOne({ username }, update);

        // Check if the update was successful
        if (result.modifiedCount === 1) {
            const updatedPoll = await Poll.findOne({ username });
            return res.status(200).send({
                message: "Score updated successfully",
                updatedScore: updatedPoll.score
            });
        } else {
            return res.status(500).send({ message: "Failed to update score" });
        }

    } catch (error) {
        console.error("Error updating score:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});


app.listen(3000, () => {
    console.log(`server started at ${PORT}`);
});