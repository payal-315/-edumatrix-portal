// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db'); // promise-based file
const app = express();
const PORT = 3000;

app.use(cors()); // allow frontend to connect
app.use(express.json()); // parse JSON data from frontend
app.use(express.urlencoded({ extended: true })); // parse URL-encoded data

// Test route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Route to add user without password (test/demo)
app.post('/add-user', (req, res) => {
  const { name, email } = req.body;
  const sql = 'INSERT INTO users (username, email) VALUES (?, ?)';
  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error('❌ Error inserting user:', err);
      return res.status(500).send('Database error');
    }
    res.send('✅ User added successfully');
  });
});

// 🔐 Signup route with password hashing
app.post('/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  const { name, email, phone, password } = req.body;
  try {
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)';
    await db.query(sql, [name, email, phone, hashedPassword]);
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
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

// ==========================================
// PERSONAL INFO API ROUTES
// ==========================================

app.put('/api/personal-info/:userId', async (req, res) => {
    try {
        const urlUserId = req.params.userId;
        const {
            full_name, dob, gender, blood_group, email, phone, alt_phone,
            address, city, state, zip, father_name, father_phone,
            father_alt_phone, mother_name, mother_phone, mother_alt_phone,
            nationality, aadhar, guardian_name, guardian_relation, guardian_phone
        } = req.body;

        const sql = `
            INSERT INTO personal_info (
                user_id, full_name, dob, gender, blood_group, email, phone, alt_phone,
                address, city, state, zip, father_name, father_phone, father_alt_phone,
                mother_name, mother_phone, mother_alt_phone, nationality, aadhar,
                guardian_name, guardian_relation, guardian_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                full_name = VALUES(full_name),
                dob = VALUES(dob),
                gender = VALUES(gender),
                blood_group = VALUES(blood_group),
                email = VALUES(email),
                phone = VALUES(phone),
                alt_phone = VALUES(alt_phone),
                address = VALUES(address),
                city = VALUES(city),
                state = VALUES(state),
                zip = VALUES(zip),
                father_name = VALUES(father_name),
                father_phone = VALUES(father_phone),
                father_alt_phone = VALUES(father_alt_phone),
                mother_name = VALUES(mother_name),
                mother_phone = VALUES(mother_phone),
                mother_alt_phone = VALUES(mother_alt_phone),
                nationality = VALUES(nationality),
                aadhar = VALUES(aadhar),
                guardian_name = VALUES(guardian_name),
                guardian_relation = VALUES(guardian_relation),
                guardian_phone = VALUES(guardian_phone)
        `;

        const params = [
            urlUserId, full_name, dob, gender, blood_group, email, phone, alt_phone,
            address, city, state, zip, father_name, father_phone, father_alt_phone,
            mother_name, mother_phone, mother_alt_phone, nationality, aadhar,
            guardian_name, guardian_relation, guardian_phone
        ];

        await db.query(sql, params);
        const [updatedRows] = await db.query('SELECT * FROM personal_info WHERE user_id = ?', [urlUserId]);

        if (updatedRows.length === 0) {
            return res.status(500).json({ message: 'Failed to retrieve updated personal info.' });
        }

        res.status(200).json({
            message: 'Personal info saved/updated successfully',
            personalInfo: updatedRows[0]
        });

    } catch (err) {
        console.error('❌ Error saving/updating personal info:', err);
        res.status(500).json({ message: 'Server error while saving/updating personal info', error: err.message });
    }
});

app.get('/api/personal-info/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const sql = 'SELECT * FROM personal_info WHERE user_id = ?';
        const [rows] = await db.query(sql, [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Personal info not found for this user.' });
        }
        res.status(200).json({ message: 'Personal info retrieved successfully', personalInfo: rows[0] });
    } catch (err) {
        console.error('❌ Error retrieving personal info:', err);
        res.status(500).json({ message: 'Server error while retrieving personal info' });
    }
});

// ==========================================
// ACADEMIC INFO ROUTES (UPDATED FOR DYNAMIC SUBJECTS)
// ==========================================

