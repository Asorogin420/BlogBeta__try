const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require('path')
const {v4: uuid} = require("uuid")

const User = require("../models/userModel");
const HttpError = require("../models/errorModel");
const { error } = require('console');




//===========REGISTER NEW USER 
// POST : api/users/register



// UNPRORECTED
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, password2 } = req.body;
        if (!name || !email || !password || !password2) {
            return next(new HttpError("Fill in all fields", 422));
        }
        
       

        if(password != password2){
            return next(new HttpError("Passwords do not match.", 422))
        }

        if((password.trim()).length < 6) {
            return next(new HttpError("Password should be at least 6 charecters."))
        }

        const newEmail = email.toLowerCase()

        const emailExist = await User.findOne({ email: newEmail });
        if (emailExist) {
            return next(new HttpError("Email already exists.", 422));
        }
       

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);


          const newUser = new User({
            name,
            email: newEmail,
            password: hashedPass
        });

        await newUser.save();

        // Respond with the newly created user
        res.status(201).json({ message: `User registered successfully with the email:${newUser.email}`, user: newUser });
    } catch (error) {
        console.error(error);
        return next(new HttpError("User registration failed.", 500));
    }
}






//===========LOGIN A REGISTER USER 
// POST : api/users/login
// UNPRORECTED
const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError("Fill in all fields.", 422))
        }
        const newEmail = email.toLowerCase();

        const user = await User.findOne({ email: newEmail })
        if(!user) {
            return next(new HttpError("Invalid credentials.", 422))
        }

        const comparePass = await bcrypt.compare(password, user.password)
        if(!comparePass) {
            return next(new HttpError("Invalid credentials.", 422))
        }

        const { _id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({token, id, name})
    } catch (error) {
        return next(new HttpError("Login failed. please check your credentials.", 422))
    }
}






//==========USER PROFILE
// POST : api/users/:id
// PRORECTED
const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('-password');
        if(!user) {
            return next(new HttpError("User  not found.", 404))
        }
        res.status(200).json(user);
    } catch (error) {
        return next(new HttpError(error))
    }
}






//==========CHANGE USER AVATAR(profile pic)
// POST : api/users/change-avatar
// PRORECTED
const changeAvatar = async (req, res, next) => {
  try {
    // Check if a file is uploaded
    if (!req.files || !req.files.avatar) {
      return next(new HttpError("Please choose an image", 422));
    }

    // Find user from db
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    // Delete old avatar if it exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', user.avatar);
      fs.unlink(oldAvatarPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`Failed to delete old avatar: ${err.message}`);
        }
      });
    }

    const { avatar } = req.files;

    // Check size
    if (avatar.size > 500000) {
      return next(new HttpError("Profile picture too big. Should be less than 500kb", 422));
    }

    // Generate unique filename
    const ext = path.extname(avatar.name);
    const newFilename = uuid() + ext;

    // Move avatar to uploads directory
    const uploadPath = path.join(__dirname, '..', 'uploads', newFilename);
    avatar.mv(uploadPath, async (err) => {
      if (err) {
        return next(new HttpError("Failed to upload avatar", 500));
      }

      // Update user's avatar in DB
      user.avatar = newFilename;
      const updatedUser = await user.save();

      if (!updatedUser) {
        return next(new HttpError("Avatar could not be changed", 422));
      }

      res.status(200).json({ message: "Avatar changed successfully", user: updatedUser });
    });
  } catch (error) {
    console.error("An error occurred while changing avatar:", error);
    return next(new HttpError("An error occurred while changing avatar", 500));
  }
};



//==========EDIT USER DETAILS (from profile)
// POST : api/users/edit-user
// PRORECTED
const editUser = async (req, res, next) => {
    try {
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if(!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
            return next(new HttpError("Fill in all fields.", 422))
        }

        //get user from db
        const user = await User.findById(req.user.id);
        if(!user) {
            return next(new HttpError("User not found.", 404))
        }

        //make sure new email dosnt alredy exist
        const emailExist = await User.findOne({email});
        if(emailExist && (emailExist._id != req.user.id)){
            return next(new HttpError("Email already exist.", 422))
        }
        //compare current password to db password
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if(!validateUserPassword) {
            return next(new HttpError("Invalid current password.", 403))
        }

        /// compare new password
        if (newPassword !== confirmNewPassword) {
            return next(new HttpError("New password do not match.", 422))
        }

        //hash new password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassword, salt);

        //update user info in DB
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: hash}, {new: true})
        res.status(200).json(newInfo)
        

    } catch (error) {
        return next(new HttpError(error))
    }
}






//==========GET AUTHORS
// POST : api/users/authors
// UNPRORECTED
const getAuthors = async (req, res, next) => {
   try {
    const authors = await User.find().select('-password');
    res.json(authors);
   } catch (error) {
    return next(new HttpError(error))
   }
}

module.exports = {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors}


