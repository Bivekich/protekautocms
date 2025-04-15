// Конфигурация SMS Aero
const EMAIL = process.env.SMSAERO_EMAIL;
const API_KEY = process.env.SMSAERO_API_KEY;
const SIGN = process.env.SMSAERO_SIGN || 'SMS Aero';

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
    if (!EMAIL || !API_KEY) {
      console.error('SMS сервис не настроен');
      return false;
    }

    // Форматируем телефон (убираем всё кроме цифр)
    const formattedPhone = phone.replace(/\D/g, '');

    // Проверяем что номер не пустой
    if (!formattedPhone || formattedPhone.length < 10) {
      console.error('Некорректный номер телефона:', phone);
      return false;
    }

    console.log(
      `Отправка SMS на номер ${formattedPhone}, текст: Ваш код: ${code}`
    );

    // Базовая аутентификация (email:api_key в base64)
    const authString = Buffer.from(`${EMAIL}:${API_KEY}`).toString('base64');

    // Формируем URL и параметры запроса
    const url = 'https://gate.smsaero.ru/v2/sms/send';
    const params = new URLSearchParams({
      number: formattedPhone,
      text: `Ваш код: ${code}`,
      sign: SIGN,
    });

    // Отправляем SMS через API
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authString}`,
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    console.log('SMS API response:', data);

    if (response.ok && data.success) {
      console.log('SMS отправлено успешно');
      return true;
    }

    console.error('Ошибка отправки SMS:', data);
    return false;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}
