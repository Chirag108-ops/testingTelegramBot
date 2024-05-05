import mongoose from "mongoose";

const dbconnect = () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("DB Connected Successfully"))
    .catch( (error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    } )
}

export default dbconnect