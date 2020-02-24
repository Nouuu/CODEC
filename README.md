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

![image_04.png](pictures/image_02.png)

### Load file

Then, you can choose the file you want to encode / decode

![image_02.png](pictures/image_03.png)


### Start encode

Press the **Encode** button (no kidding ! :upside_down_face:) and
wait...

![image_08.png](pictures/image_05.png)

Once your file is encoded, a download button appears to choose location
where to save your file. The encoded file will have **e** letter added
at the end of the file

![image_11.png](pictures/image_07.png)

### Start decode

Press the **Decode** button (haha again no kidding ! :upside_down_face:)
and wait (again to !)...

![image_05.png](pictures/image_06.png)

Once your file is decoded, a download button appears to choose location
where to save your file. The encoded file will have **d** letter added
at the end of the file

![image_10.png](pictures/image_08.png)