import { isEvenNumber, onlyString } from "./math";

test.skip('Only Even Numbers', ()=> {
    expect(isEvenNumber(2)).toBe('EVEN');
});

test.skip('Only String', ()=> {
    expect(onlyString(1)).toBe(true);
});