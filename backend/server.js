// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Signup route with password hashing
app.post('/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  const { name, email, phone, password } = req.body;
  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, email, phone, hashedPassword]
    );
    res.status(201).json({ message: 'Signup successful', userId: result.lastID });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const { password: pwd, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', user: userWithoutPassword });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// PERSONAL INFO API
app.put('/api/personal-info/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      full_name, dob, gender, blood_group, email, phone, alt_phone,
      address, city, state, zip, father_name, father_phone,
      father_alt_phone, mother_name, mother_phone, mother_alt_phone,
      nationality, aadhar, guardian_name, guardian_relation, guardian_phone
    } = req.body;

    // Check if exists
    const existing = await db.query('SELECT id FROM personal_info WHERE user_id = ?', [userId]);
    
    if (existing.length > 0) {
      await db.run(`UPDATE personal_info SET
        full_name=?, dob=?, gender=?, blood_group=?, email=?, phone=?, alt_phone=?,
        address=?, city=?, state=?, zip=?, father_name=?, father_phone=?, father_alt_phone=?,
        mother_name=?, mother_phone=?, mother_alt_phone=?, nationality=?, aadhar=?,
        guardian_name=?, guardian_relation=?, guardian_phone=?
        WHERE user_id=?`,
        [full_name, dob, gender, blood_group, email, phone, alt_phone,
        address, city, state, zip, father_name, father_phone, father_alt_phone,
        mother_name, mother_phone, mother_alt_phone, nationality, aadhar,
        guardian_name, guardian_relation, guardian_phone, userId]
      );
    } else {
      await db.run(`INSERT INTO personal_info (
        user_id, full_name, dob, gender, blood_group, email, phone, alt_phone,
        address, city, state, zip, father_name, father_phone, father_alt_phone,
        mother_name, mother_phone, mother_alt_phone, nationality, aadhar,
        guardian_name, guardian_relation, guardian_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, full_name, dob, gender, blood_group, email, phone, alt_phone,
        address, city, state, zip, father_name, father_phone, father_alt_phone,
        mother_name, mother_phone, mother_alt_phone, nationality, aadhar,
        guardian_name, guardian_relation, guardian_phone]
      );
    }

    const rows = await db.query('SELECT * FROM personal_info WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'Personal info saved successfully', personalInfo: rows[0] });
  } catch (err) {
    console.error('❌ Error saving personal info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/personal-info/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const rows = await db.query('SELECT * FROM personal_info WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Personal info not found' });
    }
    res.status(200).json({ message: 'Success', personalInfo: rows[0] });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ACADEMIC INFO
app.get('/api/academic-info/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const rows = await db.query('SELECT * FROM academic_info WHERE user_id = ? ORDER BY semester ASC', [userId]);
    res.status(200).json({ message: 'Success', academicInfo: rows });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/academic-info', async (req, res) => {
  try {
    const {
      user_id, usn, name, department, semester,
      sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sub9,
      sgpa, cgpa, total_classes, attended_classes, attendance, remarks
    } = req.body;

    // Check if exists for this semester
    const existing = await db.query('SELECT id FROM academic_info WHERE user_id = ? AND semester = ?', [user_id, semester]);

    if (existing.length > 0) {
      await db.run(`UPDATE academic_info SET
        usn=?, name=?, department=?, sub1=?, sub2=?, sub3=?, sub4=?, sub5=?,
        sub6=?, sub7=?, sub8=?, sub9=?, sgpa=?, cgpa=?, total_classes=?,
        attended_classes=?, attendance=?, remarks=? WHERE user_id=? AND semester=?`,
        [usn, name, department, sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sub9,
        sgpa, cgpa, total_classes, attended_classes, attendance, remarks, user_id, semester]
      );
    } else {
      await db.run(`INSERT INTO academic_info (
        user_id, usn, name, department, semester, sub1, sub2, sub3, sub4, sub5,
        sub6, sub7, sub8, sub9, sgpa, cgpa, total_classes, attended_classes, attendance, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, usn, name, department, semester, sub1, sub2, sub3, sub4, sub5,
        sub6, sub7, sub8, sub9, sgpa, cgpa, total_classes, attended_classes, attendance, remarks]
      );
    }

    res.status(201).json({ message: 'Academic info saved successfully' });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/academic-info/:recordId', async (req, res) => {
  const recordId = req.params.recordId;
  try {
    await db.run('DELETE FROM academic_info WHERE id = ?', [recordId]);
    res.status(200).json({ message: 'Record deleted' });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// EXTRACURRICULAR
app.get('/api/extracurricular/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const hackathons = await db.query('SELECT * FROM hackathons WHERE user_id = ?', [userId]);
    const events = await db.query('SELECT * FROM events WHERE user_id = ?', [userId]);
    const awards = await db.query('SELECT * FROM awards WHERE user_id = ?', [userId]);
    const certificates = await db.query('SELECT * FROM certificates WHERE user_id = ?', [userId]);
    res.status(200).json({ hackathons, events, awards, certificates });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/extracurricular', async (req, res) => {
  const { userId, hackathons, events, awards, certificates } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }
  try {
    // Delete old and insert new
    await db.run('DELETE FROM hackathons WHERE user_id = ?', [userId]);
    for (const h of hackathons) {
      await db.run('INSERT INTO hackathons (user_id, role, technologies, project) VALUES (?, ?, ?, ?)',
        [userId, h.role, h.technologies, h.project]);
    }

    await db.run('DELETE FROM events WHERE user_id = ?', [userId]);
    for (const e of events) {
      await db.run('INSERT INTO events (user_id, name, type, award, date) VALUES (?, ?, ?, ?, ?)',
        [userId, e.name, e.type, e.award, e.date]);
    }

    await db.run('DELETE FROM awards WHERE user_id = ?', [userId]);
    for (const a of awards) {
      await db.run('INSERT INTO awards (user_id, name, organization, date, description) VALUES (?, ?, ?, ?, ?)',
        [userId, a.name, a.organization, a.date, a.description]);
    }

    await db.run('DELETE FROM certificates WHERE user_id = ?', [userId]);
    for (const c of certificates) {
      await db.run('INSERT INTO certificates (user_id, name, organization, date, description) VALUES (?, ?, ?, ?, ?)',
        [userId, c.name, c.organization, c.date, c.description]);
    }

    res.status(200).json({ message: 'Extracurricular saved successfully!' });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GOALS API
app.put('/api/goals/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { goal_sgpa, goal_attendance, goal_study_hours, goal_books, goal_hackathons, goal_certificates, goal_note } = req.body;
    const existing = await db.query('SELECT id FROM goals WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      await db.run(`UPDATE goals SET goal_sgpa=?, goal_attendance=?, goal_study_hours=?, goal_books=?, goal_hackathons=?, goal_certificates=?, goal_note=? WHERE user_id=?`,
        [goal_sgpa, goal_attendance, goal_study_hours, goal_books, goal_hackathons, goal_certificates, goal_note, userId]);
    } else {
      await db.run(`INSERT INTO goals (user_id, goal_sgpa, goal_attendance, goal_study_hours, goal_books, goal_hackathons, goal_certificates, goal_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, goal_sgpa, goal_attendance, goal_study_hours, goal_books, goal_hackathons, goal_certificates, goal_note]);
    }
    res.status(200).json({ message: 'Goals saved successfully' });
  } catch (err) {
    console.error('Error saving goals:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/goals/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const rows = await db.query('SELECT * FROM goals WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Goals not found' });
    }
    res.status(200).json({ message: 'Success', goals: rows[0] });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
