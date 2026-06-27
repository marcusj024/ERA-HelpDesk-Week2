require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { connectMongo, getMongo } = require("./mongo");
const { Timestamp } = require("mongodb");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// root route
app.get("/", (req, res) => {
    res.json({
        message: "eratech soulutions helpdesk is runnning"
    });
});

// get /departments-returns all departments
app.get("/departments", (req, res) => {
    const sql = "SELECT * FROM departments";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("error getting departments:", err);
            return res.status(500).json({ error: "failed to get departments" });
        }
        res.json(results);
    });
});

//Get /users - returns all users (password excluded)

app.get("/users", (req, res) => {
    const sql = "SELECT id,first_name, last_name, email, role, department_id FROM users";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("error getting users:", err);
            return res.status(500).json({ error: "failed to get users" });
        }
        res.json(results);
    });
});

// Get /tickets -returns all tickets
app.get("/tickets", (req, res) => {
    const sql = "SELECT * FROM tickets";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("error getting tickets:", err);
            return res.status(500).json({ error: "failed to get tickets" });
        }
        res.json(results);
    });
});

// get /tickets/open - returns only open tickets
app.get("/tickets/open", (req, res) => {
    const sql = "SELECT * FROM tickets WHERE status = 'open'";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("error getting open tickets:", err);
            return res.status(500).json({ error: "failed to get open tickets" });
        }
        res.json(results);
    });
});

// GET /tickets/details - return all tickets with JOIN users and department names

app.get("/tickets/details", (req, res) => {
    const sql = "SELECT t.id AS ticket_id, t.title, t.description, t.priority, t.status, t.created_at, concat(u1.first_name, ' ', u1.last_name) AS submitted_by, concat(u2.first_name, ' ', u2.last_name) AS assigned_to, d.name AS department FROM tickets t JOIN users u1 ON t.submitted_by = u1.id LEFT JOIN users u2 ON t.assigned_to = u2.id JOIN departments d ON t.department_id = d.id ORDER BY t.created_at DESC";
    db.query(sql, (error, results) => {
        if(error) {
            console.error("error getting tickets details:", error);
            return res.status(500).json({error: "failed to get ticket details"});
        }
        res.json(results);
    });
});

// GET /tickets/:id/details - 

app.get("/tickets/:id/details", (req, res) => {
    const ticketId = req.params.id;
    const sql = "SELECT t.id AS ticket_id, t.title, t.description, t.priority, t.status, t.created_at, concat(u1.first_name, ' ', u1.last_name) AS submitted_by, concat(u2.first_name, ' ', u2.last_name) AS assigned_to, d.name AS department FROM tickets t JOIN users u1 ON t.submitted_by = u1.id LEFT JOIN users u2 ON t.assigned_to = u2.id JOIN departments d ON t.department_id = d.id WHERE t.id = ?";
    db.query(sql, [ticketId], (error, results) => {
        if(error) {
            console.error("error getting tickets details:", error);
            return res.status(500).json({error: "failed to get tickets detail"});
        }
    if(results.length === 0) {
        return res.status(404).json({ error: "ticket not found"});
    }
    res.json(results [0]);
    });
});

// GET /tickets/:id - returns a single ticket by id
app.get("/tickets/:id", (req, res) => {
    const ticketId = req.params.id;
    const sql = "SELECT * FROM tickets WHERE id = ?";
    db.query(sql, [ticketId], (err, results) => {
        if (err) {
            console.error("error getting ticket:", err);
            return res.status(500).json({ error: "failed to get ticket" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "ticket not found" });
        }
        res.json(results[0]);
    });
});



// Get /ticket-notes - returns all tickets notes from MongoDB

app.get("/ticket-notes", async (req, res) => {
    try {
        const mongoDb = getMongo();
        const notes = await mongoDb.collection("ticket_notes").find().toArray();
        res.json(notes);
    } catch (err) {
        console.error("error getting ticket notes:", err);
        res.status(500).json({ error: "failed to get ticket notes" });
    }
});

// get /tickets-notes/:ticketId - return notes for specific ticket

app.get("/ticket-notes/:ticketId", async (req, res) => {
    try {
        const ticketId = parseInt(req.params.ticketId);
        const mongoDb = getMongo();
        const notes = await mongoDb
            .collection("ticket_notes")
            .find({ ticket_id: ticketId })
            .toArray();
        res.json(notes);
    } catch (error) {
        console.error("error getting notes for ticket:", error);
        res.status(500).json({ error: "failed to get ticket notes" });
    }
});

// get /activity-logs - return activity logs from mongodb

app.get("/activity-logs", async (req, res) => {
    try {
        const mongoDb = getMongo();
        const logs = await mongoDb
            .collection("activity_logs")
            .find({})
            .sort({ Timestamp: -1 })
            .toArray();
        res.json(logs);
    } catch (error) {
        console.error("error getting activity logs: ", error);
        res.status(500).json({ error: "failed to get activity logs" });
    }
});



