export interface BaseMessage {
    type: string;
}
export interface AuthMessage extends BaseMessage {
    type: string;
    access_token: string;
}
export interface CommandMessage extends BaseMessage {
    id: number;
    type: string;
}
export interface EventSubscribeMessage extends CommandMessage {
    id: number;
    type: string;
    event_type: string;
}
export interface TriggerMessage extends CommandMessage {
    id: number;
    type: string;
    trigger: {
        platform: string;
        [key: string]: any;
    };
}
export interface CallServiceMessage extends CommandMessage {
    id: number;
    type: string;
    domain: string;
    service: string;
    service_data?: any;
    target?: {
        entity_id: string;
    };
    return_response: boolean;
}
export interface CallServiceYaml extends CallServiceMessage {
    command: {
        name: string;
        level?: number;
    };
    id: number;
    type: string;
    domain: string;
    service: string;
    service_data?: any;
    target?: {
        entity_id: string;
    };
    return_response: boolean;
    responsepath?: {
        type: string;
        path: string;
    }[];
}
