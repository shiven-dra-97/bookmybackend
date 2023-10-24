const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require("dotenv").config()
const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'seats.db');
let db;
const port = process.env.PORT || 8080;

const initializeSeatsTable = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const tableExists = await db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='seats'`
    );

    if (!tableExists) {
      await db.run(`
        CREATE TABLE IF NOT EXISTS seats (
          id INTEGER PRIMARY KEY,
          seatNumber TEXT,
          booked BOOLEAN,
          price INTEGER,
          isPremium BOOLEAN
        )
      `);

      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
      const prices = {
        A: { price: 250, isPremium: false, seatCount: 16 },
        B: { price: 250, isPremium: false, seatCount: 16 },
        C: { price: 250, isPremium: false, seatCount: 16 },
        D: { price: 250, isPremium: false, seatCount: 16 },
        E: { price: 250, isPremium: false, seatCount: 16 },
        F: { price: 250, isPremium: false, seatCount: 16 },
        G: { price: 250, isPremium: false, seatCount: 16 },
        H: { price: 250, isPremium: false, seatCount: 16 },
        I: { price: 500, isPremium: true, seatCount: 20 },
        J: { price: 500, isPremium: true, seatCount: 20 },
        K: { price: 500, isPremium: true, seatCount: 20 },
        L: { price: 500, isPremium: true, seatCount: 20 },
        M: { price: 500, isPremium: true, seatCount: 20 },
      };

      for (let row of rows) {
        for (let i = 1; i <= prices[row].seatCount; i++) {
          const seatNumber = `${row}${i}`;
          const booked = false;

          const { price, isPremium } = prices[row];

          await db.run(`
            INSERT INTO seats (seatNumber, booked, price, isPremium)
            VALUES (?, ?, ?, ?)
          `, [seatNumber, booked, price, isPremium]);
        }
      }
    }
    
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeSeatsTable();

app.get('/seats', async (req, res) => {
  try {
    const seats = await db.all('SELECT * FROM seats');
    res.json(seats);
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put("/booking",async(req,res)=>{
    const reqSeatsNo=req.body
    let idString
    try {
      if(reqSeatsNo.lenght===1){
        idString=reqSeatsNo[0].toString()
      }else{
        idString=reqSeatsNo.join(',')
      }
      const query=`UPDATE seats SET booked=1 WHERE id IN (${idString})`
      await db.run(query)
      res.json({ message: `Your ticket has been been booked successfully` });
    } catch (error) {
           console.log(error)
    }
})