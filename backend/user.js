const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

// generate a json web token after user has logged in/signed up successfully
const generateAccessToken = (userId, type) => {
  return jwt.sign({ userId, type }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// sign up a user 
const register = async (req, res) => {
  try {
    let { type, email, fname, lname, password } = req.body;
    const table = type === 'freelancer' ? 'FREELANCER' : type === 'client' ? 'CLIENT' : null;
    if (!table) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // validate inputs
    email = email?.trim() || null;
    fname = fname?.trim() || null;
    lname = lname?.trim() || null;
    password = password?.trim() || null;
    if(!password || !email || !fname || !lname){
      return res.status(400).json({ error: "Please fill in all fields" }); 
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into the database
    const q = `INSERT INTO ${table} (email, fname, lname, password) VALUES (?, ?, ?, ?)`;
    global.con.query(q, [email, fname, lname, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') { 
          return res.status(400).json({ error: "Email already exists" });
        } 
        return res.status(500).json({ error: err.message });
      } 
      // Generate JWT token
      const userId = result.insertId;
      const token = generateAccessToken(userId,type)
      return res.status(201).json({ 
        message: "User registered",
        user: { id: userId,
                email,
                fname,
                lname,
                type
        },
        token 
      });      
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occured" });
  }
};

// login a user
const login = (req, res) => {
    let { email, password, type } = req.body;

    // Determine user table based on type
    const table = type === 'freelancer' ? 'FREELANCER' : type === 'client' ? 'CLIENT' : null;
    if (!table) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // validate inputs
    email=email?.trim() || null
    password=password?.trim() || null
    if(!email || !password){
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    // Query to check if user exists
    const q = `SELECT * FROM ${table} WHERE email = ? LIMIT 1`;
    global.con.query(q, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check password
        const user = results[0];
        const userId = type === 'freelancer'? user.fid : user.cid;
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        const token =  generateAccessToken(user.id,type)
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: userId,
                email: user.email,
                fname: user.fname,
                lname: user.lname,
                type
            }
        });
    });
};

// delete an existing user
const deleteUser = (req, res) => {
  const { id, type } = req.params;
  const table = type === 'freelancer' ? 'FREELANCER' : 'CLIENT';
  const typeId = type === 'freelancer' ? 'fid' : 'cid';

  const query = `DELETE FROM ${table} WHERE ${typeId} = ?`;

  global.con.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
};

module.exports = { register, login, deleteUser};

