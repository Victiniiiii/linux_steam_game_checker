# Linux Steam Game Checker

## Usage
```bash
ts-node index.ts STEAM_ID_HERE
```

## What does this code do?

This is a basic web scraping project which uses puppeteer.
It also uses puppeteer extra, and its stealth plugin to bypass cloudflare verification in SteamDB.

The code will require an input of your steam ID, then it will open your profile in the SteamDB website in a headless browser.
After that, it will check one by one which games in your library doesn't support Linux. 
Finally, it will output every unsupported game in an external "output.txt" file.

![image](https://github.com/user-attachments/assets/b9c40db5-429d-45e9-9c1b-e391ded7cb01)
