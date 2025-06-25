const isEvenNumber = (n: number)=> {
    if(n%2 == 0) {
        return "EVEN";
    }
    return "ODD"
}

const onlyString = (inp: any)=> {
    if(typeof inp == "string") {
        return true;
    }
    return false;
}

export { isEvenNumber, onlyString };