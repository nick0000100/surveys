const express = require('express');

const app = express();


var session = require('express-session');
var sessionStore = new session.MemoryStore;
app.use(session({
    cookie: { maxAge: 60000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    secret: 'secret'
}));

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/belt2');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');

app.use(bodyParser.json())

const path = require('path');

app.use(express.static(path.join(__dirname, '/public/dist')));

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true}

}, {timestamps: true });

mongoose.model('User', UserSchema);
var User = mongoose.model('User');

var PollSchema = new mongoose.Schema({
    question: {type: String, required : true},
    option1: {type: String, required : true},
    option1Votes: {type: Number, required: true},
    option2: {type: String, required : true},
    option2Votes: {type: Number, required: true},
    option3: {type: String, required: true},
    option3Votes: {type: Number, required: true},
    option4: {type: String, required: true},
    option4Votes: {type: Number, required: true},
    user_id: {type: String, required: true},
    user_name: {type: String, required: true}

}, {timestamps: true });

mongoose.model('Poll', PollSchema);
var Poll = mongoose.model('Poll');

// Routes

// Creates new user
app.post('/createUser', (req, res, next) => {
    new User(req.body).save()
    .then((user) => {
        req.session.name = user.name;
        req.session.user_id = user._id;
        console.log(req.session.name)
        console.log(req.session.user_id)
        res.json(true);
    }).catch((err) => {
        console.log(err, "@@@@@@@@@@@@")
        res.json(err);
    });
});

// Creates new poll
app.post('/createPoll', (req, res, next) => {
    let newPoll = new Poll(req.body);
    newPoll.user_id = req.session.user_id;
    newPoll.user_name = req.session.user_name;
    newPoll.save()
    .then((poll) => {
        console.log(poll)
        res.json(true);
    }).catch((err) => {
        console.log(err, "@@@@@@@@@@@@")
        res.json(err);
    });
});

// Retrieves all of the polls.
app.get('/getPolls', (req, res, next) => {
    Poll.find({}, (err, polls) => {
        if(err) {
            res.json(err);
        }else {
            res.json(polls);
        }
    })
});

// Gets the logged in user.
app.get('/getCurrentUser', (req, res, next) => {
    if(req.session.user_id) {
        let current = {
            id: req.session.user_id,
            name: req.session.name
        }
        res.json(current);
    }else {
        res.status(418).json({error: "Login to view that page."})
    }
});

// Finds a poll by the id.
app.post('/findPoll', (req, res, next) => {
    Poll.findById(req.body.pollId)
    .then(poll => {
        res.json(poll);
    }).catch(err => {
        res.status(418).json(err);
    })
});

// Updates the poll vote counts.
app.post('/updatePoll', (req, res, next) => {
    if(req.body.option == 1) {
        Poll.findByIdAndUpdate(req.body.pollId, {$inc: {option1Votes:1}})
        .then(poll => {
            res.json(poll);
        }).catch(err => {
            res.status(418).json(err);
        })
    }else if(req.body.option == 2) {
        Poll.findByIdAndUpdate(req.body.pollId, {$inc: {option2Votes:1}})
        .then(poll => {
            res.json(poll);
        }).catch(err => {
            res.status(418).json(err);
        })
    }else if(req.body.option == 3) {
        Poll.findByIdAndUpdate(req.body.pollId, {$inc: {option3Votes:1}})
        .then(poll => {
            res.json(poll);
        }).catch(err => {
            res.status(418).json(err);
        })
    }else{
        Poll.findByIdAndUpdate(req.body.pollId, {$inc: {option4Votes:1}})
        .then(poll => {
            res.json(poll);
        }).catch(err => {
            res.status(418).json(err);
        })
    }
});

//Logout
app.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.json(true);
});

app.post('/delete', (req, res, next) => {
    Poll.remove({_id: req.body._id}, err => {
        if(err) {
            console.log(err);
        }
    })
})

// Redirects to angular components.
app.all("*", (req,res,next) => {
    res.sendFile(path.resolve("./public/dist/index.html"))
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
});
