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


function readFile() {
    clearLog();
    const t0 = performance.now();
    fileBin = [];
    let file = document.getElementById("input").files[0];
    if (!file) {
        alert("Fichier selectionné invalide !");
        return;
    }
    log("Reading : " + file.name);

    fileReader.readAsArrayBuffer(file);

    fileReader.onload = function () {

        let charCode = new Uint8Array(fileReader.result);
        fileBinSize = charCode.length;

        for (let i = 0; i < fileBinSize; i++) {
            fileBin[i] = byteCode[charCode[i]];
        }

        const t1 = performance.now();
        log(" Read " + readableFileSize(fileBinSize) + " file took " + (t1 - t0).toFixed(2) + " milliseconds");
        log(" ---------------- File Content ----------------: ");
        log(" ------ Showing max 10 array 8 bits pack ------: ");

        for (let i = 0; i < (fileBinSize > 10 ? 10 : fileBinSize); i++) {
            log(fileBin[i]);
        }
    };

}

function readKey() {

    clearLog();
    let file = document.getElementById("key").files[0];
    if (!file) {
        key = undefined;
        return;
    }
    log("Reading key...");
    key = "";
    keyReader.readAsText(file);

    keyReader.onload = function () {
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
        log("Your key is : ");
        log(key[0].toString());
        log(key[1].toString());
        log(key[2].toString());
        log(key[3].toString());
        fillMatrixCode();
    }
}

function encodeOpti() {
    const downloadButton = document.getElementById('download');
    downloadButton.style.visibility = 'hidden';

    clearLog();
    let file = document.getElementById("input").files[0];
    if (!file) {

        alert("Fichier selectionné invalide !");
        return;
    }
    if (key === undefined) {
        alert("La clé de chiffrement n'a pas été saisi !");
        return;
    }
    log("Starting process...");
    const t0 = performance.now();
    log("Encoding : " + file.name);

    fileReader.readAsArrayBuffer(file);
    fileReader.onload = function () {
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
        log("Finished !");
        log("Original file : " + readableFileSize(fileBinSize) + " \nEncoded file : " + readableFileSize(fileBinTraitmentSize) + " \nEncoding time : " + (t1 - t0).toFixed(2) + " milliseconds");
        log(" ---------------- File Content ----------------: ");
        log(" ------ Showing max 10 array 8 bits pack ------: ");

        for (let i = 0; i < (fileBinTraitmentSize > 10 ? 10 : fileBinTraitmentSize); i++) {
            log(fileBinTraitment[i]);
        }

        saveFile(fileBufferTraitment, file.name, 'e');
    }
}

function saveFile(arrayBuffer, fileName, proccessType) {
    if (proccessType === 'e') {
        fileName = fileName + 'e';
    } else {
        fileName[fileName.length - 1] = 'd';
    }
    const blob = new Blob([arrayBuffer]);
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fileName);
    } else {
        const link = document.getElementById('download');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'visible';
        }
    }
}

function log(text) {
    document.getElementById("logs").value += text + '\n';
}

function clearLog() {
    document.getElementById("logs").value = '';

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
    console.log(matrixCode);
}

function fillBinToDecArray() {
    let table = [];
    for (let i = 0; i < 256; i++) {
        table[byteCode[i].join('')] = i;
    }
    return table;
}

function readableFileSize(fileSizeInBytes) {
    var i = 0;
    var byteUnits = [' B', ' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    while (fileSizeInBytes > 1024) {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    }

    return Math.max(fileSizeInBytes, 0.01).toFixed(2) + byteUnits[i];
}

