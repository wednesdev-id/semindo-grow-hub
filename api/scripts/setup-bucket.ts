
import { S3Client, CreateBucketCommand, PutBucketAclCommand, HeadBucketCommand, ObjectCannedACL } from '@aws-sdk/client-s3';

const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    },
    forcePathStyle: true,
});

const BUCKET_NAME = 'sinergiumkm';

async function main() {
    console.log(`Checking bucket s3://${BUCKET_NAME} on ${process.env.S3_ENDPOINT || 'http://localhost:4566'}...`);

    try {
        await client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`✅ Bucket s3://${BUCKET_NAME} already exists.`);
    } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            console.log(`Bucket does not exist. Creating...`);
            try {
                await client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
                console.log(`✅ Bucket s3://${BUCKET_NAME} created successfully.`);

                // Set ACL
                try {
                    // Note: PUT Bucket ACL might not be supported/needed in all LocalStack versions or requires specific config
                    // But we try to ensure public-read
                    await client.send(new PutBucketAclCommand({
                        Bucket: BUCKET_NAME,
                        ACL: 'public-read' as ObjectCannedACL
                    }));
                    console.log(`✅ Bucket ACL set to public-read.`);
                } catch (aclError) {
                    console.warn(`⚠️ Warning: Could not set Bucket ACL (might be default in LocalStack):`, aclError);
                }

            } catch (createError) {
                console.error(`❌ Failed to create bucket:`, createError);
                process.exit(1);
            }
        } else {
            console.error(`❌ Error checking bucket:`, error);
            process.exit(1);
        }
    }
}

main();
