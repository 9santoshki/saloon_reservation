export declare const mockStores: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    email: string;
    description: string;
    opening_hours: {
        Monday: {
            open: string;
            close: string;
        };
        Tuesday: {
            open: string;
            close: string;
        };
        Wednesday: {
            open: string;
            close: string;
        };
        Thursday: {
            open: string;
            close: string;
        };
        Friday: {
            open: string;
            close: string;
        };
        Saturday: {
            open: string;
            close: string;
        };
        Sunday: {
            open: string;
            close: string;
        };
    };
}[];
export declare const mockServices: {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: number;
    store_id: number;
}[];
