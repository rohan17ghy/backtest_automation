import puppeteer from "puppeteer";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
//const fs = require('fs');
import fs from 'fs';


export async function waitForCanvasUpdate(page: any, selector: any) {   

    return new Promise(async (resolve, reject) => {
        let prevCanvasContent = await captureCanvasContent(page, selector);

        const maxAttempts = 20;
        let currentAttempt = 1;
        let hasCanvasStartedChanging = false;
        const intervalId = setInterval(async () => {
            const currentCanvasContent = await captureCanvasContent(page, selector);

            if(currentAttempt >= maxAttempts){
                clearInterval(intervalId);
                reject(new Error(`Waiting for canvas update timed out`));
            }

            if (hasCanvasStartedChanging){
                if (hasCanvasChanged(prevCanvasContent, currentCanvasContent)) {
                    prevCanvasContent = currentCanvasContent;
                    console.log('Canvas is still changing');

                } else {
                    console.log('Canvas has stopped changing');
                    clearInterval(intervalId);
                    resolve(true);
                }
            }
            else{
                if (hasCanvasChanged(prevCanvasContent, currentCanvasContent)) {
                    hasCanvasStartedChanging = true;
                    prevCanvasContent = currentCanvasContent;
                    console.log('Canvas content has started changing.');
                } else {
                    console.log('Canvas content has not started changing yet...');
                }
            }            
            currentAttempt += 1;
        }, 500);
    })
}


async function captureCanvasContent(page: any, canvasSelector: any) {
  const dataURI = await page.evaluate((selector: any) => {
    const canvas = document.querySelector(selector);
    return canvas.toDataURL(); // Capture canvas content as a data URI
  }, canvasSelector);

  // Convert data URI to PNG image buffer
  const base64Data = dataURI.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Convert PNG image buffer to PNG object
  return PNG.sync.read(buffer);
}

function hasCanvasChanged(initialContent: any, currentContent: any) {
  // Compare the initial and current canvas content
  // You can use pixel-by-pixel comparison or other techniques
  // For simplicity, this example uses pixelmatch library
  const diffPixels = pixelmatch(initialContent.data, currentContent.data, null, initialContent.width, initialContent.height, { threshold: 0.1 });
  return diffPixels > 0;
}
