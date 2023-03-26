// Details on how this works: 
// https://infocenter.nordicsemi.com/topic/sdk_nrf5_v17.1.0/lib_dfu_transport_ble.html

import { transmitNordicDfuControlData, transmitNordicDfuPacketData } from "./bluetooth.js"
import { gitInfo } from "./update.js";
import { reportUpdatePercentage } from "./main.js"
import { request } from "@octokit/request";
import JSZip from "jszip"

let controlResponseCallback;

export async function startNordicDFU() {

    console.log('Entering nRF52 DFU');

    let files = await obtainFiles();

    await transferFile(files.dat, 'init');
    await transferFile(files.bin, 'image');

    console.log('Leaving nRF52 DFU');
}

export async function nordicDfuSendControl(bytes) {

    console.log('DFU control ⬆️: ' + bytes);

    transmitNordicDfuControlData(bytes);

    // Return a promise which calls a function that'll eventually run when the
    // response handler calls the function associated with controlResponseCallback
    return new Promise(resolve => {
        controlResponseCallback = function (responseBytes) {
            console.log('DFU control ⬇️: ' + new Uint8Array(responseBytes.buffer));
            resolve(responseBytes);
        };
        setTimeout(() => {
            resolve("");
        }, 1000);
    });
}

export function nordicDfuHandleControlResponse(bytes) {
    controlResponseCallback(bytes);
}

export async function nordicDfuSendPacket(bytes) {
    const payload = new Uint8Array(bytes)
    // console.log('DFU packet ⬆️: ' + payload);
    await transmitNordicDfuPacketData(payload);
    // Wait a little while as this is a write without response
    await new Promise(r => setTimeout(r, 10));
}

async function obtainFiles() {

    if (!gitInfo.owner || !gitInfo.repo) {
        // TODO
        gitInfo.owner = 'brilliantlabsAR';
        gitInfo.repo = 'monocle-micropython';
    }

    console.log("Downloading latest release from: github.com/" +
        gitInfo.owner + "/" + gitInfo.repo);

    let response = await request("GET /repos/{owner}/{repo}/releases/latest", {
        owner: gitInfo.owner,
        repo: gitInfo.repo
    });

    let assetId;
    response.data.assets.forEach((item, index) => {
        if (item.content_type === 'application/zip') {
            assetId = item.id;
        }
    });

    response = await request("GET /repos/{owner}/{repo}/releases/assets/{assetId}", {
        owner: gitInfo.owner,
        repo: gitInfo.repo,
        assetId: assetId
    });

    // Annoyingly we have to fetch the data via a cors proxy
    let download = await fetch('https://api.brilliant.xyz/firmware?url=' + response.data.browser_download_url);
    let blob = await download.blob();
    let buffer = await blob.arrayBuffer();

    let zip = await JSZip.loadAsync(buffer);

    let manifest = await zip.file('manifest.json').async('string');
    let dat = await zip.file('application.dat').async('arraybuffer');
    let bin = await zip.file('application.bin').async('arraybuffer');

    return { manifest, dat, bin };
}

async function transferFile(file, type) {

    let response;

    // Select command
    switch (type) {
        case 'init':
            console.log('Transferring init file');
            response = await nordicDfuSendControl([0x06, 0x01]);
            break;

        case 'image':
            console.log('Transferring image file');
            response = await nordicDfuSendControl([0x06, 0x02]);
            break;

        default:
            return Promise.reject('Invalid file type');
    }

    const fileSize = file.byteLength;

    console.log("fileSize: " + fileSize);

    const maxSize = response.getUint32(3, true);
    const offset = response.getUint32(7, true);
    const crc = response.getUint32(11, true);

    console.log("maxSize: " + maxSize + ", offset: " + offset + ", crc: " + crc);

    let chunks = Math.ceil(fileSize / maxSize);
    console.log("Sending file as " + chunks + " chunks");

    let fileOffset = 0
    for (let chk = 0; chk < chunks; chk++) {

        let chunkSize = Math.min(fileSize, maxSize);

        // The last chunk could be smaller
        if (chk == chunks - 1 && fileSize % maxSize) {
            chunkSize = fileSize % maxSize;
        }

        const chunkCrc = crc32(new Uint8Array(file)
            .slice(0, fileOffset + chunkSize));

        console.log(
            "chunk " + chk +
            ", fileOffset: ", + fileOffset +
            ", chunkSize: " + chunkSize + ", chunkCrc", + chunkCrc);

        // Create command with size
        let chunkSizeAsBytes =
            [chunkSize & 0xFF, chunkSize >> 8 & 0xFF,
            chunkSize >> 16 & 0xff, chunkSize >> 24 & 0xff];

        if (type === 'init') {
            await nordicDfuSendControl([0x01, 0x01].concat(chunkSizeAsBytes));
        }
        if (type === 'image') {
            await nordicDfuSendControl([0x01, 0x02].concat(chunkSizeAsBytes));
        }

        // Send packets as maximum 100 byte payloads (assume max 100 byte MTU)
        const packets = Math.ceil(chunkSize / 100);
        for (let pkt = 0; pkt < packets; pkt++) {

            // The last packet could be smaller
            let packetLength = 100;
            if (pkt == packets - 1 && chunkSize % 100) {
                packetLength = chunkSize % 100;
            }

            const fileSlice = file.slice(fileOffset, fileOffset + packetLength);
            fileOffset += fileSlice.byteLength;

            await nordicDfuSendPacket(fileSlice);
            reportUpdatePercentage(Math.round((100 / fileSize) * fileOffset));
        }

        // Calculate CRC
        response = await nordicDfuSendControl([0x03]);
        let returnedOffset = response.getUint32(3, true);
        let returnedCrc = response.getUint32(7, true);

        console.log("returnedOffset: " + returnedOffset + ", returnedCrc: " + returnedCrc);

        if (returnedCrc != chunkCrc) {
            return Promise.reject('CRC mismatch after sending this chunk. Expected: ' + chunkCrc);
        }

        // Execute command
        await nordicDfuSendControl([0x04]);
    }
}

function crc32(r) {
    for (var a, o = [], c = 0; c < 256; c++) {
        a = c;
        for (var f = 0; f < 8; f++) {
            a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1;
        }
        o[c] = a
    }
    for (var n = -1, t = 0; t < r.length; t++) {
        n = n >>> 8 ^ o[255 & (n ^ r[t])];
    }
    return (-1 ^ n) >>> 0
}