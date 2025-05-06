
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      throw new ApiError('User already exists', 400);
    }

    user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role || 'user'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
          }
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      throw new ApiError('Invalid Credentials', 400);
    }

    // Validate password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new ApiError('Invalid Credentials', 400);
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role || 'user'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
          }
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user / clear credentials
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

/**
 * @desc    Send password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, still return a success even if user doesn't exist
      return res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // In a real application, you would generate a reset token and send an email
    // For this example, we'll just return a success message
    
    // Example of generating a reset token (not saved to DB in this example)
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // In a real app, you would send an email with a link containing the token
    // For now, just log it
    console.log('Password reset token generated:', resetToken);
    console.log('This would be sent to:', email);
    
    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword
};
