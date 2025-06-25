import { isCorrectPassword, isUserAdmin, checkUserSchema, isValidBirthDate, getButtonClass } from "./modules";

// Bcrypt Test: Verify Password Is Correct
test('Is Correct Password', async ()=> {
    const isMatch = await isCorrectPassword("12345");
    expect(isMatch).toBe(true);
})

// Jsonwebtoken Test: Verify If User Is An Admin
test('Is User An Admin', ()=> {
    expect(isUserAdmin({role:"admin"})).toBe(true);
})

// Zod Test: Verify If User Schema
test('Is Valid User Schema', ()=> {
    expect(checkUserSchema({ 
        id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        name: "Adil",
        role: "Client Pro", 
    })).toBe(true);
})

// Date-fns Test: Verify If User Has A Valid Birthdate Not Future Date
test('Is Valid User Birthdate', ()=> {
    let birthDate = new Date("2001-09-10");
    expect(isValidBirthDate(birthDate)).toBe(true);
})

// clsx Test: Return The CSS Class Of Btn In That List ['primary', 'secondary', 'tertiary']
// primary
test('Button Class Color: primary', ()=> {
    expect(getButtonClass("primary")).toBe('btn-primary');
})
// secondary
test('Button Class Color: secondary', ()=> {
    expect(getButtonClass("secondary")).toBe('btn-secondary');
})
// tertiary
test('Button Class Color: tertiary', ()=> {
    expect(getButtonClass("tertiary")).toBe('btn-tertiary');
})