import bcrypt from "bcrypt";
import prisma from "../config/db.js";

export const signupService = async ({name, email, password}) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if(existingUser){
        throw new Error("User already exists. Please login.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    })

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export const loginService = async ({email, password}) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    
    if(!user){
        throw new Error("Invalid credentials. Please try again.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error("Invalid credentials. Please try again.");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}