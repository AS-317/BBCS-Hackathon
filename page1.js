//import postgresql
import pkg from 'pg';
const {Client} = pkg;

let foodArr = [];

//add this function to html of search bar
function searchFunc() {
    let foodInput = prompt("Type food here or click options below: ");
    foodArr.push(foodInput);
};

//add this function to html of food suggestion buttons
function buttonFunc(btn) { 
    foodArr.push(btn.textContent); 
};

//variable that connects to database
const connection = new Client({
    host: 'ep-weathered-voice-a1oawxdj-pooler.ap-southeast-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_c1ICwiubznq2',
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
}