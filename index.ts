import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGamesFromSteamDB(steamId: string) {
	const url = `https://steamdb.info/calculator/${steamId}/?cc=tr&all_games`;
	const browser = await puppeteer.launch({
		headless: false,
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

	console.log("Extracting games...");
	const games = await page.evaluate(() => {
		const gameLinks = Array.from(document.querySelectorAll("td.text-left > a"));
		return gameLinks.map((link) => link.textContent?.trim()).filter(Boolean);
	});

	if (games.length === 0) {
		console.log("No games found. Profile may be private.");
	} else {
		console.log(`🎮 Games owned by SteamID ${steamId}:`);
		games.forEach((game, index) => console.log(`${index + 1}. ${game}`));
	}

	await browser.close();
}

const steamId = process.argv[2];
if (!steamId) {
	console.log("Usage: ts-node index.ts <steam_id>");
	process.exit(1);
}

getGamesFromSteamDB(steamId);
