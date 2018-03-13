
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
  // Host
  host: "localhost",

  // Port
  port: 3306,

  // Username
  user: "root",

  // Password
  password: "root",

  // Database
  database: "bamazon"
});



connection.connect(function(err) {
  if (err) throw err;
  connection.query("SELECT * FROM products", function (err, result, fields) {
    if (err) throw err;

    // Connection Testing
    console.log("Connected to Database!");
    // connection.end();
    // console.log("Disconnected from Database!");

    // Show Table
    console.log(result);

    inventory();

    // begin();
  });
});




// Inventory

function inventory() {

    // Sets up table
    var table = new Table({
        head: ["ID", "Product", "Department", "Price", "Stock"],
        colWidths: [10, 20, 20, 20, 20]
    });

    listInventory();

    // Lists inventory
    function listInventory() {

        //Connect to database to list products

        connection.query("SELECT * FROM products", function(err, result) {
            for (var i = 0; i < result.length; i++) {

                var itemId = result[i].item_id,
                    productName = result[i].product_name,
                    departmentName = result[i].department_name,
                    price = result[i].price,
                    stockQuantity = result[i].stock;

              table.push(
                  [itemId, productName, departmentName, price, stockQuantity]
            );
          }
            console.log("");
            console.log("--------------------- Bamazon Inventory ---------------------");
            console.log("");
            console.log(table.toString());
            console.log("");
            purchaseTime();
        });
    }
}





// function which prompts the user for what action they should take
function purchaseTime() {
  inquirer
    .prompt([

    {
      name: "product_id",
      type: "input",
      // validate: validateInput,
      // filter: number,
      message: "Please enter the ID number of the item you would like to purchase."   
    },

    {
      name: "input_quantity",
      type: "input",
      // validate: validateInput,
      // filter: number,
      message: "How many units of this item would you like to purchase?" 
    }

    ])

    .then(function(userPurchase) {

            //connect to database to find stock_quantity in database. If user quantity input is greater than stock, decline purchase.

            connection.query("SELECT * FROM products WHERE item_id=?", userPurchase.productId, function(err, result) {
                for (var i = 0; i < result.length; i++) {

                    if (userPurchase.input_quantity > result[i].stock) {

                        console.log("----------------------------------------------------------");
                        console.log("We do not have that item in stock, please try again later.");
                        console.log("----------------------------------------------------------");
                        begin();

                    } else {
                        //list item information for user for confirm prompt
                        console.log("===================================");
                        console.log("-------------------------");
                        console.log("Your order was fulfilled.");
                        console.log("-------------------------");
                        console.log("You've selected:");
                        console.log("----------------");
                        console.log("Product: " + result[i].product_name);
                        console.log("Department: " + result[i].department_name);
                        console.log("Price: " + result[i].price);
                        console.log("Quantity: " + userPurchase.inputNumber);
                        console.log("----------------");
                        console.log("Total: " + result[i].price * userPurchase.input_quantity);
                        console.log("===================================");

                        var newStock = (result[i].stock - userPurchase.input_quantity);
                        var purchaseId = (userPurchase.product_id);
                        console.log(newStock);
                        confirmPrompt(newStock, purchaseId);
                    }
                }
            });
        });


}





// function validateInput(value) {
//   var integer = Number.isInteger(parseFloat(value));
//   var sign = Math.sign(value);

//   if (integer && (sign === 1)) {
//     return true;
//   } else {
//     return 'Please enter a whole non-zero number.';
//   }
// }





// // function to handle posting new items up for auction
// function postAuction() {
//   // prompt for info about the item being put up for auction
//   inquirer
//     .prompt([
//       {
//         name: "item",
//         type: "input",
//         message: "What is the item you would like to submit?"
//       },
//       {
//         name: "category",
//         type: "input",
//         message: "What category would you like to place your auction in?"
//       },
//       {
//         name: "startingBid",
//         type: "input",
//         message: "What would you like your starting bid to be?",
//         validate: function(value) {
//           if (isNaN(value) === false) {
//             return true;
//           }
//           return false;
//         }
//       }
//     ])
//     .then(function(answer) {
//       // when finished prompting, insert a new item into the db with that info
//       connection.query(
//         "INSERT INTO auctions SET ?",
//         {
//           item_name: answer.item,
//           category: answer.category,
//           starting_bid: answer.startingBid,
//           highest_bid: answer.startingBid
//         },
//         function(err) {
//           if (err) throw err;
//           console.log("Your auction was created successfully!");
//           // re-prompt the user for if they want to bid or post
//           start();
//         }
//       );
//     });
// }

// function bidAuction() {
//   // query the database for all items being auctioned
//   connection.query("SELECT * FROM auctions", function(err, results) {
//     if (err) throw err;
//     // once you have the items, prompt the user for which they'd like to bid on
//     inquirer
//       .prompt([
//         {
//           name: "choice",
//           type: "rawlist",
//           choices: function() {
//             var choiceArray = [];
//             for (var i = 0; i < results.length; i++) {
//               choiceArray.push(results[i].item_name);
//             }
//             return choiceArray;
//           },
//           message: "What auction would you like to place a bid in?"
//         },
//         {
//           name: "bid",
//           type: "input",
//           message: "How much would you like to bid?"
//         }
//       ])
//       .then(function(answer) {
//         // get the information of the chosen item
//         var chosenItem;
//         for (var i = 0; i < results.length; i++) {
//           if (results[i].item_name === answer.choice) {
//             chosenItem = results[i];
//           }
//         }

//         // determine if bid was high enough
//         if (chosenItem.highest_bid < parseInt(answer.bid)) {
//           // bid was high enough, so update db, let the user know, and start over
//           connection.query(
//             "UPDATE auctions SET ? WHERE ?",
//             [
//               {
//                 highest_bid: answer.bid
//               },
//               {
//                 id: chosenItem.id
//               }
//             ],
//             function(error) {
//               if (error) throw err;
//               console.log("Bid placed successfully!");
//               start();
//             }
//           );
//         }
//         else {
//           // bid wasn't high enough, so apologize and start over
//           console.log("Your bid was too low. Try again...");
//           start();
//         }
//       });
//   });
// }
