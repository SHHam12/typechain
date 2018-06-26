const toHexString = (byteArray):string => {
    return byteArray
        .reduce((output, elem) => 
        output + ("0" + elem.toString(16)).slice(-2), "");
};

export { toHexString };