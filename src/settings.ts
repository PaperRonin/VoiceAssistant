const SETTINGS_FILE = './config.json';

export interface Config {
    discord_token: string;
    app_id: string;
    text?: any;
    prefix: string;
    language: string;
}

export class Settings {
    config: Config;

    constructor() {
        this.config = require(SETTINGS_FILE) as Config;

        if (!this.config.discord_token)
            throw 'invalid or missing DISCORD_TOK'
    }
}