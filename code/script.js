var byteCode = fillByteCode();
var matrixCode = [];
var binToDec = fillBinToDecArray();
var keyReader = new FileReader();
var fileReader = new FileReader();
var fileSaver;
var fileBin = [];
var fileBufferTraitment;
var fileBinTraitment;
var fileBinSize;
var fileBinTraitmentSize;
var key;

//TODO rajouter la fonction save(ArrayBuffer, fileName){}

function readFile() {
    const t0 = performance.now();
    fileBin = [];
    let file = document.getElementById("input").files[0];
    if (!file) {
        alert("Fichier selectionné invalide !");
        return;
    }

    keyReader.readAsArrayBuffer(file);

    keyReader.onload = function (progressEvent) {

        let charCode = new Uint8Array(keyReader.result);
        fileBinSize = charCode.length;

        for (let i = 0; i < fileBinSize; i++) {
            fileBin[i] = byteCode[charCode[i]];
        }

        const t1 = performance.now();
        console.clear();
        console.log(" Read " + readableFileSize(fileBinSize) + " file took " + (t1 - t0).toFixed(2) + " milliseconds");
        console.log(" ---------------- File Content ----------------: ");
        console.log(" ------ Showing max 10 array 8 bits pack ------: ");

        for (let i = 0; i < (fileBinSize > 10 ? 10 : fileBinSize); i++) {
            console.log(fileBin[i]);
        }
    };

}

function readKey() {

    let file = document.getElementById("key").files[0];
    if (!file) {
        alert("Fichier selectionné invalide !");
        return;
    }
    key = "";
    keyReader.readAsText(file);

    keyReader.onload = function (progressEvent) {
        let result = keyReader.result;
        let i = result.search("\\[") + 1;

        result = result.slice(i, i + 8 * 4 + 3).split(' ');
        for (i = 0; i < result.length; i++) {
            let string = result[i].split('');
            for (let j = 0; j < string.length; j++) {
                string[j] = parseInt(string[j], 10);
            }
            result[i] = string;
        }

        key = result;
        fillMatrixCode();
    }
}

function encodeOpti() {
    console.clear();
    console.log("Starting process...");
    const t0 = performance.now();
    readKey();

    let file = document.getElementById("input").files[0];
    if (!file) {
        alert("Fichier selectionné invalide !");
        return;
    }

    fileReader.readAsArrayBuffer(file);
    fileReader.onload = function (progressEvent) {
        let charCode = new Uint8Array(fileReader.result);

        fileBufferTraitment = new ArrayBuffer(charCode.length * 2);
        fileBinTraitment = new Uint8Array(fileBufferTraitment);
        fileBinSize = charCode.length;
        let tempArray;
        let k = 0;
        for (let i = 0; i < fileBinSize; i++) {
            tempArray = matrixCode[charCode[i]];
            fileBinTraitment[k] = matrixCode[charCode[i]][0];
            fileBinTraitment[k + 1] = matrixCode[charCode[i]][1];
            k += 2;
        }

        fileBinTraitmentSize = fileBinTraitment.length;

        const t1 = performance.now();
        console.log("Finished !");

        console.log("Original file : " + readableFileSize(fileBinSize) + " \nEncoded file : " + readableFileSize(fileBinTraitmentSize) + " \nencoding time : " + (t1 - t0).toFixed(5) + " milliseconds");
        console.log(" ---------------- File Content ----------------: ");
        console.log(" ------ Showing max 10 array 8 bits pack ------: ");

        for (let i = 0; i < (fileBinTraitmentSize > 10 ? 10 : fileBinTraitmentSize); i++) {
            console.log(fileBinTraitment[i]);
        }

    }
}

function fillByteCode() {
    let table = [];
    for (let i = 0; i < 256; i++) {
        let byte = i;
        let bits = [];
        let j = 8;
        do {
            bits[--j] = byte % 2;
            byte = Math.floor(byte / 2);
        } while (j);
        table[i] = bits;
    }
    return table;
}

function fillMatrixCode() {
    let matLength = key[0].length;
    let tempBin, tempBin2, i, j, code;
    for (i = 0; i < 256; i++) {
        code = byteCode[i];
        tempBin = [];
        tempBin2 = [];
        for (j = 0; j < matLength; j++) {
            tempBin[j] = (code[0] && key[0][j]) ^ (code[1] && key[1][j]) ^ (code[2] && key[2][j]) ^ (code[3] && key[3][j]);
            tempBin2[j] = (code[4] && key[0][j]) ^ (code[5] && key[1][j]) ^ (code[6] && key[2][j]) ^ (code[7] && key[3][j]);
        }
        matrixCode[i] = [binToDec[tempBin.join('')], binToDec[tempBin2.join('')]];
    }
}

function fillBinToDecArray() {
    let table = [];
    for (let i = 0; i < 256; i++) {
        table[byteCode[i].join('')] = i;
    }
    return table;
}

function readableFileSize(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

