
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.S3_REGION || 'us-east-1',
            endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
            },
            forcePathStyle: true, // Needed for LocalStack
        });
        this.bucketName = process.env.S3_BUCKET || 'sinergiumkm';
        this.initBucket();
    }

    private async initBucket() {
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
            console.log(`S3 Bucket '${this.bucketName}' exists.`);
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                console.log(`S3 Bucket '${this.bucketName}' not found. Creating...`);
                try {
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
                    console.log(`S3 Bucket '${this.bucketName}' created.`);
                } catch (createError) {
                    console.error(`Failed to create S3 bucket '${this.bucketName}':`, createError);
                }
            } else {
                console.error(`Error checking S3 bucket:`, error);
            }
        }
    }

    public async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: mimeType,
            ACL: 'public-read' as ObjectCannedACL // Use string casting if type issues due to SDK version
        });

        try {
            await this.s3Client.send(command);
            // Construct Public URL
            // For LocalStack: http://localhost:4566/bucket-name/key
            const endpoint = process.env.S3_ENDPOINT || 'http://localhost:4566';
            // Remove trailing slash if present
            const cleanEndpoint = endpoint.replace(/\/$/, '');
            return `${cleanEndpoint}/${this.bucketName}/${fileName}`;
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new Error('Failed to upload file to S3');
        }
    }
}

export const s3Service = new S3Service();
