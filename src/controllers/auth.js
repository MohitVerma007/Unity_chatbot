const db = require('../db')
const { hash } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { SECRET } = require('../constants')
const fs = require('fs');
const path = require('path');


// All Users
exports.getUsers = async (req, res) => {
  try {
    const { rows } = await db.query('select id, username, email, phone, address, status from users')

    return res.status(200).json({
      success: true,
      users: rows,
    })
  } catch (error) {
    console.log(error.message)
  }
}

// Single User By Id
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  console.log(req.params, userId)

  try {
    const { rows } = await db.query('select id, username, email, phone, address, status from users where id = $1', [userId])

    return res.status(200).json({
      success: true,
      users: rows,
    })
  } catch (error) {
    console.log(error.message)
  }
}

exports.register = async (req, res) => {
  const { username, email, password, phone, address } = req.body;

  // Validate the input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email and password are required'
    });
  }


  // Set status based on role
  const status = 'Pending';

  try {
    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Insert user into the database
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, phone, address, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [username, email, hashedPassword, phone, address, role, status]
    );

    const userId = result.rows[0].id;

    // Log the registration activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, details)
       VALUES ($1, $2, $3)`,
      [userId, 'User Registered', `Username: ${username}, Email: ${email}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful'
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Example function to log user login
exports.login = async (req, res) => {
  let user = req.user;

  let payload = {
    id: user.id,
    email: user.email,
  };

  try {
    const token = await sign(payload, SECRET);

    // Log the login activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, details)
       VALUES ($1, $2, $3)`,
      [user.id, 'User Logged In', `Email: ${user.email}`]
    );

    return res.status(200).cookie('token', token, { httpOnly: true }).json({
      success: true,
      token: token,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};


// Update Profile
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const {
    username,
    email,
    phone,
    address,
  } = req.body;

  try {
    // Fetch the existing user data
    const existingUserResult = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (existingUserResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingUser = existingUserResult.rows[0];

    let profilePictureUrl;

        // Handle profile picture upload
        if (req.files && req.files.length > 0) {
          const domain = process.env.DOMAIN;
          profilePictureUrl = req.files.map(file => `${domain}/uploads/user/${file.filename}`)[0];
        } else {
          // If no new image is uploaded, keep the existing profile picture
          profilePictureUrl = existingUser.profile_picture;
        }

    // Prepare updated values
    const updatedUsername = username || existingUser.username;
    const updatedEmail = email || existingUser.email;
    const updatedPhone = phone || existingUser.phone;
    const updatedAddress = address || existingUser.address;
    const updatedProfilePicture = profilePictureUrl || existingUser.profile_picture;

    // Update user in the database
    await db.query(
      `UPDATE users SET
        username = $1,
        email = $2,
        phone = $3,
        address = $4,
        profile_picture = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6`,
      [updatedUsername, updatedEmail, updatedPhone, updatedAddress, updatedProfilePicture, userId]
    );

    // Log the update activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, details)
       VALUES ($1, $2, $3)`,
      [userId, 'User Profile Updated', `User ID: ${userId}`]
    );

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully'
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.protected = async (req, res) => {
  try {
    return res.status(200).json({
      info: 'protected info',
    })
  } catch (error) {
    console.log(error.message)
  }
}

exports.logout = async (req, res) => {
  try {
    return res.status(200).clearCookie('token', { httpOnly: true }).json({
      success: true,
      message: 'Logged out succefully',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      error: error.message,
    })
  }
}


// Delete a user by userId
exports.deleteUserById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // console.log("User deleted with id:", id);
    res.status(200).json({ success: true, message: 'User deleted successfully', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
