const jwt = require("jsonwebtoken");
const { Client } = require("pg");
const Notification = require("../Models/NotificationModel");

const db = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "12345",
  database: "follow-up system",
});

db.connect();

const adminEmail = "admin@gmail.com";
const adminPassword = "123";
const adminSecret = "adminToken";

const adminLogin = (req, res) => {
  if (req.body.email === adminEmail && req.body.password === adminPassword) {
    const admin_Secret = jwt.sign({ id: "thisIsAdmin" }, adminSecret, {
      expiresIn: "1d",
    });
    res.status(200).send({
      message: "Admin logged in successfully",
      success: true,
      admin_Secret,
    });
  } else {
    res
      .status(500)
      .send({ message: "Username or password is incorrect", success: false });
  }
};

const GetUserData = async (req, res) => {
  try {
    const sqlGet = "SELECT * FROM userdata";
    db.query(sqlGet, (err, result) => {
      if (err) {
        console.log("error", err);
      }
      res.status(200).json({ result, success: true });
    });
  } catch (error) {
    res.status(500).send({ message: " Error in Backend ", error });
  }
};

const GetSingleuser = async (req, res) => {
  try {
    const id = req.params.id;

    const sqlGet = `SELECT * FROM userdata WHERE id = $1`;

    const result = await db.query(sqlGet, [id]);

    if (result) {
      res.send(result);
    } else {
      console.log(err);
      res.status(500).send("Error in Backend");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in Backend");
  }
};

const CreateFollowup = async (req, res) => {
  try {
    const id = req.params.id;

    console.log(req.body);

    const status = req.body.status;

    const follow_up_date = new Date();
    console.log(follow_up_date);

    const sqlInsert = `INSERT INTO follow_up(user_id,status,follow_up_date) VALUES ( $1 , $2 , $3)`;

    db.query(sqlInsert, [id, status, follow_up_date], (error, result) => {
      if (result) {
        res.send(result);
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const GetFollowUp = async (req, res) => {
  try {
    const id = req.params.id;

    const sqlGet = `SELECT * FROM follow_up WHERE user_id = $1`;

    const result = await db.query(sqlGet, [id]);

    if (result) {
      res.send(result);
    } else {
      console.log(err);
      res.status(500).send("Error in Backend");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in Backend");
  }
};

const EditFolloup = async (req, res) => {
  try {
    const id = req.params.id;

    const { status } = req.body;

    const follow_up_date = new Date();

    const sqlUpdate = `UPDATE follow_up SET status = $1 ,follow_up_date = $2 WHERE user_id = $3`;

    const result = await db.query(sqlUpdate, [status, follow_up_date, id]);

    if (result) {
      res.send(result);
    } else {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

const GetNotification = async (req, res) => {
  try {
    const notification = await Notification.find({ read: "Unread" });
    res
      .status(200)
      .send({ message: "Notification fetched", notification, success: true });
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .send({ message: "Error fetching Notification ", success: false });
  }
};

const UpdateNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    await Notification.findById({
      _id: notificationId,
    });

    await Notification.updateOne(
      { _id: notificationId },
      {
        $set: {
          read: "Readed",
        },
      }
    );

    res
      .status(200)
      .json({ message: "Notification update suceessfull ", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Notification update Failed ", success: false });
    console.log(error);
  }
};

const GetUserwithFollowup = async (req, res) => {
  try {
    const query = `
      SELECT u.* 
      FROM userdata u
      INNER JOIN follow_up f ON u.id = f.user_id
    `;
    const result = await db.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users with follow-ups:", error);
    res.status(500).json({
      message: "Error fetching users with follow-ups",
      success: false,
    });
  }
};

const GetUserWithoutFollowup = async (req, res) => {
  try {
    const query = `
      SELECT u.* 
      FROM userdata u
      LEFT JOIN follow_up f ON u.id = f.user_id
      WHERE f.user_id IS NULL
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users without follow-ups:", error);
    res.status(500).json({
      message: "Error fetching users without follow-ups",
      success: false,
    });
  }
};

const GetDataDashboard = async (req, res) => {
  try {
    const GetAllUser = "SELECT * FROM userdata";
    const totalusers = await db.query(GetAllUser);

    const GetNonFollowUpUser = `
      SELECT u.* 
      FROM userdata u
      LEFT JOIN follow_up f ON u.id = f.user_id
      WHERE f.user_id IS NULL
    `;

    const nonfollowupusers = await db.query(GetNonFollowUpUser);

    const GetFollowUpUser = `
      SELECT u.* 
      FROM userdata u
      INNER JOIN follow_up f ON u.id = f.user_id
    `;
    const followupusers = await db.query(GetFollowUpUser);

    res.status(200).send({
      message: " Data Fetched ",
      totalusers,
      nonfollowupusers,
      followupusers,
      success: true,
    });
  } catch (error) {
    res.status(500).send({ message: " Error in Backend ", error });
  }
};

module.exports = {
  adminLogin,
  GetUserData,
  GetSingleuser,
  CreateFollowup,
  GetFollowUp,
  EditFolloup,
  GetNotification,
  GetUserwithFollowup,
  GetUserWithoutFollowup,
  GetDataDashboard,
  UpdateNotification,
};