// Post/users - creates a new user
app.post("/users", (req, res) => {
    const { first_name, last_name, email, password, role, department_id } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res
            .status(400)
            .json({ error: "first_name, last_name, email, and password are required " });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: "password must be at least 8 characters long" });
    }
    const specialChar = /[!@#$%]/;
    if (!specialChar.test(password)) {
        return res
            .status(400)
            .json({ error: "password must include at least one special character ! @ # $ % " });
    }
    const sql =
        "INSERT users (first_name, last_name, email, password, role, department_id) VALUES (?,?,?,?,?,?)";
    const userRole = role || "employee";
    const deptId = department_id || null;
    db.query(sql, [first_name, last_name, email, password, userRole, deptId], (error, results) => {
        if (error) {
            console.error("error creating user:", error);
            return res.status(500).json({ error: "failed to created user" });
        }
        res.status(201).json({ message: "user created successfully", userId: results.insertId });
    });
});

// Post /tickets - create a new in MySQL and automatically logs action to mongoDb
app.post("/tickets", async (req, res) => {
    const { title, description, priority, status, submitted_by, assigned_to, department_id } =
        req.body;
    if (!title || !submitted_by) {
        return res.status(400).json({ error: "title and submitted_by are required" });
    }
    const ticketPriority = priority || "medium";
    const ticketStatus = status || "open";
    const assignedTo = assigned_to || null;
    const deptId = department_id || null;
    const sql =
        "INSERT INTO tickets (title, description, priority, status, submitted_by, assigned_to, department_id) VALUES (?,?,?,?,?,?,?)";
    db.query(
        sql,
        [title, description, ticketPriority, ticketStatus, submitted_by, assignedTo, deptId],
        async (error, results) => {
            if (error) {
                console.error("error creating ticket:", error);
                return res.status(500).json({ error: "failed to create ticket" });
            }
            const newTicketId = results.insertId;
            try {
                const mongoDb = getMongo();
                await mongoDb
                    .collection("activity_logs")
                    .insertOne({
                        action: "ticket_created",
                        user_id: submitted_by,
                        ticket_id: newTicketId,
                        details: `ticket created: ${title}`,
                        timestamp: new Date()
                    });
            } catch (mongoError) {
                console.error("failed to log activity", mongoError);
            }
            res.status(201).json({ message: "ticket created successfully", ticketId: newTicketId });
        }
    );
});

// Post /ticket-notes - add a note to a ticket in mongodb

app.post("/ticket-notes", async (req, res) => {
    const { ticket_id, note, added_by } = req.body;
    if (!ticket_id || !note || !added_by) {
        return res.status(400).json({ error: "ticket_id, added_by are required" });
    }
    try {
        const mongoDb = getMongo();
        const result = await mongoDb.collection("ticket_notes").insertOne({
            ticket_id: parseInt(ticket_id),
            note: note,
            added_by: added_by,
            created_at: new Date()
        });
        res.status(201).json({ message: "note added successfully", noteId: result.insertedId });
    } catch (error) {
        console.error("error adding note:", error);
        res.status(500).json({ error: "failed to add note" });
    }
});

// Post /activity-logs - manually create an activity log in mongoDb

app.post('/activity-logs', async (req, res) => {
    const { action, user_id, ticket_id, details} = req.body;
    if (!action || !details ) {
        return res.status(400).json({ error: "action and details are required"});
    }
    try {
        const mongoDb = getMongo();
        const result = await mongoDb.collection("activity_logs").insertOne({
            action: action,
            user_id: user_id || null,
            ticket_id: ticket_id || null,
            details: details,
            timestamp: new Date()
        });
        res.status(201).json({message: "activity log created", logId: result.insertedId});
    } catch (error) {
        console.error('error creating activity log:', error);
        res.status(500).json({ error: "failed to create activity log"});
    }
});

// Post /login - valid credential and returns user information with role

app.post('/login', async (req, res) => {
    const { email, password} = req.body;
    if (!email || !password ) {
        return res.status(400).json({ error: "email and password are required"});
    }
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async(error, results) => {
        if(error) {
            console.error('login query error: ', error);
            return res.status(500).json({error: 'something went wrong'});
        }
        if(results.length === 0) {
            return res.status(401).json({error: 'invalid email or password'});
        }
        const user = results[0];
        if(user.password !== password) {
            return res.status(401).json ({error: 'invalid email or password'});
        }
        try {
            const mongoDb = getMongo();
            await mongoDb.collection('activity_logs').insertOne({
        action: 'user_login', user_id: user.id, ticket_id: null, details: `${user.first_name} ${user.last_name} logged in as ${user.role}`,
        timestamp: new Date()
     });
        } catch(mongoError) {
            console.error('failed to log login activity: ', mongoError);
        }
        res.status(200).json({message: 'login successfully', 
            first_name: user.first_name,
            last_name: user.last_name, 
            role: user.role,
            used_id: user.id
        });
    });     
});



//start server - waits for mongodb before listening
async function startServer() {
    await connectMongo();
    app.listen(PORT, () => {
        console.log(`server running at http://localhost:${PORT}`);
    });
}

startServer();
