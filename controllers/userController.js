const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');

const getUsers = async (req, res, next) => {
  try{
    const users = await UserModel.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getUsersById = async(req, res, next) => {
    try{
        const user = await UserModel.findById(req.params.id);
        if (!user){
            return res.status(404).json({ message: 'The User not found.'});
        res.json(user);
        }
    }catch (err){
        next(err);
    }
};
const updateMe = async (req, res, next) => {
    try{
        const{ name, email,password } = req.body;
        const fields = {};

        if(name) fields.name = name;
        if(email) fields.email = email;
        if(password) fields.password = await bcrypt.hash(password, 10);

        if(Object.keys(fields).length === 0){
            return res.status(400).json({ message:'there is no data to update.'});
        }
        await UserModel.update(req.user.id, fields);
        const user = await UserModel.findById(req.user.id);
        res.json({ message: 'Your data has been updated.',user});
    }catch (err){
        next(err);
    }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'The User not found.' });
    }

    await UserModel.update(req.params.id, req.body);
    const updatedUser = await UserModel.findById(req.params.id);
    res.json({ message: 'Your data has been updated.', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'The User not found.' });
    }
    await UserModel.softDelete(req.params.id);
    res.json({ message: 'The user has been deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUsersById, updateMe, updateUser, deleteUser };
