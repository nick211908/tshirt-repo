
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    handler: (response: any) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: any;
    theme?: {
        color: string;
    };
}

export const loadRazorpay = (src = 'https://checkout.razorpay.com/v1/checkout.js') => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export const openRazorpay = (options: RazorpayOptions) => {
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
};
