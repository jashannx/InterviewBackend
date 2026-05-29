import User from '../models/user.model.js';
import BlacklistToken from '../models/blacklist.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }   
        // const blacklisted = token = password.save;
        const a = await BlacklistToken.save(password);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({ username, email, password: hashedPassword });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000
});
        res.status(201).json({ message: 'User registered successfully' ,user: { id: newUser._id, username: newUser.username, email: newUser.email }});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }


}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: existingUser._id, username: existingUser.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000
});
        res.status(200).json({ message: 'Login successful' ,user: { id: existingUser._id, username: existingUser.username, email: existingUser.email }});
    } catch (error) {
        res.status(400).json({ error: 'chal na yrr'});
    }
}
async function logout(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).json({ error: 'No token provided' });
    }
    await BlacklistToken.create({ token });
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.status(200).json({ message: 'Logout successful' });
}
async function getUser(req, res) {
    const user = await User.findById(req.user.id)
    res.status(200).json({ user: { id: user._id, username: user.username, email: user.email } });   

}
export { register, login , logout, getUser};