app.get('/api/academic-info/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const sql = 'SELECT * FROM academic_info WHERE user_id = ? ORDER BY semester ASC';
        const [rows] = await db.query(sql, [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No academic info found for this user.' });
        }
        res.status(200).json({ message: 'Academic info retrieved successfully', academicInfo: rows });
    } catch (err) {
        console.error('❌ Error retrieving academic info:', err);
        res.status(500).json({ message: 'Server error while retrieving academic info.' });
    }
});

app.post('/api/academic-info', async (req, res) => {
    try {
        let {
            user_id, usn, name, department, semester, 
            sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sub9,
            sgpa, cgpa, total_classes, attended_classes, attendance_percent, remarks
        } = req.body;

        const sql = `INSERT INTO academic_info (
            user_id, usn, name, department, semester, 
            sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sub9,
            sgpa, cgpa, total_classes, attended_classes, attendance, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            usn = VALUES(usn),
            name = VALUES(name),
            department = VALUES(department),
            semester = VALUES(semester),
            sub1 = VALUES(sub1),
            sub2 = VALUES(sub2),
            sub3 = VALUES(sub3),
            sub4 = VALUES(sub4),
            sub5 = VALUES(sub5),
            sub6 = VALUES(sub6),
            sub7 = VALUES(sub7),
            sub8 = VALUES(sub8),
            sub9 = VALUES(sub9),
            sgpa = VALUES(sgpa),
            cgpa = VALUES(cgpa),
            total_classes = VALUES(total_classes),
            attended_classes = VALUES(attended_classes),
            attendance = VALUES(attendance),
            remarks = VALUES(remarks)`;

        const params = [
            user_id, usn, name, department, semester, 
            sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8, sub9,
            sgpa, cgpa, total_classes, attended_classes, attendance_percent, remarks
        ];

        await db.query(sql, params);
        res.status(201).json({ message: 'Academic info saved/updated successfully' });
    } catch (err) {
        console.error('❌ Error saving/updating academic info:', err);
        res.status(500).json({ message: 'Server error while saving/updating academic info.' });
    }
});

app.delete('/api/academic-info/:recordId', async (req, res) => {
    const recordId = req.params.recordId;
    try {
        const [result] = await db.query('DELETE FROM academic_info WHERE id = ?', [recordId]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Academic record deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Academic record not found.' });
        }
    } catch (err) {
        console.error('❌ Error deleting academic record:', err);
        res.status(500).json({ message: 'Server error while deleting academic record.' });
    }
});

// ==========================================
// EXTRACURRICULAR ROUTES
// ==========================================

app.get('/api/extracurricular/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const [hackathons] = await db.query('SELECT id, role, technologies, project FROM hackathons WHERE user_id = ?', [userId]);
        const [events] = await db.query('SELECT id, name, type, award, date FROM events WHERE user_id = ?', [userId]);
        const [awards] = await db.query('SELECT id, name, organization, date, description FROM awards WHERE user_id = ?', [userId]);
        const [certificates] = await db.query('SELECT id, name, organization, date, description FROM certificates WHERE user_id = ?', [userId]);
        
        if (hackathons.length === 0 && events.length === 0 && awards.length === 0 && certificates.length === 0) {
            return res.status(404).json({ message: 'No extracurricular records found for this user.' });
        }
        res.status(200).json({ hackathons, events, awards, certificates });
    } catch (err) {
        console.error('❌ Error fetching extracurricular data:', err);
        res.status(500).json({ message: 'Server error while fetching extracurricular data.' });
    }
});

