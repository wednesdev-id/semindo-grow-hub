#!/bin/bash
echo "Initializing LocalStack S3..."
awslocal s3 mb s3://sinergiumkm
awslocal s3api put-bucket-acl --bucket sinergiumkm --acl public-read
echo "S3 Bucket 'sinergiumkm' created."
