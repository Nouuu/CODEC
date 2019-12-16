var byteCode = fillByteCode();
var reader = new FileReader();
var fileBin;
var fileBinTraitment = [];
var fileBinSize;
var fileBinTraitmentSize;
var key;

function readFile() {
    const t0 = performance.now();
    fileBin = [];
    let file = document.getElementById("input").files[0];
    if (!file) {
        alert("Fichier selectionné invalide !");
        return;
    }

    reader.readAsArrayBuffer(file);

    reader.onload = function (progressEvent) {

        let charCode = new Uint8Array(reader.result);
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
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function (progressEvent) {
        let result = reader.result;
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
        console.clear();
        console.log(key);
    }
}

function encode() {
    if (!fileBinSize || !key) {
        alert("Impossible, il manque un fichier");
        return;
    }
    fileBinTraitment = [];
    fileBinTraitmentSize = fileBinSize * 2;

    console.clear();
    console.log("Start encoding...");
    const t0 = performance.now();

    let tempBin, tempBin2, i, j;
    let k = 0;
    let matLenght = key[0].length;
    //TODO Créer un tableau contenant les 255 solutions d'encodage possibles dans l'ordre grâce au tableau binaire déjà existant
    for (i = 0; i < fileBinSize; i++) {
        tempBin = [];
        tempBin2 = [];
        for (j = 0; j < matLenght; j++) {
            tempBin[j] = (fileBin[i][0] && key[0][j]) ^ (fileBin[i][1] && key[1][j]) ^ (fileBin[i][2] && key[2][j]) ^ (fileBin[i][3] && key[3][j]);
            tempBin2[j] = (fileBin[i][4] && key[0][j]) ^ (fileBin[i][5] && key[1][j]) ^ (fileBin[i][6] && key[2][j]) ^ (fileBin[i][7] && key[3][j]);
        }
        fileBinTraitment[k] = tempBin;
        fileBinTraitment[k + 1] = tempBin2;
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

function fillByteCode() {
    let table = [];
    for (let i = 0; i <= 255; i++) {
        let byte = i;
        let bits = [];
        let j = 8;
        do {
            bits[--j] = byte % 2;
            byte = Math.floor(byte / 2);
        } while (j);
        table.push(bits);
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
