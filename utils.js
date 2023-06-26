const utils = {}; //init object

//format percent value
utils.formatPercent = (n) => {
    return (n * 100).toFixed(2) + "%";
};

//print value in user console
utils.printProgress = (count, max) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    const percent = utils.formatPercent(count / max);
    process.stdout.write(count + "/" + max + " (" + percent + ")");
};
//function to filter uniques CEPs
utils.uniqueCEP = (value, index, array) => {
    return array.indexOf(value) === index;
};

//exports
if (typeof module != "undefined") {
    module.exports = utils;
}
