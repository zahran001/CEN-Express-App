// import the mongoose
const mongoose = require("mongoose");

// arrow function to connect to the database
const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`Database connected : ${connect.connection.host}, ${connect.connection.name}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
    

};

module.exports = dbConnect;
