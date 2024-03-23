const User = require("../models/userModel");
const { deleteImageById } = require("./imageController")
const mongoose = require('mongoose');


// get all users
const getUsers = async (req, res)=>{

    const users = await User.find({});
    res.status(200).json(users);
}

// get a user
const getUser = async (req, res)=>{
    const { id } = req.params
    // checks if the obj id is valid before proceeind to prevent an error in the db side
    if (!mongoose.Types.ObjectId.isValid(id))
    {
        return res.status(404).json({error: "No such user found :("});
    }

    try {
        const user = await User.findById(id).populate('profpic');
    
        if (!user) {
            return res.status(404).json({ error: "No such user found :(" });
        }
    
        return res.status(200).json(user);
    } catch (error) {
        // Handle any unexpected errors
        console.error("Error retrieving user:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}

// create a user
const createUser =  async (req, res)=>{

    const {username, password} = req.body
    try
    {   
        const user = await User.create({username, password});
        res.status(200).json(user);
    }
    catch(error)
    {
        if (error.name === 'ValidationError') {
            // If the model invalidation happened, return 400 status code
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: 'Validation failed', details: validationErrors });
        }
        // For other types of errors, log the error and return a 500 status code
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    
    }
}

// check if valid user
const checkUser =  async (req, res)=>{

    const {username, password, remember} = req.body
    try
    {   
        const user = await User.findOne({ username, password });
        if (!user)
        {
            return res.status(404).json({error: "No such user found :("});
        }
        req.session.user = user._id;
        if (remember)
        {
            req.session.remember = true;
        }
        else
        {
            req.session.remember = false;
        }
        res.status(200).json(user);
    }
    catch(error)
    {
        console.log(error);
    }
}

const logout = (req, res)=>{

    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ success: false, error: 'Failed to destroy session' });
            } else {
                res.json({ success: true, message: 'Session destroyed successfully' });
            }
        });
    } else {
        res.status(400).json({ success: false, error: 'No active session to destroy' });
    }
}

const checkSession = (req, res)=>{
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Session expired' });
    }
}

const Session = mongoose.connection.collection('session');

const updateSession = async (req, res) => {
    try {
      // Update session data to set initialAccess to false
      if (req.session && req.session.remember)
      {
        const newExpirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 21);
        await Session.updateOne({ "session.user": req.session.user }, { $set: { expires: newExpirationDate } });
        // req.session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.status(200).send("Session expiration updated successfully");

      }
      else
      {
        res.status(404).send("No session found");
      }
    } catch (error) {
      console.error('Error updating session data:', error);
      res.status(500).send('Internal server error');
    }
};

// delete a user
const deleteUser = async (req, res)=>{
    const { id } = req.params
    // checks if the obj id is valid before proceeind to prevent an error in the db side
    if (!mongoose.Types.ObjectId.isValid(id))
    {
        return res.status(404).json({error: "No such user found :("});
    }

    try {
        // Find the user and populate the imageModel field
        const user = await User.findById(id).populate('profpic');

        if (!user) {
            return res.status(404).json({ error: "No such user found :(" });
        }

        // If the user has an imageModel, delete it first
        if (user.profpic) {
            await deleteImageById(user.profpic._id);
        }

        // Delete the user
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: "User and associated image deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// update a user
const updateUser = async (req, res)=>{
    const { id } = req.params
    // checks if the obj id is valid before proceeind to prevent an error in the db side
    if (!mongoose.Types.ObjectId.isValid(id))
    {
        return res.status(404).json({error: "No such user found :("});
    }

    const user = await User.findOneAndUpdate({_id: id}, {...req.body}).populate("profpic");

    if (!user)
    {
        return res.status(404).json({error: "No such user found :("});
    }
    res.status(200).json(user);
}


module.exports = { getUsers, getUser, createUser, checkUser, logout, checkSession, updateSession, deleteUser, updateUser }