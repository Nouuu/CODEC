# CODEC

| ![Release Version](https://img.shields.io/github/v/release/Nouuu/CODEC) | ![Release Date](https://img.shields.io/github/release-date/Nouuu/CODEC) | ![Contributors](https://img.shields.io/github/contributors/Nouuu/CODEC) | ![Status](https://img.shields.io/badge/Status-ended-red) |
|:-----------------------------------------------------------------------:|:-----------------------------------------------------------------------:|:-----------------------------------------------------------------------:|:--------------------------------------------------------:|

## Table of contents

- [Description](#description)
  - [Features](#features)
  - [How it works](#how-it-works)
    - [Encoding](#encoding)
    - [Decoding](#decoding)
- [Usage](#usage)
  - [Load G4C Matrix](#load-g4c-matrix)
  - [Load file](#load-file)
  - [Start encode](#start-encode)
  - [Start decode](#start-decode)
- [Code](#code)
  - [Loading key](#loading-key)
  - [Fill encoding matrix table](#fill-encoding-matrix-table)
  - [Fill decoding matrix table](#fill-decoding-matrix-table)
  - [File encode process](#file-encode-process)
  - [File decode process](#file-decode-process)
- [Authors](#authors)


## Description

This application is G4C Matrix encryption program developed in
JavaScript.

### Features

| Feature     | Description                                   |
|:------------|:----------------------------------------------|
| Encode file | Encode the give file the the given G4C Matrix |
| Decode file | Encode the give file the the given G4C Matrix |

### How it works

Basically, we will use a G4C encoding matrix (matrix of 4 lines each
containing the value of one bytes expressed in 8 bits) which we will
load from a text file in this format :

`G4C=[10001111 11000111 10100100 10010010]`


#### Encoding

We will process the file we want to encode byte per byte by making a
matrix product with our encoding matrix like this:

- Our matrix : `G4C=[10001111 11000111 10100100 10010010]`
- Our byte : `1010 0101`

We separate our byte in two parts : `1010` and `0101`

And we make a matrix product (in this case this like we do a **XOR**
between the byte and the matrix)

| Byte / Matrix |               | 1000 1111<br>1100 0111<br>1010 0100<br>1001 0010 |
|:-------------:|:-------------:|:-------------------------------------------------|
|     1010      | :arrow_right: | 0010 1011                                        |
|     0101      | :arrow_right: | 0101 0101                                        |

Result : `1010 0101` => `0010 1011 0101 0101`  
So as we see, we have one byte in input and we get 2 encoded byte at the
output.  
That mean our output file will be twice bigger than the input one.

#### Decoding

We will process the file we want to decode 2 byte per 2 byte.

The first step is to find our identity matrix in our G4C matrix columns
:

|                                    1234 5678                                     | :arrow_right: |                     5234                     |
|:--------------------------------------------------------------------------------:|:-------------:|:--------------------------------------------:|
| 1**000** **1**111<br>1**100** **0**111<br>1**010** **0**100<br>1**001** **0**010 | :arrow_right: | **1**000<br>0**1**00<br>00**1**0<br>000**1** |

Once we got the position of the column **(5234)** we save it.  
We take the previously encoded byte `0010 1011 0101 0101`.  
For each byte, we take the four bits corresponding to the columns we
saved :

|   1234 5678   | :arrow_right: |   5234   |
|:-------------:|:-------------:|:--------:|
| 0**010 1**011 | :arrow_right: | **1010** |
| 0**101 0**101 | :arrow_right: | **0101** |

Et voilà !  
We decoded these two byte and recovered our original one : `1010 0101`


## Usage

The program GUI is pretty simple to understand :

![image_01.png](pictures/image_01.png)

### Load G4C Matrix

You need to load your G4C matrix text file.  
:warning: Your key must be in this format : `G4C=[10001111 11000111
10100100 10010010]`, otherwise it won't work.

![image_02.png](pictures/image_02.png)

### Load file

Then, you can choose the file you want to encode / decode

![image_03.png](pictures/image_03.png)


### Start encode

Press the **Encode** button (no kidding ! :upside_down_face:) and
wait...

![image_05.png](pictures/image_05.png)

Once your file is encoded, a download button appears to choose location
where to save your file. The encoded file will have **e** letter added
at the end of the file

![image_07.png](pictures/image_07.png)

### Start decode

Press the **Decode** button (haha again no kidding ! :upside_down_face:)
and wait (again to !)...

![image_06.png](pictures/image_06.png)

Once your file is decoded, a download button appears to choose location
where to save your file. The encoded file will have **d** letter added
at the end of the file

![image_08.png](pictures/image_08.png)

## Code

### Loading key

First of all, we need to load our key, otherwise the program won't start
encoding / decoding process.  
The key must be in valid format, we will store it in a local array
`key[4][8]`.

Function `function readKey()` in `script.js` open the key text file
first check valid format of the key :

```javascript
function readKey() {
    
    ...
    
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
```

Then, it store the key in our `codecKey[4][8]` array :

```javascript
        for (i = 0; i < result.length; i++) {
            let string = result[i].split('');
            for (let j = 0; j < string.length; j++) {
                string[j] = parseInt(string[j], 10);
            }
            result[i] = string;
        }

        key = result;

        ...
        
        fillMatrixEncode();
        fillMatrixDecode();

        log("\nReady to encode / decode");
}
```

### Fill encoding matrix table

During the encoding process, we don't want to process each bytes with
[encoding](#encoding) method.  
If we think about it, there is only 256 bytes, each input byte give two
at output.  
So we will fill a local array `unsigned char encodeMatrix[256][2]` with
all the possibilities.  
Then in our encoding process, we just access the right index of the
array, wich is the value of the byte !

Function `function fillMatrixEncode()` in `script.js` will process the
256 * 2 bytes possibilities depending of the key:

```javascript
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
```

As we see, we process with a XOR function because a matrix product
between bits is the same as if we do XOR on these.

### Fill decoding matrix table

During the decoding process, we don't want to process each bytes with
[decoding](#decoding) method.  
If we think about it, there is only 256 * 256 combination of bytes when
we process these two by two.  
So we will fill a local array `unsigned char decodeMatrix[256][256]`
with all the possibilities.  
Then in our decoding process, we just access the right index of the
array, wich is the value of the first byte for the first array
dimension, then the second one for the second dimension !

Function `function fillMatrixDecode()` in `script.js` will process the
256 * 256 bytes possibilities depending of the key:

```javascript
function fillMatrixDecode() {

    ...
    
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
```

As we say in [decoding](#decoding), the first step is to find our
identity matrix in our G4C matrix columns. Once we have it, we can
continue :

```javascript
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
```

As we see, wee fill our two dimensional array with all the
possibilities, depending of our identity matrix.

### File encode process

For this part, I will just describe the part where we read / write
bytes, the rest of the function is just classic file processing.  
Function `function encodeOpti()` in `script.js` will create the encoded
file in memory and link it to the download button.

```javascript
function encodeOpti() {
   
    ...

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

        ...
        
    }
}
```

### File decode process

For this part, I will just describe the part where we read / write
bytes, the rest of the function is just classic file processing.  
Function `function decodeOpti()` in `script.js` will create the decoded
file in memory and link it to the download button.

```javascript
function decodeOpti() {
    
    ...

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

    ...
    
}
```

## Authors

This project was carried out in a group of two people, myself included.

|                                                      |                                                             |
|:-----------------------------------------------------|:-----------------------------------------------------------:|
| [Joëlle CASTELLI](https://github.com/JoelleCastelli) | ![](https://img.shields.io/github/followers/JoelleCastelli) |
| [Noé LARRIEU-LACOSTE](https://github.com/Nouuu)      |     ![](https://img.shields.io/github/followers/Nouuu)      |

