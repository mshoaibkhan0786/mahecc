const { Jimp } = require("jimp");
const fs = require('fs');

async function fixLogo() {
    try {
        const image = await Jimp.read("logo.png");

        // We scan the image and set alpha to 0 for any white-ish pixel
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            if (
                this.bitmap.data[idx] > 230 &&
                this.bitmap.data[idx + 1] > 230 &&
                this.bitmap.data[idx + 2] > 230
            ) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0 for transparent
            }
        });

        // We might need to handle autocrop differently depending on the Jimp version, skip autocrop first to be safe, just resize or let Jimp autocrop 
        try {
            if (typeof image.autocrop === 'function') {
                image.autocrop();
            } else if (typeof image.crop === 'function') {
                // we won't try manual crop logic to avoid bugs, we just trim transparent background manually:
                // finding bounding box of non-transparent pixels
                let minX = image.bitmap.width, minY = image.bitmap.height, maxX = -1, maxY = -1;
                image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                    if (this.bitmap.data[idx + 3] > 0) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                });
                if (maxX >= minX && maxY >= minY) {
                    image.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
                }
            }
        } catch (e) {
            console.log("Could not crop properly", e.message);
        }

        // Check for resize function
        try {
            if (typeof image.resize === 'function') {
                image.resize({ w: 256, h: 256 });
            } else if (typeof image.scaleToFit === 'function') {
                image.scaleToFit(256, 256);
            }
        } catch (e) { console.log(e); }

        await image.write("logo.png");
        console.log("Logo processed: Background dropped, margins stripped, size clamped.");
    } catch (error) {
        console.error("Failed to fix logo:", error);
    }
}

fixLogo();
