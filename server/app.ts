import "dotenv/config";
import express from "express";
import connectDB from "./db/connection.ts";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT: string | number = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("Database Connection established");
    app.listen(PORT, () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err, "Database Connection failed");
});
