import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

export const uploadToS3 = async (
  bucketName: string,
  key: string,
  content: string,
  contentType: string = 'application/json'
): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: content,
    ContentType: contentType,
  });

  await s3Client.send(command);
};