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

//exports
if (typeof module != "undefined") {
    module.exports = utils;
}
