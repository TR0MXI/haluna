import { Schema } from "koishi";
export interface Config {
    path: string;
    token: string;
    ping: number;
    timeout: number;
    debug: boolean;
}
export declare const Config: Schema<Config>;
