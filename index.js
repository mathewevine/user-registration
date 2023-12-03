const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static('public'));
dotenv.config();

const userName = process.env.MONGO_USER;
const userPassword = process.env.MONGO_PASS;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const uri = `mongodb+srv://${userName}:${userPassword}@bharatintern.cy0iz3b.mongodb.net/?retryWrites=true&w=majority`;

async function connect() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch(error) {
        console.error(error);
    }
}

connect();

// user schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    password: String,
});

// user model
const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//APIs
app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, './files/index.html'));
})

app.post('/submit', async (req, res) => {
    // Accessing form data from req.body
    const { name, email, mobile, password } = req.body;
    const encryptedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        mobile,
        password: encryptedPass
    });

    try {
        // Save the user document to the users collection
        const registerdUser = await User.findOne({email: email});

        if (!registerdUser) {
            await newUser.save();
            // Send a response
            res.sendFile(path.join(__dirname, './files/success.html'));
        } else {
            res.sendFile(path.join(__dirname, './files/error.html'));
        }
    } catch (error) {
        console.log("Error :", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, ()=> {
    console.log(`Server running in Port: ${port}`);
});