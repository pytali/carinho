const utils = {}; //init object

//format percent value
utils.formatPercent = (n) => {
    return (n * 100).toFixed(2) + "%";
};

//print value in user console
utils.printProgress = (count, max, message) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    const percent = utils.formatPercent(count / max);

    process.stdout.write(message + count + "/" + max + " (" + percent + ")");
};
//function to filter uniques CEPs
utils.uniqueCEP = (value, index, array) => {
    return array.indexOf(value) === index;
};

// Function to validade date
utils.isValidDate = (date) => {
    if (date instanceof Date && !isNaN(date)) {
        return date;
    }
    return null;
};

/* Function to compare date values with reference
    date = date for validate
    compareDate = reference date
*/
utils.alterDate = (date, compareDate) => {
    if (Date.parse(date) <= compareDate) {
        return null;
    }

    return date;
};

//exports
if (typeof module != "undefined") {
    module.exports = utils;
}
