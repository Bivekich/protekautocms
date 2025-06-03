import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir, access, unlink } from 'fs/promises';
import { join } from 'path';

// Проверяем, используем ли локальное хранилище
const useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true';
console.log('Используется локальное хранилище:', useLocalStorage);

// Создаем S3 клиента (если не используем локальное хранилище)
const s3Client = !useLocalStorage ? new S3Client({
  region: process.env.AWS_REGION || 'ru-1',
  endpoint: process.env.AWS_S3_ENDPOINT || 'https://s3.twcstorage.ru',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Важно для совместимости с TWC Storage
}) : null;

// Имя бакета
const bucketName = process.env.AWS_S3_BUCKET || 'be184fd4-protekauto';

// Путь для локального хранилища
const localStoragePath = join(process.cwd(), 'public', 'uploads');

// Функция для создания директории, если она не существует
async function ensureDirectoryExists(dirPath: string) {
  try {
    await access(dirPath);
  } catch {
    // Если директория не существует, создаем её
    await mkdir(dirPath, { recursive: true });
  }
}

// Функция для загрузки файла в S3 или локальное хранилище
export async function uploadFileToS3(file: Buffer, fileName: string, contentType: string, folder = 'avatars'): Promise<string> {
  // Если используем локальное хранилище
  if (useLocalStorage) {
    try {
      console.log('Сохраняем файл локально:', fileName);
      
      // Полный путь к директории
      const targetDir = join(localStoragePath, folder);
      
      // Убеждаемся, что директория существует
      await ensureDirectoryExists(targetDir);
      
      // Полный путь к файлу
      const filePath = join(targetDir, fileName);
      
      // Сохраняем файл
      await writeFile(filePath, file);
      
      console.log('Файл успешно сохранен локально:', filePath);
      
      // Возвращаем публичный URL
      return `/uploads/${folder}/${fileName}`;
    } catch (error) {
      console.error('Ошибка при сохранении файла локально:', error);
      throw new Error('Не удалось сохранить файл локально');
    }
  }
  
  // Если используем S3
  const key = `${folder}/${fileName}`;
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  };
  
  try {
    if (!s3Client) {
      throw new Error('S3 клиент не инициализирован');
    }
    
    console.log('Загружаем файл в S3:', { bucket: bucketName, key, contentType });
    await s3Client.send(new PutObjectCommand(params));
    console.log('Файл успешно загружен в S3');
    
    // Возвращаем URL файла для TWC Storage
    return `${process.env.AWS_S3_ENDPOINT}/${bucketName}/${key}`;
  } catch (error) {
    console.error('Ошибка при загрузке файла в S3:', error);
    throw new Error('Не удалось загрузить файл в S3');
  }
}

// Функция для удаления файла из S3 или локального хранилища
export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  // Если используем локальное хранилище
  if (useLocalStorage) {
    try {
      // Извлекаем путь к файлу из URL
      const filePath = join(process.cwd(), 'public', fileUrl);
      await unlink(filePath);
      console.log('Файл успешно удален локально:', filePath);
    } catch (error) {
      console.error('Ошибка при удалении файла локально:', error);
      throw new Error('Не удалось удалить файл локально');
    }
    return;
  }
  
  // Если используем S3, извлекаем ключ из URL
  const key = extractKeyFromUrl(fileUrl);
  
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  
  try {
    if (!s3Client) {
      throw new Error('S3 клиент не инициализирован');
    }
    
    console.log('Удаляем файл из S3:', { bucket: bucketName, key });
    await s3Client.send(new DeleteObjectCommand(params));
    console.log('Файл успешно удален из S3');
  } catch (error) {
    console.error('Ошибка при удалении файла из S3:', error);
    throw new Error('Не удалось удалить файл из S3');
  }
}

// Функция для извлечения ключа из URL
function extractKeyFromUrl(fileUrl: string): string {
  if (fileUrl.startsWith('http')) {
    // Для полных URL извлекаем ключ после имени бакета
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === bucketName);
    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
      return urlParts.slice(bucketIndex + 1).join('/');
    }
  }
  // Для относительных URL просто убираем начальный /uploads/
  return fileUrl.replace(/^\/uploads\//, 'media/');
}

// Функция для получения временного URL для файла из S3
export async function getSignedFileUrl(key: string, expiresIn = 3600): Promise<string> {
  // Если используем локальное хранилище, просто возвращаем путь
  if (useLocalStorage) {
    return `/uploads/${key}`;
  }
  
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  
  try {
    if (!s3Client) {
      throw new Error('S3 клиент не инициализирован');
    }
    
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Ошибка при получении URL для файла из S3:', error);
    throw new Error('Не удалось получить URL для файла из S3');
  }
}

// Функция для генерации уникального имени файла
export function generateUniqueFileName(userId: string, originalFileName: string): string {
  const extension = originalFileName.split('.').pop() || 'jpg';
  return `avatar-${userId}-${uuidv4()}.${extension}`;
}

// Функция для генерации уникального имени медиа-файла
export function generateUniqueMediaFileName(originalFileName: string): string {
  const extension = originalFileName.split('.').pop() || 'jpg';
  return `media-${uuidv4()}.${extension}`;
} 