app.post('/api/extracurricular', async (req, res) => {
    const { userId, hackathons, events, awards, certificates } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Handle Hackathons Sync
        const [existingHackathons] = await connection.query('SELECT id FROM hackathons WHERE user_id = ?', [userId]);
        const existingHackathonIds = new Set(existingHackathons.map(h => h.id));
        const currentHackathonIds = new Set(hackathons.map(h => h.id).filter(id => id !== null));
        const hackathonsToDelete = [...existingHackathonIds].filter(id => !currentHackathonIds.has(id));
        if (hackathonsToDelete.length > 0) {
            await connection.query('DELETE FROM hackathons WHERE id IN (?) AND user_id = ?', [hackathonsToDelete, userId]);
        }
        for (const h of hackathons) {
            if (h.id) {
                await connection.query('UPDATE hackathons SET role = ?, technologies = ?, project = ? WHERE id = ? AND user_id = ?', [h.role, h.technologies, h.project, h.id, userId]);
            } else {
                await connection.query('INSERT INTO hackathons (user_id, role, technologies, project) VALUES (?, ?, ?, ?)', [userId, h.role, h.technologies, h.project]);
            }
        }

        // Handle Events Sync
        const [existingEvents] = await connection.query('SELECT id FROM events WHERE user_id = ?', [userId]);
        const existingEventIds = new Set(existingEvents.map(e => e.id));
        const currentEventIds = new Set(events.map(e => e.id).filter(id => id !== null));
        const eventsToDelete = [...existingEventIds].filter(id => !currentEventIds.has(id));
        if (eventsToDelete.length > 0) {
            await connection.query('DELETE FROM events WHERE id IN (?) AND user_id = ?', [eventsToDelete, userId]);
        }
        for (const e of events) {
            if (e.id) {
                await connection.query('UPDATE events SET name = ?, type = ?, award = ?, date = ? WHERE id = ? AND user_id = ?', [e.name, e.type, e.award, e.date, e.id, userId]);
            } else {
                await connection.query('INSERT INTO events (user_id, name, type, award, date) VALUES (?, ?, ?, ?, ?)', [userId, e.name, e.type, e.award, e.date]);
            }
        }

        // Handle Awards Sync
        const [existingAwards] = await connection.query('SELECT id FROM awards WHERE user_id = ?', [userId]);
        const existingAwardIds = new Set(existingAwards.map(a => a.id));
        const currentAwardIds = new Set(awards.map(a => a.id).filter(id => id !== null));
        const awardsToDelete = [...existingAwardIds].filter(id => !currentAwardIds.has(id));
        if (awardsToDelete.length > 0) {
            await connection.query('DELETE FROM awards WHERE id IN (?) AND user_id = ?', [awardsToDelete, userId]);
        }
        for (const a of awards) {
            if (a.id) {
                await connection.query('UPDATE awards SET name = ?, organization = ?, date = ?, description = ? WHERE id = ? AND user_id = ?', [a.name, a.organization, a.date, a.description, a.id, userId]);
            } else {
                await connection.query('INSERT INTO awards (user_id, name, organization, date, description) VALUES (?, ?, ?, ?, ?)', [userId, a.name, a.organization, a.date, a.description]);
            }
        }

        // Handle Certificates Sync
        const [existingCertificates] = await connection.query('SELECT id FROM certificates WHERE user_id = ?', [userId]);
        const existingCertificateIds = new Set(existingCertificates.map(c => c.id));
        const currentCertificateIds = new Set(certificates.map(c => c.id).filter(id => id !== null));
        const certificatesToDelete = [...existingCertificateIds].filter(id => !currentCertificateIds.has(id));
        if (certificatesToDelete.length > 0) {
            await connection.query('DELETE FROM certificates WHERE id IN (?) AND user_id = ?', [certificatesToDelete, userId]);
        }
        for (const c of certificates) {
            if (c.id) {
                await connection.query('UPDATE certificates SET name = ?, organization = ?, date = ?, description = ? WHERE id = ? AND user_id = ?', [c.name, c.organization, c.date, c.description, c.id, userId]);
            } else {
                await connection.query('INSERT INTO certificates (user_id, name, organization, date, description) VALUES (?, ?, ?, ?, ?)', [userId, c.name, c.organization, c.date, c.description]);
            }
        }

        await connection.commit();
        res.status(200).json({ message: 'Extracurricular details saved successfully!' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Error saving extracurricular details:', err);
        res.status(500).json({ message: 'Server error while saving extracurricular details.' });
    } finally {
        connection.release();
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});