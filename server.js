const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/msgboard_mongoose');

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String, 
        required: [true, 'First name required'], 
        minlength: [2, 'First name must be greater than 2 characters']
    },
    last_name: {type: String, required: true, minlength: 2},
    email: {
        type: String, 
        unique: [true, 'This email already exists'], 
        required: [true, 'Input your email'], 
        minlength: 2
    },
    // phone: {
    //     type: String,
    //     validate: {
    //         validator: function(v) {
    //         return /\d{3}-\d{3}-\d{4}/.test(v);
    //         },
    //         message: '{VALUE} is not a valid phone number!'
    //     },
    //     required: [true, 'User phone number required']
    // },
    birthday: { type: Date },
    password: {type: String, required: true},

}, {timestamps: true});

mongoose.model('User', CommentSchema);

let User = mongoose.model('User');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true}));

const path = require('path');
app.use(express.static(path.join(__dirname, './static')));

// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    Message.find({}, (err, items) => {
        if (!err) {
            res.render('index', {messages: items});
        } else {
            console.log(err);
            res.render('index');
        }
    });
})

app.post('/message', (req, res) => {
    console.log("POST DATA", req.body);
    let item = new Message();
    item.author = req.body.author;
    item.contents = req.body.contents;
    item.save( err => {
        if (!err) {
            res.redirect('/');
        } else {
            res.render('index', {errors: item.errors})
        }
    });
})

app.post('/comment', (req, res) => {
    console.log("POST DATA", req.body);
    var ObjectId = mongoose.Types.ObjectId; 
    Message.find({_id: new ObjectId(req.body._id)}, (err, item) => {
        if (!err) {
            item = item[0]
            const c = new Comment();
            c.author = req.body.author;
            c.contents = req.body.contents;
            item.comments.push(c);
            item.save(err => {
                if(!err) {
                    console.log("saved!");
                    res.redirect('/');
                } else {
                    console.log("erro")
                    res.render('index', {errors: item.errors});
                }
            })
        } else {
            console.log(err);
            res.render('index', {errors: item.errors});            
        }
    });
})

app.listen(8000, () => {
    console.log("listening on port 8000");
})
