export declare function blobToBase64(blob: Blob): Promise<string>;
export declare function blobUrlToObject(url: string): Promise<Blob>;
export declare function blobUrlToBase64(url: string): Promise<string>;
export declare function base64ToBuffer(base64: string): Buffer<ArrayBuffer>;
export declare function bufferToBase64(buffer: Buffer): string;
export declare function base64ToBlobUrl(base64: string): string | Promise<string>;
