import bcrypt from "bcrypt";
import jwt,{ JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import { isValid, isAfter } from "date-fns";
import clsx from "clsx";

// Bcrypt Test: Verify Password Is Correct
const isCorrectPassword = async (pass: string)=> {
    const PASSWORD = "12345";
    let hashedPassword = await bcrypt.hash(PASSWORD, 10);
    let isPasswordMatch = await bcrypt.compare(pass, hashedPassword);
    return isPasswordMatch;
}

// Jsonwebtoken Test: Verify If User Is An Admin
interface RolePayload {
    role: string
}
const SECRET = process.env.JWT_SECRET || "keep-secret-private";
const isUserAdmin = (paylod: RolePayload)=> {
    const token = jwt.sign(paylod, SECRET);
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    if(decoded.role == "admin"){
        return true;
    }
    return false;
}

// Zod Test: Verify If Valid User Schema
const checkUserSchema = (user: any)=> {
    const userSchema =  z.object({
        id: z.string().uuid(),
        name: z.string().min(1, 'Name is required!'),
        role: z.enum(['Client', 'Member', 'Client Pro'])
    });
    return userSchema.safeParse(user).success;
}

// Date-fns Test: Verify If User Has A Valid Birthdate Not Future Date
const isValidBirthDate = (date: Date)=> {
    const TODAY = new Date();
    return isValid(date) && !isAfter(date, TODAY);
}

// clsx Test: Return The CSS Class Of Btn In That List ['primary', 'secondary', 'tertiary']
const getButtonClass = (color: string)=> {
    return clsx({
    'btn-primary': color === 'primary',
    'btn-secondary': color === 'secondary',
    'btn-tertiary': color === 'tertiary',
  });
}


export { isCorrectPassword, isUserAdmin, checkUserSchema, isValidBirthDate, getButtonClass };