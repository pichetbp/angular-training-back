const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: "admin01",
  // host: "db", // docker-compose service name
  host: "localhost", // docker-compose service name
  database: "Registration",
  password: "Pa55w.rd",
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error("Connection error !!", err.stack);
  } else {
    console.log("Connected to PostgreSQL");
  }
});

const mockUsers = [{ username: "admin", password: "admin" }];

app.post("/api/auth/login", (req, res) => {
  console.log("POST /api/auth/login");
  const { username, password } = req.body;
  const user = mockUsers.find(
    (user) => user.username === username && user.password === password
  );
  if (user) {
    return res.json({ token: "mock-jwt-token" });
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

// get all registers
app.get("/api/registers", async (req, res) => {
  console.log("GET /api/registers");
  try {
    const result = await pool.query(
      "SELECT * FROM registration_course order by id asc"
    );
    if (result.rows.length === 0) {
      return res.status(404).send("No registers in the database");
    }
    return res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    return res.status(500).send("Error executing query");
  }
});

// get register
app.get("/api/register/:id", async (req, res) => {
  console.log("GET /api/register/:id");
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query(
      "SELECT * FROM registration_course WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Register not found");
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    return res.status(500).send("Error executing query");
  }
});

// create register
app.post("/api/register", async (req, res) => {
  console.log("POST /api/register");
  const { name, email, course } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO registration_course (name, email, course) VALUES ($1, $2, $3) RETURNING *",
      [name, email, course]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    return res.status(500).send("Error executing query");
  }
});

// update register
app.put("/api/register/:id", async (req, res) => {
  console.log("PUT /api/register/:id");
  const id = parseInt(req.params.id);
  const { name, email, course } = req.body;
  try {
    const result = await pool.query(
      "UPDATE registration_course SET name = $1, email = $2, course = $3 WHERE id = $4 RETURNING *",
      [name, email, course, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Register not found");
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    return res.status(500).send("Error executing query");
  }
});

// delete register
app.delete("/api/register/:id", async (req, res) => {
  console.log("DELETE /api/register/:id");
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query(
      "DELETE FROM registration_course WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Register not found");
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    return res.status(500).send("Error executing query");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
