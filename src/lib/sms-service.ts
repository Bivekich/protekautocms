import SmsAero from 'smsaero-api-v2';

// Конфигурация SMS Aero
const EMAIL = process.env.SMSAERO_EMAIL;
const API_KEY = process.env.SMSAERO_API_KEY;
const SIGN = process.env.SMSAERO_SIGN || 'SMS Aero';

// Инициализация клиента SMS Aero
let smsAero: SmsAero | null = null;

if (EMAIL && API_KEY) {
  try {
    smsAero = new SmsAero(EMAIL, API_KEY);
  } catch (error) {
    console.error('Ошибка инициализации SMS Aero:', error);
  }
}

// Функция для генерации случайного кода
export function generateVerificationCode(length = 4): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// Функция для отправки SMS с кодом
export async function sendSmsCode(
  phone: string,
  code: string
): Promise<boolean> {
  try {
    // В режиме разработки просто логируем код
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE] SMS to ${phone}: Your code is ${code}`);
      return true;
    }

    // Проверяем настройки SMS-сервиса
    if (!smsAero || !EMAIL || !API_KEY) {
      console.error('SMS сервис не настроен');
      return false;
    }

    // Форматируем телефон (убираем +7 и оставляем только цифры)
    const formattedPhone = phone.replace(/\D/g, '').replace(/^7/, '');

    // Отправляем SMS
    const response = await smsAero.send(
      formattedPhone,
      `Ваш код: ${code}`,
      SIGN
    );

    if (response && response.success) {
      return true;
    }

    console.error('Ошибка отправки SMS:', response);
    return false;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}
