
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  provider: 'stripe' | 'flutterwave' | 'lenco';
  supportedCurrencies: string[];
  countries: string[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  paymentMethodId: string;
  loanId?: string;
}

export class PaymentGatewayService {
  private static paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe_card',
      name: 'Credit/Debit Card (International)',
      type: 'card',
      provider: 'stripe',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      countries: ['Global']
    },
    {
      id: 'flutterwave_card',
      name: 'Credit/Debit Card (Africa)',
      type: 'card',
      provider: 'flutterwave',
      supportedCurrencies: ['ZMW', 'KES', 'NGN', 'GHS'],
      countries: ['Zambia', 'Kenya', 'Nigeria', 'Ghana']
    },
    {
      id: 'lenco_mtn',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      provider: 'lenco',
      supportedCurrencies: ['ZMW'],
      countries: ['Zambia']
    },
    {
      id: 'lenco_airtel',
      name: 'Airtel Money',
      type: 'mobile_money',
      provider: 'lenco',
      supportedCurrencies: ['ZMW'],
      countries: ['Zambia']
    },
    {
      id: 'lenco_bank',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      provider: 'lenco',
      supportedCurrencies: ['ZMW'],
      countries: ['Zambia']
    }
  ];

  static getAvailablePaymentMethods(currency: string, country?: string): PaymentMethod[] {
    return this.paymentMethods.filter(method => {
      const supportsCurrency = method.supportedCurrencies.includes(currency);
      const supportsCountry = !country || method.countries.includes(country) || method.countries.includes('Global');
      return supportsCurrency && supportsCountry;
    });
  }

  static async processPayment(request: PaymentRequest): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const method = this.paymentMethods.find(m => m.id === request.paymentMethodId);
      if (!method) {
        throw new Error('Payment method not found');
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate different success rates based on payment method
      const successRate = method.provider === 'stripe' ? 0.95 : method.provider === 'flutterwave' ? 0.90 : 0.85;
      const isSuccess = Math.random() < successRate;

      if (isSuccess) {
        return {
          success: true,
          transactionId: `${method.provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed. Please try again.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error'
      };
    }
  }
}
