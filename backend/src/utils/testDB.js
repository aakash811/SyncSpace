import prisma from "../config/db.js";

const testDB = async () => {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
};

testDB();