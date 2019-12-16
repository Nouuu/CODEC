var byteCode = fillByteCode();

function readFile() {
    var t0 = performance.now();
    let file = document.getElementById("input").files[0];
    if (!file) {
        alert("Fichier selectionné invalide !");
        return;
    }
    let reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = function (progressEvent) {
        let result = reader.result;
        let charCode = new Uint8Array(result);
        let bits = [];
        for (let i = 0; i < charCode.length; i++) {
            bits.push(byteCode[charCode[i]]);
        }
        var t1 = performance.now();
        console.clear();
        console.log(" Read " + readableFileSize(file.size) + " file took " + (t1 - t0).toFixed(2) + " milliseconds");
        console.log(" ---------------- File Content ----------------: ");
        console.log(" ------ Showing max 10 array 8 bits pack ------: ");


        for (let i = 0; i < (bits.length > 10 ? 10 : bits.length); i++) {
            console.log(bits[i]);
        }
        // console.log(bits.join(','));

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

        console.clear();
        console.log(result);
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
