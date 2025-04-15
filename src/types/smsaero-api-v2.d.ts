declare module 'smsaero-api-v2' {
  interface SmsAeroResponse {
    success: boolean;
    data: unknown;
    message?: string;
  }

  class SmsAero {
    constructor(email: string, apiKey: string);

    send(
      phone: string,
      text: string,
      sign?: string,
      channel?: string,
      date?: string
    ): Promise<SmsAeroResponse>;

    checkStatus(id: string): Promise<SmsAeroResponse>;
    balance(): Promise<SmsAeroResponse>;
    tariffs(): Promise<SmsAeroResponse>;
    sign(): Promise<SmsAeroResponse>;
  }

  export default SmsAero;
}
