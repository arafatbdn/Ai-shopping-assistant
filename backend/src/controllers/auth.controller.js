import User from '../models/User.js';
import { createAccessToken } from '../utils/token.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests,
    preferences: user.preferences,
  };
}

export async function register(request, response) {
  try {
    const { name, email, password } = request.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return response.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return response.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: password });
    response.status(201).json({ token: createAccessToken(user), user: publicUser(user) });
  } catch (error) {
    response.status(500).json({ message: 'Unable to create account', detail: error.message });
  }
}

export async function login(request, response) {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() }).select('+passwordHash');
    const valid = user && password ? await user.comparePassword(password) : false;
    if (!valid) return response.status(401).json({ message: 'Email or password is incorrect' });

    response.json({ token: createAccessToken(user), user: publicUser(user) });
  } catch (error) {
    response.status(500).json({ message: 'Unable to sign in', detail: error.message });
  }
}

export function me(request, response) {
  response.json({ user: publicUser(request.user) });
}
