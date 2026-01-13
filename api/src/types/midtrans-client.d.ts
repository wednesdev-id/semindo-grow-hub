declare module 'midtrans-client' {
    export class Snap {
        constructor(options: {
            isProduction: boolean;
            serverKey: string;
            clientKey?: string;
        });

        createTransaction(parameter: any): Promise<{
            token: string;
            redirect_url: string;
        }>;

        createTransactionToken(parameter: any): Promise<string>;
    }

    export class CoreApi {
        constructor(options: {
            isProduction: boolean;
            serverKey: string;
            clientKey?: string;
        });

        charge(parameter: any): Promise<any>;
        capture(parameter: any): Promise<any>;
        cardRegister(parameter: any): Promise<any>;
        cardToken(parameter: any): Promise<any>;
        cardPointInquiry(tokenId: string): Promise<any>;
    }

    export default {
        Snap,
        CoreApi,
    };
}
