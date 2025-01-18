const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const path = require('path');
const { users, findUserByUsername } = require('./users');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, nanoid() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Improved authenticate middleware
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).send('Authorization header missing');
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};

// User registration
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.send('User registered successfully.');
  } catch (error) {
    res.status(500).send('Error registering user.');
    console.error(error);
  }
});

// User login
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = findUserByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username }, 'secretkey');
      res.json({ token });
    } else {
      res.status(400).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error logging in user.');
    console.error(error);
  }
});

// File upload (with authentication)
app.post('/upload', authenticate, upload.single('file'), (req, res) => {
  try {
    console.log('File upload initiated');
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded');
    }
    const shortLink = `http://localhost:${port}/uploads/${file.filename}`;
    console.log(`File uploaded: ${file.filename}, Short link: ${shortLink}`);
    res.json({ message: 'File uploaded successfully!', link: shortLink });
  } catch (error) {
    res.status(500).send('Error uploading file.');
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
