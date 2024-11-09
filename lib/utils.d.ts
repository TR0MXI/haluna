import { Context } from "koishi";
import { CallServiceYaml } from "./types";
import { HaWsClinet } from "./ws_client";
export declare function CheckUrl(url: string): string;
export declare function waitForAuth(ws: HaWsClinet): Promise<void>;
export declare function CreateCallServiceCommand(ctx: Context, CallServiceYaml: CallServiceYaml, HaWsClinet: HaWsClinet): void;
export declare function searchObjectByPath(obj: any, path: string): any;
