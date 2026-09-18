import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, preferences } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'ValidationError', message: 'Name, email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'ValidationError', message: 'Password must be at least 6 characters long' });
      return;
    }

    const validRoles: UserRole[] = ['TENANT', 'OWNER', 'AGENT', 'ADMIN'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'TENANT';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ error: 'ConflictError', message: 'A user with this email address already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: assignedRole,
      preferences: preferences || {},
      verificationStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
    });

    const token = generateToken(user);

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (err: any) {
    console.error('[Register Error]', err);
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawIdentifier = req.body.email || req.body.id || req.body.username;
    const { password } = req.body;

    if (!rawIdentifier || !password) {
      res.status(400).json({ error: 'ValidationError', message: 'ID/Email and password are required' });
      return;
    }

    const identifier = String(rawIdentifier).trim();

    // Check by exact identifier (e.g. case-sensitive ID 'hardik') or lowercase (for emails)
    const user = await User.findOne({
      $or: [{ email: identifier }, { email: identifier.toLowerCase() }],
    }).select('+passwordHash');

    if (!user) {
      res.status(401).json({ error: 'AuthError', message: 'Invalid ID/email or password' });
      return;
    }

    if (user.accountStatus === 'SUSPENDED') {
      res.status(403).json({ error: 'Forbidden', message: 'Account is suspended. Please contact support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'AuthError', message: 'Invalid ID/email or password' });
      return;
    }

    const token = generateToken(user);

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error logging in' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatar: req.user.avatar,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt,
    },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
    return;
  }

  try {
    const { name, phone, preferences, avatar } = req.body;

    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (preferences) req.user.preferences = { ...req.user.preferences, ...preferences };
    if (avatar !== undefined) req.user.avatar = avatar;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
        preferences: req.user.preferences,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ServerError', message: err.message || 'Error updating profile' });
  }
};
