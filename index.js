const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());  

const cors = require('cors');
app.use(cors());

const Note = require("./models/Note");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    writeConcern: { w: "majority", j: true }
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((error) => {
    console.log("Error with connecting to the DB", error);
});

app.get("/notes", async (req, res) => {
    try {
        const notes = await Note.find();
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notes", error });
    }
});

app.post("/notes", async (req, res) => {
    const { title, content } = req.body;
    const newNote = new Note({
        title,
        content,
        creationDate: new Date().toLocaleString()
    });

    try {
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({ message: "Error creating note", error });
    }
});

app.delete("/notes/:id", async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting note", error });
    }
});

app.put("/notes/:id", async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(400).json({ message: "Error updating note", error });
    }
});

app.get("/notes/search", async (req, res) => {
    const { query } = req.query;
    try {
        const results = await Note.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } }
            ]
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Error searching notes", error });
    }
});

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log("Server is running");
});
