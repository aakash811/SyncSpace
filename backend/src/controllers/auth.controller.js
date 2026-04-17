import { signupService, loginService } from "../services/auth.service.js";
import { generateToken } from "../utils/token.js";

export const signupController = async (req, res) => {
    try {
        const user = await signupService(req.body);
        const token = generateToken({ userId: user.id });
        
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const loginController = async (req, res) => {
    try {
        const user = await loginService(req.body);
        const token = generateToken({ userId: user.id });

        res.json({ user, token });
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}