//import node.js
import express from 'express';
import { connection } from './db.js'; //handles database connection details

let foodArr = [];

//add this function to html of food suggestion buttons
function buttonFunc(btn) {
    if (foodArr.includes(btn.textContent) === false) {
        foodArr.push(btn.textContent);
    } else {
        foodArr = foodArr.filter(item => item !== btn.textContent);
        //for user to deselect
    }     
};

/* Possible code 1 (partially taken from chatGPT)
//import postgresql
import pkg from 'pg';
const {Client} = pkg;

//variable that connects to database
const connection = new Client({
    host: 'ep-weathered-voice-a1oawxdj-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'db_password',
    database: 'neondb',
    port: 5432,
    ssl: {
        mode: 'require',
        channel_binding: 'require'
    }
});

await connection.connect();

//add this function to html of submit button
async function submitFunc() {
    if (foodArr.length !== 0) {
        let tableArr = [];

        for (let i = 0; i < foodArr.length; i++) {
            try {
                //query to run in database, returns recipe names and links
                const res = await connection.query(
                    `SELECT recipename, recipelink FROM recipes WHERE recipeid IN (
                        SELECT recipeid FROM Ingredients1 WHERE ingredientname LIKE $1
                    );`,
                    [`%${foodArr[i]}%`]
                );
                tableArr.push(...res.rows);
            } catch (err) {
            console.error('Database error:', err);
            }
        }

        //removes duplicates of recipes
        let resultArr = [...new Map(tableArr.map(r => [r.recipename, r])).values()];
        return resultArr;
    }
} */

/* Possible code 2 (partially taken from chatGPT) 
const app = express();
app.use(express.json());

async function submitFunc(req, res) {
    const foodArr = req.body.foodArr;

    //To connect to sql database (which we face challenges doing)
    const response = await fetch('http://localhost:5500/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodArr })
    });

    const data = await response.json();  // server sends JSON
    console.log(data);

    if (!foodArr || !Array.isArray(foodArr))
        return res.status(400).json({ error: "Invalid input" });
    //If no selection (empty array)

    let tableArr = [];

    for (let item of foodArr) {
        try {
            const result = await connection.query(
                `SELECT recipename, recipelink FROM recipes WHERE recipeid IN (
                    SELECT UNNEST(recipeid) FROM ingredients WHERE ingredients LIKE $1
                )`,
                [`%${item}%`]
            );
            //Sends query to database
            tableArr.push(...result.rows);
        } catch (err) {
            console.error(err);
        }
    }

    let resultArr = [...new Map(tableArr.map(r => [r.recipename, r])).values()]; //Ensures no repeats
    res.json(resultArr);
    //Returns array of recipe names and links
};

app.post('/search', submitFunc);

app.listen(5500, () => console.log("Server running on port 5500")); */

//Taken from the slides, we're not sure how to actually make it work.
const NEON_CONNECTION = "redacted…";
   import { neon } from 'https://cdn.jsdelivr.net/npm/@neondatabase/serverless@1.0.2/+esm';
   const sql = neon(NEON_CONNECTION);
   async function submitFunc() {
     try {
       const result = await sql(`SELECT recipename, recipelink FROM recipes WHERE recipeid IN (
                    SELECT UNNEST(recipeid) FROM ingredients WHERE ingredients LIKE $1
                )`,
                [`%${item}%`]
            );
       const list = document.getElementById("list");
       list.innerHTML = result.map(r => `<li><a href="${r.recipelink}">${r.recipename}</a></li>`).join("");
     } catch (err) {
       console.error(err);
       alert("Error loading data. Check console.");
     }
   }
   window.addEventListener("DOMContentLoaded", submitFunc);