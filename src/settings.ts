import {Convert, Config} from "./settingsParser"
import * as fs from "fs";

const SETTINGS_FILE = 'settings.json';

class Settings {
    config: Config;

    constructor() {
        if (fs.existsSync(SETTINGS_FILE)) {
            this.config = Convert.toConfig(SETTINGS_FILE);
        }
        if (process.env.DISCORD_TOK) {
            this.config.discord_token = process.env.DISCORD_TOKEN;
        }

        if (!this.config.discord_token)
            throw 'invalid or missing DISCORD_TOK'
    }
}