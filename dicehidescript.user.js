// ==UserScript==
// @name         ダイススレとサラダバー
// @namespace    http://tampermonkey.net/
// @version      2025-02-08
// @description  ダイススレを非表示にしよう。
// @author       Priority (materialfill65@gmail.com)
// @match        https://bbs.animanch.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bbs.animanch.com
// @grant        none
// ==/UserScript==

(async () => {
    "use strict";
    const MAX_IMAGE_SIZE = 70;
    const HISTOGRAM_LEVELS = 40;
    const HISTOGRAM_STEP = 256 / HISTOGRAM_LEVELS;
    const OPACITY_THRESHOLD = 0.8;
    const DICE_SYMBOL = "🎲";

    const ORIGINAL_HISTOGRAMS = [
        {
            r: [
                52, 116, 54, 27, 29, 31, 21, 44, 50, 44, 90, 114, 47, 66, 57, 90, 125,
                124, 63, 54, 102, 134, 132, 80, 55, 83, 60, 102, 110, 101, 118, 189,
                201, 243, 248, 262, 226, 337, 408, 411,
            ],
            g: [
                0, 3, 6, 7, 15, 28, 25, 36, 52, 58, 54, 69, 48, 68, 69, 71, 121, 183,
                90, 89, 120, 256, 160, 100, 118, 175, 94, 152, 173, 105, 211, 131, 136,
                169, 110, 268, 293, 389, 341, 307,
            ],
            b: [
                121, 44, 18, 15, 25, 31, 27, 45, 40, 37, 61, 41, 51, 83, 137, 120, 148,
                140, 99, 156, 194, 172, 148, 102, 137, 155, 91, 108, 103, 106, 129, 246,
                162, 107, 111, 164, 215, 252, 328, 431,
            ],
        },
        {
            r: [
                5, 18, 30, 34, 25, 33, 36, 43, 47, 33, 53, 45, 62, 85, 84, 95, 85, 82,
                64, 64, 74, 56, 85, 87, 89, 105, 89, 125, 135, 180, 205, 199, 207, 213,
                227, 363, 297, 354, 349, 438,
            ],
            g: [
                3, 9, 42, 33, 29, 37, 32, 45, 38, 36, 48, 38, 48, 73, 73, 74, 78, 96,
                104, 105, 114, 81, 89, 101, 117, 167, 128, 172, 182, 161, 181, 133, 224,
                214, 234, 367, 305, 300, 235, 354,
            ],
            b: [
                10, 16, 29, 27, 38, 48, 39, 42, 33, 34, 47, 44, 61, 57, 78, 96, 88, 138,
                121, 143, 172, 142, 176, 137, 142, 151, 153, 177, 184, 165, 164, 159,
                157, 151, 160, 206, 187, 294, 240, 394,
            ],
        },
        {
            r: [
                17, 11, 18, 19, 29, 19, 31, 26, 41, 29, 33, 27, 58, 85, 51, 60, 58, 57,
                49, 43, 45, 43, 69, 86, 66, 96, 88, 101, 67, 148, 113, 127, 140, 123,
                125, 241, 198, 204, 220, 719,
            ],
            g: [
                16, 13, 19, 21, 24, 24, 26, 26, 35, 41, 24, 33, 37, 49, 56, 58, 56, 64,
                77, 76, 68, 67, 75, 129, 96, 119, 107, 215, 119, 167, 127, 101, 163,
                178, 118, 273, 180, 197, 123, 383,
            ],
            b: [
                16, 14, 20, 20, 21, 23, 31, 26, 37, 35, 31, 31, 37, 77, 58, 128, 81,
                102, 87, 94, 145, 114, 174, 87, 104, 114, 106, 172, 184, 105, 101, 98,
                105, 108, 112, 118, 111, 110, 103, 540,
            ],
        },
        {
            r: [
                18, 129, 22, 16, 8, 3, 9, 19, 26, 18, 105, 88, 50, 36, 29, 47, 126, 87,
                56, 46, 52, 132, 110, 65, 69, 70, 77, 108, 83, 98, 143, 237, 172, 393,
                311, 183, 174, 299, 515, 461,
            ],
            g: [
                0, 0, 0, 0, 0, 1, 1, 6, 25, 25, 35, 22, 39, 29, 39, 59, 65, 213, 85, 64,
                80, 341, 102, 71, 104, 200, 103, 107, 234, 97, 244, 125, 188, 359, 161,
                297, 272, 320, 303, 274,
            ],
            b: [
                86, 26, 22, 7, 7, 11, 13, 9, 17, 8, 14, 26, 23, 73, 162, 104, 202, 106,
                76, 96, 212, 203, 101, 85, 112, 212, 108, 114, 85, 72, 133, 371, 157,
                264, 111, 153, 239, 117, 322, 431,
            ],
        },
        {
            r: [
                49, 63, 48, 34, 18, 34, 25, 45, 50, 46, 86, 68, 85, 65, 68, 84, 99, 88,
                59, 55, 90, 117, 121, 77, 96, 95, 74, 117, 104, 87, 133, 197, 214, 188,
                228, 239, 265, 325, 394, 360,
            ],
            g: [
                3, 2, 4, 11, 14, 18, 24, 32, 51, 39, 49, 46, 57, 63, 61, 73, 115, 170,
                118, 75, 104, 251, 174, 84, 117, 159, 113, 125, 152, 122, 214, 125, 169,
                162, 165, 293, 231, 371, 301, 233,
            ],
            b: [
                81, 27, 36, 32, 23, 23, 25, 35, 41, 42, 48, 34, 40, 81, 116, 142, 136,
                139, 128, 139, 152, 180, 151, 96, 119, 157, 121, 103, 111, 116, 175,
                185, 144, 151, 140, 181, 200, 225, 244, 371,
            ],
        },
        {
            r: [
                23, 57, 71, 21, 20, 21, 21, 27, 39, 41, 67, 73, 71, 55, 46, 61, 47, 61,
                39, 47, 71, 106, 128, 69, 70, 86, 68, 91, 122, 86, 125, 173, 218, 202,
                223, 213, 216, 347, 363, 805,
            ],
            g: [
                0, 2, 4, 9, 12, 11, 21, 17, 27, 31, 42, 49, 56, 67, 64, 79, 110, 168,
                86, 75, 102, 241, 136, 75, 113, 167, 97, 118, 191, 99, 178, 135, 194,
                131, 148, 229, 224, 300, 214, 668,
            ],
            b: [
                25, 19, 23, 28, 35, 34, 34, 34, 36, 40, 35, 35, 54, 61, 103, 123, 160,
                119, 109, 101, 154, 201, 148, 113, 137, 125, 73, 119, 88, 86, 155, 161,
                126, 100, 90, 140, 157, 176, 266, 867,
            ],
        },
    ];

    async function createHistogram(imageData) {
        const histogram = {
            r: new Array(HISTOGRAM_LEVELS).fill(0),
            g: new Array(HISTOGRAM_LEVELS).fill(0),
            b: new Array(HISTOGRAM_LEVELS).fill(0),
        };
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            histogram.r[Math.floor(data[i] / HISTOGRAM_STEP)]++;
            histogram.g[Math.floor(data[i + 1] / HISTOGRAM_STEP)]++;
            histogram.b[Math.floor(data[i + 2] / HISTOGRAM_STEP)]++;
        }
        return histogram;
    }

    async function calculateHistogramSimilarity(hist1, hist2) {
        let diff = 0;
        let maxValue = 0;
        for (const color of ["r", "g", "b"]) {
            for (let i = 0; i < HISTOGRAM_LEVELS; i++) {
                diff += Math.abs(hist1[color][i] - hist2[color][i]);
                maxValue += hist1[color][i] + hist2[color][i];
            }
        }
        return 1 - diff / maxValue;
    }

    async function getImageDataFromImg(img) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
                const aspectRatio = width / height;
                const maxSide = Math.max(width, height);
                if (maxSide === width) {
                    width = MAX_IMAGE_SIZE;
                    height = Math.round(MAX_IMAGE_SIZE / aspectRatio);
                } else {
                    height = MAX_IMAGE_SIZE;
                    width = Math.round(MAX_IMAGE_SIZE * aspectRatio);
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(ctx.getImageData(0, 0, width, height));
        });
    }

    async function compareImagesByImg(img) {
        try {
            const imageData = await getImageDataFromImg(img);
            const hist = await createHistogram(imageData);

            const similarities = await Promise.all(
                ORIGINAL_HISTOGRAMS.map(async (original_hist) => {
                    return await calculateHistogramSimilarity(hist, original_hist);
                })
            );

            return similarities.some((similar) => similar > OPACITY_THRESHOLD);
        } catch (error) {
            console.error("Error comparing images:", error);
            return 0;
        }
    }

    // 画像比較処理
    const cardElements = Array.from(document.querySelectorAll(".card"));
    await Promise.all(
        cardElements.map(async (card) => {
            const img = card.querySelector("img");
            if (!img) return;
            const text = card.textContent || "";

            const result = await compareImagesByImg(img);
            card.style.display = String(
                text.includes(DICE_SYMBOL) || result ? "none" : "block"
            );
        })
    );

    // kakolog13 ページでの処理
    if (document.location.pathname.startsWith("/kakolog")) {
        const items = Array.from(document.querySelectorAll(".list-group-item"));
        for (const item of items) {
            const img = document.createElement("img");
            if (!img) continue;
            const text = item.textContent || "";

            img.onload = async () => {
                const result = ((await compareImagesByImg(img)) * 10) ** 2 / 100;

                item.style.display = String(
                    text.includes(DICE_SYMBOL) || result ? "none" : "block"
                );
            };
            img.onerror = () => {
                console.error("Error loading image:", img.src);
            };

            const backgroundImage =
                item.querySelector("div")?.style["background-image"];
            if (backgroundImage) {
                img.src = backgroundImage.split('"')[1];
            }
        }
    }
})();
