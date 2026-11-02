const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1525",
    database: "patient_management",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to MySQL database");
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// READ ALL PATIENTS
app.get("/patients", (req, res) => {
    const sql = "SELECT * FROM patients ORDER BY patient_id";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// READ ONE PATIENT
app.get("/patients/:patient_id", (req, res) => {
    const sql = "SELECT * FROM patients WHERE patient_id = ?";

    db.query(sql, [req.params.patient_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json(results[0]);
    });
});

// CREATE PATIENT
app.post("/patients", (req, res) => {
    const {
        patient_id,
        patient_name,
        email,
        phone_number,
        gender,
        age,
        problem
    } = req.body;

    if (
        !patient_id?.trim() ||
        !patient_name?.trim() ||
        !email?.trim() ||
        !phone_number?.trim() ||
        !gender ||
        age === undefined ||
        age === "" ||
        !problem?.trim()
    ) {
        return res.status(400).json({
            error: "Please fill in all fields"
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: "Enter a valid email address" });
    }

    if (!/^[0-9+()\-\s]{7,15}$/.test(phone_number.trim())) {
        return res.status(400).json({ error: "Enter a valid phone number" });
    }

    const patientAge = Number(age);

    if (!Number.isInteger(patientAge) || patientAge < 0 || patientAge > 130) {
        return res.status(400).json({ error: "Enter a valid age" });
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({ error: "Select a valid gender" });
    }

    const sql = `
        INSERT INTO patients
        (patient_id, patient_name, email, phone_number, gender, age, problem)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            patient_id.trim(),
            patient_name.trim(),
            email.trim(),
            phone_number.trim(),
            gender,
            patientAge,
            problem.trim()
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: "Patient added successfully",
                patient_id: result.insertId
            });
        }
    );
});

// UPDATE PATIENT
app.put("/patients/:patient_id", (req, res) => {
    const {
        patient_id,
        patient_name,
        email,
        phone_number,
        gender,
        age,
        problem
    } = req.body;

    if (
        !patient_id?.trim() ||
        !patient_name?.trim() ||
        !email?.trim() ||
        !phone_number?.trim() ||
        !gender ||
        age === undefined ||
        age === "" ||
        !problem?.trim()
    ) {
        return res.status(400).json({
            error: "Please fill in all fields"
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: "Enter a valid email address" });
    }

    if (!/^[0-9+()\-\s]{7,15}$/.test(phone_number.trim())) {
        return res.status(400).json({ error: "Enter a valid phone number" });
    }

    const patientAge = Number(age);

    if (!Number.isInteger(patientAge) || patientAge < 0 || patientAge > 130) {
        return res.status(400).json({ error: "Enter a valid age" });
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({ error: "Select a valid gender" });
    }

    const sql = `
        UPDATE patients
        SET 
            patient_id = ?,
            patient_name = ?,
            email = ?,
            phone_number = ?,
            gender = ?,
            age = ?,
            problem = ?
        WHERE patient_id = ?
    `;

    db.query(
        sql,
        [
            patient_id.trim(),
            patient_name.trim(),
            email.trim(),
            phone_number.trim(),
            gender,
            patientAge,
            problem.trim(),
            req.params.patient_id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Patient not found" });
            }

            res.json({ message: "Patient updated successfully" });
        }
    );
});

// DELETE PATIENT
app.delete("/patients/:patient_id", (req, res) => {
    const sql = "DELETE FROM patients WHERE patient_id = ?";

    db.query(sql, [req.params.patient_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.json({ message: "Patient deleted successfully" });
    });
});

app.listen(PORT, () => {
    console.log(
        `SANJAY PATIENT MANAGEMENT SYSTEM running at http://localhost:${PORT}`
    );
});