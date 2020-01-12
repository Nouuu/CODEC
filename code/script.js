var decToByte = fillDecToByteArray();
var byteToDec = fillByteToDecArray();
var keyReader = new FileReader();
var fileReader = new FileReader();
var matrixEncode;
var matrixDecode;
var key;
var fileSize;
var fileBufferTraitment;
var fileBinTraitment;
var fileBinTraitmentSize;


function readFile() {
    clearLog();
    let file = document.getElementById("input").files[0];
    if (!file) {
        alert("Fichier sélectionné invalide !");
        return;
    }

    fileSize = file.size;
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = function () {
        let charCode = new Uint8Array(fileReader.result);
        log("-------------- File information --------------:\n");
        log("Name          : " + file.name);
        log("Type          : " + file.type);
        log("Size          : " + readableFileSize(fileSize));
        log("Last modified : " + file.lastModifiedDate.toUTCString() + '\n');
        log("---------------- File Content ----------------:");
        log("------ Showing max 10 array 8 bits pack ------:\n");

        for (let i = 0; i < (fileSize > 10 ? 10 : fileSize); i++) {
            log(decToByte[charCode[i]] + "\t=>\t" + String.fromCharCode(charCode[i]));
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

        if (result.length !== 4) {
            alert("Invalid key!");
            log("Invalid key");
            return;
        } else {
            for (i = 0; i < result.length; i++) {
                if (result[i].length !== 8) {
                    alert("Invalid key!");
                    log("Invalid key");
                    return;
                }
            }
        }

        for (i = 0; i < result.length; i++) {
            let string = result[i].split('');
            for (let j = 0; j < string.length; j++) {
                string[j] = parseInt(string[j], 10);
            }
            result[i] = string;
        }

        key = result;
        log("Success!\n");
        log("Your key is: \n");
        log(key[0].toString());
        log(key[1].toString());
        log(key[2].toString());
        log(key[3].toString());

        fillMatrixEncode();
        fillMatrixDecode();

        log("\nReady to encode / decode")
    }
}

function encodeOpti() {
    clearLog();

    hideDownload();
    let file = checkFileAndKey();
    if (!file) {
        return;
    }

    log("Starting process...");
    const t0 = performance.now();
    log("Encoding : " + file.name);

    fileReader.readAsArrayBuffer(file);
    fileReader.onload = function () {
        let charCode = new Uint8Array(fileReader.result);

        fileSize = charCode.length;
        fileBinTraitmentSize = fileSize * 2;
        fileBufferTraitment = new ArrayBuffer(fileBinTraitmentSize);
        fileBinTraitment = new Uint8Array(fileBufferTraitment);

        let k = 0;

        for (let i = 0; i < fileSize; i++) {
            fileBinTraitment[k] = matrixEncode[charCode[i]][0];
            fileBinTraitment[k + 1] = matrixEncode[charCode[i]][1];
            k += 2;
        }

        const t1 = performance.now();
        logProcessResult(t0, t1, 'e');

        saveFile(fileBufferTraitment, file.name, 'e');
    }
}

function decodeOpti() {
    clearLog();

    hideDownload();
    let file = checkFileAndKey();
    if (!file) {
        return;
    }

    log("Starting process...");
    const t0 = performance.now();
    log("Decoding: " + file.name);

    fileReader.readAsArrayBuffer(file);
    fileReader.onload = function () {
        let charCode = new Uint8Array(fileReader.result);

        fileSize = charCode.length;
        fileBinTraitmentSize = fileSize / 2;
        fileBufferTraitment = new ArrayBuffer(fileBinTraitmentSize);
        fileBinTraitment = new Uint8Array(fileBufferTraitment);

        let k = 0;
        for (let i = 0; i < fileSize; i += 2) {
            fileBinTraitment[k] = matrixDecode[charCode[i]][charCode[i + 1]];
            k++;
        }

        const t1 = performance.now();
        logProcessResult(t0, t1, 'd');

        saveFile(fileBufferTraitment, file.name, 'd');
    }

}

function logProcessResult(t0, t1, type) {

    log("Finished!\n");
    log((type === 'e' ? "Original" : "Encoded") + " file size : " + readableFileSize(fileSize));
    log((type === 'e' ? "Encoded" : "Decoded") + " file size : " + readableFileSize(fileBinTraitmentSize));
    log((type === 'e' ? "\nEncoding" : "\nDecoding") + " time : " + (t1 - t0).toFixed(2) + " milliseconds\n");
    log("---------------- File Content ----------------: ");
    log("------ Showing max 10 array 8 bits pack ------: \n");

    for (let i = 0; i < (fileBinTraitmentSize > 10 ? 10 : fileBinTraitmentSize); i++) {
        log(decToByte[fileBinTraitment[i]] + "\t=>\t" + String.fromCharCode(fileBinTraitment[i]));
    }

}

function hideDownload() {
    const downloadButton = document.getElementById('download');
    downloadButton.style.visibility = 'hidden';
}

function checkFileAndKey() {
    let file = document.getElementById("input").files[0];
    if (!file) {
        alert("Fichier sélectionné invalide !");
        return false;
    }

    if (key === undefined || key === "") {
        alert("La clé de chiffrement n'a pas été saisie !");
        return false;
    }
    return file;
}

function saveFile(arrayBuffer, fileName, proccessType) {
    if (proccessType === 'e') {
        fileName = fileName + 'e';
    } else {
        fileName = fileName + 'd';
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

function fillDecToByteArray() {
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

function fillMatrixEncode() {
    matrixEncode = [];
    let matLength = key[0].length;
    let tempBin, tempBin2, i, j, code;
    for (i = 0; i < 256; i++) {
        code = decToByte[i];
        tempBin = [];
        tempBin2 = [];
        for (j = 0; j < matLength; j++) {
            tempBin[j] = (code[0] && key[0][j]) ^ (code[1] && key[1][j]) ^ (code[2] && key[2][j]) ^ (code[3] && key[3][j]);
            tempBin2[j] = (code[4] && key[0][j]) ^ (code[5] && key[1][j]) ^ (code[6] && key[2][j]) ^ (code[7] && key[3][j]);
        }
        matrixEncode[i] = [byteToDec[tempBin.join('')], byteToDec[tempBin2.join('')]];
    }
}

function fillMatrixDecode() {
    matrixDecode = [];
    let i, j, k, i4, byte;
    for (i = 0; i < 256; i++) {
        matrixDecode[i] = [];
    }
    let matrixI4 = [];
    for (i = 0; i < key[0].length; i++) {
        i4 = "";
        for (j = 0; j < key.length; j++) {
            i4 += key[j][i];
        }
        switch (i4) {
            case "1000":
                matrixI4[0] = i;
                break;
            case "0100":
                matrixI4[1] = i;
                break;
            case "0010":
                matrixI4[2] = i;
                break;
            case "0001":
                matrixI4[3] = i;
                break;
            default:
                break;
        }
    }

    for (i = 0; i < 256; i++) {
        for (j = 0; j < 256; j++) {
            byte = [];
            for (k = 0; k < 4; k++) {
                byte[k] = decToByte[i][matrixI4[k]];
            }
            for (k = 0; k < 4; k++) {
                byte[k + 4] = decToByte[j][matrixI4[k]];
            }
            matrixDecode[i][j] = byteToDec[byte.join('')];
        }
    }
}

function fillByteToDecArray() {
    let table = [];
    for (let i = 0; i < 256; i++) {
        table[decToByte[i].join('')] = i;
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

