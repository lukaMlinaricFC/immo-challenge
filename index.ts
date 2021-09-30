//run with "ts-node index.ts"
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import sanitizeHtml from 'sanitize-html';

const PAGE_URL =
    "https://www.hansimmo.be/appartement-te-koop-in-borgerhout/10161";

const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(PAGE_URL);

    const items = await page.evaluate(() => {

        let aptTitle = document.querySelector("#detail-description-container > h2");
        let aptDescription = document.querySelector("#detail-description-container > #description");
        let aptPrice = document.querySelector("#detail-title > .price");
        let aptAddress = document.querySelector("#detail-title > .address");

        return {
            description: aptDescription ? aptDescription.innerHTML.replace(/(\n|\r)/gm, "").trim() : "N/A",
            title: aptTitle ? aptTitle.textContent : "N/A",
            price: aptPrice ? aptPrice.textContent : "N/A",
            address: aptAddress ? aptAddress.textContent : "N/A",
        };

    });

    await browser.close();
    return items;
};

main().then((data) => {
    const apartment = {
        description: sanitizeHtml(data.description),
        title: data.title,
        price: data.price,
        address: data.address
    };
    fs.writeFileSync(path.resolve(__dirname, 'apartment.json'), JSON.stringify(apartment, null, '\t'));
    console.log("apartment.json file created in root directory.")
});
