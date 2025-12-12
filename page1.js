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

app.listen(5500, () => console.log("Server running on port 5500"));