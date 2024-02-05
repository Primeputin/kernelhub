const mongoose = require("mongoose");
const User = require("./userModel");

const Schema = mongoose.Schema;
const commentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel', 
        required: true,
    },
    password:{
        type: String,
        max: 50,
        required: true,
    },
    createdAt:{
        type: Date,
        required: true,
        immutable: true,
        default: ()=>Date.now(),
    },
    updatedAt:{
        type: Date,
        required: true,
        immutable: true,
        default: ()=>Date.now(),
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'commentModel',
    }],
});

module.exports = mongoose.model("commentModel", commentSchema);