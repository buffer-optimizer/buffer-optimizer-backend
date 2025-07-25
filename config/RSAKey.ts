import fs from 'fs';
import { getRootDirectory,Env } from "../utils";

export default class RSAKey {
    @Env("RSA_PRIVATE_KEY")
    private static privateKey: string;

    @Env("RSA_PUBLIC_KEY")
    private static publicKey: string;

    public static getPublicKey(): string {
        const rootDir = getRootDirectory();
        return fs.readFileSync(`${rootDir}${RSAKey.publicKey}`,'utf8');
    }

    public static getPrivateKey(): string {
        const rootDir = getRootDirectory();
        return fs.readFileSync(`${rootDir}${RSAKey.privateKey}`,'utf8');
    }
} 