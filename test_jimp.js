const { Jimp } = require("jimp");

async function fixLogo() {
    try {
        const original = "new_logo.png";
        const image = await Jimp.read(original);

        // Flood fill algorithm to only remove whitespace connected to the outer edges.
        // This leaves any "internal" white regions (like the center of the logo) completely untouched.
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        const toVisit = [];
        const visited = new Set();
        const threshold = 230;

        // Helper to get index for 1D pixel array
        const getIdx = (x, y) => (y * width + x) * 4;

        // Check if a pixel is "whiteish"
        const isWhiteish = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return false;
            const idx = getIdx(x, y);
            return image.bitmap.data[idx] > threshold &&
                image.bitmap.data[idx + 1] > threshold &&
                image.bitmap.data[idx + 2] > threshold;
        };

        // Push all edge pixels that are white to the initial stack
        for (let x = 0; x < width; x++) {
            if (isWhiteish(x, 0)) toVisit.push([x, 0]);
            if (isWhiteish(x, height - 1)) toVisit.push([x, height - 1]);
        }
        for (let y = 0; y < height; y++) {
            if (isWhiteish(0, y)) toVisit.push([0, y]);
            if (isWhiteish(width - 1, y)) toVisit.push([width - 1, y]);
        }

        // Process nodes
        while (toVisit.length > 0) {
            const [x, y] = toVisit.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            const idx = getIdx(x, y);
            image.bitmap.data[idx + 3] = 0; // Make transparent

            // Add neighbors if they are white
            const neighbors = [
                [x, y - 1], [x, y + 1],
                [x - 1, y], [x + 1, y]
            ];

            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    if (isWhiteish(nx, ny) && !visited.has(`${nx},${ny}`)) {
                        toVisit.push([nx, ny]);
                    }
                }
            }
        }

        // Now securely crop the newly transparent padding!
        try {
            if (typeof image.crop === 'function') {
                let minX = width, minY = height, maxX = 0, maxY = 0;
                image.scan(0, 0, width, height, function (x, y, idx) {
                    if (this.bitmap.data[idx + 3] > 10) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                });
                if (maxX >= minX && maxY >= minY) {
                    image.crop({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
                }
            }
        } catch (e) {
            console.log("Could not crop properly", e.message);
        }

        // Resize down to an optimal size like 256x256 max bounds for quick web loading
        if (typeof image.resize === 'function') {
            image.resize({ w: 256, h: 256 });
        }

        await image.write("logo.png");
        console.log("SUCCESS");
    } catch (error) {
        console.error("Failed:", error);
    }
}

fixLogo();
