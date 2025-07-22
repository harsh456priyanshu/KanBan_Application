const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (user) => {
    return jwt.sign({id : user._id} , process.env.JWT_SECRET , { expiresIn: '7d'});
};

exports.register = async (req,res) => {
    try {
        const {name, username, email , password} = req.body;
        
        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({message: 'Name, email, and password are required'});
        }
        
        // Check if user already exists
        const existingUserByEmail = await User.findOne({email});
        if (existingUserByEmail) {
            return res.status(400).json({message: 'User with this email already exists'});
        }
        
        const existingUserByUsername = await User.findOne({username});
        if (existingUserByUsername) {
            return res.status(400).json({message: 'Username is already taken'});
        }
        
        const user = await User.create({name, username, email , password});
        const token = generateToken(user);
        res.status(200).json({user, token})

    }catch(err) {
        console.error('Registration error:', err);
        if (err.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`});
        }
        res.status(400).json({message: err.message})
    }
}


exports.login = async ( req, res) => {
    try {
        const { email , password} = req.body;
        const user = await User.findOne({email});
        if(!user || !(await user.comparePassword(password))) {
            return res.status(401).json({error : 'Invalid Credentials'});
        }
        const token = generateToken(user);
        res.status(200).json({user , token});

    }catch(err) {
        res.status(400).json({error : err.message})
    }
}