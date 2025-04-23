import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

puppeteer.use(StealthPlugin());

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGamesFromSteamDB(steamId: string) {
	const url = `https://steamdb.info/calculator/${steamId}/?cc=tr&all_games`;
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const page = await browser.newPage();

	await page.setViewport({ width: 1280, height: 800 });
	console.log("Navigating to page...");
	await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });

	const viewAllButton = await page.$('a.btn.btn-sm.btn-primary[rel="nofollow"]');
	if (viewAllButton) {
		console.log("Clicking 'View all games'...");
		await viewAllButton.click();
		await delay(2000);
	} else {
		console.log("'View all games' button not found, skipping...");
	}

	console.log("Waiting for dropdown...");
	await page.waitForSelector("select#dt-length-0");
	console.log("Selecting 'All' from dropdown...");
	await page.select("select#dt-length-0", "-1");
	await delay(2000);

	console.log("Waiting for games to load...");
	await page.waitForSelector("td.text-left > a", { timeout: 60000 });

	const gameElements = await page.$$("td.text-left > a");
	const unsupportedGames: string[] = [];

	console.log("Checking games for Linux support...");
	for (const gameEl of gameElements) {
		await gameEl.hover();
		await delay(500);

		const name = await page.evaluate((el) => el.textContent?.trim() || "", gameEl);
		const hasLinuxIcon = (await page.$(".octicon.octicon-linux")) !== null;

		console.log(`${name} → Linux: ${hasLinuxIcon}`);
		if (!hasLinuxIcon) {
			unsupportedGames.push(name);
		}
	}

	await browser.close();

	if (unsupportedGames.length > 0) {
		console.log(`Writing ${unsupportedGames.length} unsupported games to output.txt...`);
		fs.writeFileSync("output.txt", unsupportedGames.join("\n"));
		console.log("Done.");
	} else {
		console.log("All games support Linux. Nothing to write.");
	}
}

const steamId = process.argv[2];
if (!steamId) {
	console.log("Usage: ts-node index.ts <steam_id>");
	process.exit(1);
}

getGamesFromSteamDB(steamId);
