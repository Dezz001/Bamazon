
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
  // Host
  host: "localhost",

  // Port
  port: 8080,

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

    // Testing
    // begin();
  });
});




// Inventory function

function inventory() {

    // Sets up table
    var table = new Table({
        head: ["ID", "Product", "Department", "Price", "Stock"],
        colWidths: [10, 20, 20, 20, 20]
    });

    listInventory();

    // Lists inventory
    function listInventory() {

        //Connects to database and lists products for sale

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



// function asks customer to choose product and quantity
function purchaseTime() {
  inquirer
    .prompt([

    {
      name: "product_id",
      type: "input",
      message: "Please enter the ID number of the item you would like to purchase."   
    },

    {
      name: "input_quantity",
      type: "input",
      message: "How many units of this item would you like to purchase?" 
    }

    ])

    .then(function(customerPurchase) {

            //Checks stock of selected product.
            connection.query("SELECT * FROM products WHERE item_id=?", customerPurchase.product_id, function(err, result) {
                for (var i = 0; i < result.length; i++) {

                    if (customerPurchase.input_quantity > result[i].stock) {

                        console.log("------------------------------------------------------------------------------------------------------------------");
                        console.log("Insufficient quantity! Please choose a lesser amount, choose another item or try again later.");
                        console.log("------------------------------------------------------------------------------------------------------------------");
                        continueShopping();

                    } else {
                        //list confirmation information
                        console.log("===================================");
                        console.log("-------------------------");
                        console.log("Your order was fulfilled.");
                        console.log("-------------------------");
                        console.log("You've selected:");
                        console.log("----------------");
                        console.log("Product: " + result[i].product_name);
                        console.log("Department: " + result[i].department_name);
                        console.log("Price: $" + result[i].price);
                        console.log("Quantity: " + customerPurchase.input_quantity);
                        console.log("----------------");
                        console.log("Total Price: $" + result[i].price * customerPurchase.input_quantity);
                        console.log("===================================");

                        var chosenProduct = (result[i].product_name);
                        
                        // Deducts customer's quantity from inventory 
                        var newStock = (result[i].stock - customerPurchase.input_quantity);

                        var purchaseId = (customerPurchase.product_id);

                        // Testing, displays purchase id and remaining stock
                        console.log("Chosen Product ID: " + purchaseId);
                        console.log(chosenProduct + " remaining in stock: "+ newStock);


                        // Building an update string to update database stock
                        var updateQuery = "UPDATE products SET stock = " + (newStock) + " WHERE item_id = " + purchaseId;

                        // Update the inventory
                        connection.query(updateQuery, function(err, result) {
                          if (err) throw err;

                            console.log("Inventory Updated");
                            console.log("===================================");

                          continueShopping();


                        })
                    }

                    
                }
            });
        });
}


// Continue Shopping Function
function continueShopping() {

    inquirer.prompt([{

        name: "continue",
        type: "confirm",  
        message: "Would you like to purchase another item?",
        default: true

    }]).then(function(customer) {
        if (customer.continue === true) {
            inventory();
        } else {
            console.log("Have a Great Day!!! Come Back Soon!!!");
            connection.end();
        }
    });
}


