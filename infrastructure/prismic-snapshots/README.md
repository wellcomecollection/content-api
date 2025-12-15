# Prismic Snapshots & Assets - Infrastructure

This directory contains Terraform infrastructure for daily Prismic content snapshot and asset backups.

## Purpose

Maintains backups for 14-days:

- **Document snapshots**: Complete JSON export of all Prismic documents (11 PM UTC daily)
- **Asset backups**: Complete JSON export of all media library meta data and incremental backups of the assets themselves (11 PM UTC daily)

## File Structure

```
infrastructure/prismic-snapshots/
├── terraform.tf                      # Provider configuration
├── lambda_snapshot.tf                # Document snapshot Lambda
├── lambda_backup_trigger.tf          # Asset list/trigger Lambda
├── lambda_backup_download.tf         # Asset download Lambda
├── assets_backup_state_machine.tf    # Step Functions workflow
├── s3.tf                            # S3 buckets
├── schedulers.tf                    # EventBridge schedules
├── outputs.tf                       # Terraform outputs
├── README.md                        # This file
├── scripts/
│   ├── build-lambda.sh              # Lambda package builder
│   ├── deploy.sh                    # Full infrastructure deployment
│   └── deploy-code.sh               # Code-only deployment
├── lambda/
│   ├── prismic-snapshot.js          # Document snapshot Lambda
│   ├── prismic-backup-trigger.js    # Asset list Lambda
│   └── prismic-backup-download.js   # Asset download Lambda
└── testing/
    ├── test-prismic-backup-trigger.js # For local testing/development
    └── test-prismic-backup-download.js # For local testing/development
```

## Architecture

### Document Snapshots (Daily at 11 PM UTC)

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│ EventBridge     │───▶│ prismic-snapshot     │───▶│ S3 Bucket       │
│ (Daily 11 PM)   │    │ Lambda               │    │ snapshots/      │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
```

### Asset Backups (Incremental)

```
┌─────────────────┐    ┌──────────────────────────┐    ┌─────────────────────┐
│ EventBridge     │───▶│ prismic-backup-trigger   │───▶│ Step Functions      │
│ (Daily 11 PM)   │    │ (Fetch asset list)       │    │ State Machine       │
└─────────────────┘    └──────────────────────────┘    └─────────────────────┘
                                                                 │
                                                                 ▼
                       ┌──────────────────────────────────────────────────────┐
                       │ Map State (Parallel Download)                        │
                       │  ┌────────────────────────────────────────────────┐  │
                       │  │ prismic-backup-download (up to 10 concurrent)  │  │
                       │  │ Downloads batch of 100 assets each             │  │
                       │  └────────────────────────────────────────────────┘  │
                       └──────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                                         ┌─────────────────────────┐
                                         │ S3 Bucket               │
                                         │ media-library/files/    │
                                         └─────────────────────────┘
```

### How Asset Backups Work

1. **Trigger Lambda** (`prismic-backup-trigger`):
   - Fetches the complete list of assets from Prismic Asset API (stored in S3 with 14-day retention)
   - Checks `latest-assets.json` in S3 for previous fetch time
   - Updates latest-assets.json with last fetch time and file location
   - Filters assets modified since last backup
   - Batches assets into groups of 100
   - Returns batches to Step Functions as `{ items: [[batch1], [batch2], ...] }`

2. **Step Functions State Machine**:
   - Receives batches from trigger Lambda
   - Uses Map state to process batches in parallel
   - Runs up to 10 concurrent download Lambda executions

3. **Download Lambda** (`prismic-backup-download`):
   - Receives one batch (up to 100 asset IDs + URLs)
   - Downloads each asset file from Prismic CDN
   - Uploads to S3 at `media-library/files/{filename}.{extension}`
   - Reports success/failure counts back to state machine

**N.B. the filename includes the asset id**

### Incremental Backup Strategy

- **First run**: Downloads entire list of assets with meta data and downloads all asset files
- **Subsequent runs**: Downloads entire list of assets with meta data but only downloads assets modified since last backup
- **Tracking**: `latest-assets.json` stores last fetch timestamp and filename of latest backup

## Configuration

### Schedules

Document snapshots and asset backups occur daily at **11 PM UTC**. These are configured in `schedulers.tf`

To change the schedules, modify the `schedule_expression`.

```hcl
schedule_expression = "cron(0 23 * * ? *)" # 11 PM UTC daily
```

### Retention

Both document snapshots and asset inventories are kept for **14 days**. Asset files in `media-library/files/` have no automatic expiration. To change retention, modify the `days` in the lifecycle configuration in `s3.tf`:

```hcl
expiration {
  days = 14  # Change this value
}
```

### Lambda Configuration

| Lambda                    | Memory | Timeout | Concurrency                   |
| ------------------------- | ------ | ------- | ----------------------------- |
| `prismic-snapshot`        | 1GB    | 15 min  | 1                             |
| `prismic-backup-trigger`  | 1GB    | 15 min  | 1                             |
| `prismic-backup-download` | 1GB    | 15 min  | Up to 10 (via Step Functions) |

Adjust in respective `lambda_*.tf` files if needed.

## Storage

### S3 Bucket

**Bucket**: `wellcomecollection-prismic-backups`

### Directory Structure

```
wellcomecollection-prismic-backups/
├── snapshots/
│   ├── prismic-snapshot-{timestamp}.json # full document content snapshots (14-day retention)
│   ├── prismic-snapshot-2{timestamp}.json
│   └── ...
└── media-library/
    ├── latest-assets.json              # tracking file for incremental backups
    ├── prismic-assets-{timestamp}.json # full asset inventory snapshots (14-day retention)
    ├── prismic-assets-{timestamp}.json
    └── ...
    └── files/
        ├── {filename-1}.jpg
        ├── {filename-2}.pdf
        ├── {filename-3}.mp4
        └── ...
```

### File Formats

**Document Snapshots** (`snapshots/`):

- Format: JSON
- Naming: `prismic-snapshot-{ISO-8601-timestamp}.json`
- Content: Complete Prismic document export

**Asset Files** (`media-library/files/`):

- Format: Original file type (JPEG, PNG, PDF, MP4, etc.)
- Content: Binary asset file from Prismic CDN

**Asset Inventories** (`media-library/`):

- Format: JSON
- Naming: `prismic-assets-{timestamp}.json`
- Content: Full list of all assets with metadata

**Tracking File** (`media-library/latest-assets.json`):

```json
{
  "filename": "prismic-assets-2025-12-01T12-00-00Z.json",
  "fetch_started_at": 1733054400000
}
```

## Deployment

### Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Terraform installed** (>= 0.12)
3. **Node.js and npm installed** (for building Lambda package)
4. **Prismic access token** stored in AWS Secrets Manager

N.B. The Prismic access token is already stored in AWS Secrets Manager as `prismic-model/prod/access-token` and is used by other services. You can verify it exists:

```bash
AWS_PROFILE=experience-developer aws secretsmanager describe-secret --secret-id "prismic-model/prod/access-token"
```

### Full Deployment (Rare)

- **What**: Creates S3 bucket, IAM roles, EventBridge schedule + deploys Lambda funtion with snapshot code
- **When**: Initial setup, permission changes, schedule changes
- **Impact**: Complete infrastructure deployment, requires planning
- **How**:

```bash
cd infrastructure/prismic-snapshots
./deploy.sh
```

### Update Lambda Code Only (As required)

- **What**: Updates Lambda function code only
- **When**: Bug fixes, feature updates, logic changes
- **Impact**: Safe to run anytime
- **How**:

```bash
cd infrastructure/prismic-snapshots/scripts

# Deploy a specific Lambda function
./deploy-code.sh <lambda-name>

# Examples:
./deploy-code.sh prismic-snapshot              # Original snapshot Lambda
./deploy-code.sh prismic-backup-trigger        # Asset list/trigger Lambda
./deploy-code.sh prismic-backup-download       # Asset download Lambda
```

## Testing

### Running lambdas locally

#### Prerequisites

1. **Install dependencies**:

   ```bash
   cd infrastructure/prismic-snapshots
   npm install
   ```

2. **Create `.env` file** in `infrastructure/prismic-snapshots/`:

   ```bash
   PRISMIC_BEARER_TOKEN=your-prismic-token-here
   ```

3. **AWS credentials** (automatic for LocalStack):
   - The test scripts automatically use dummy credentials (`test`/`test`)
   - For real AWS testing, set `AWS_PROFILE` or provide actual credentials

#### Running Tests

```bash
cd infrastructure/prismic-snapshots/testing

# Test the trigger Lambda (fetches asset list from Prismic)
node test-prismic-backup-trigger.js

# Test the download Lambda (downloads assets to S3)
node test-prismic-backup-download.js
```

#### LocalStack Testing

To test with LocalStack S3:

1. **Start LocalStack**:

   ```bash
   localstack start
   ```

2. **Uncomment the S3_ENDPOINT line** in the test files:

   ```javascript
   process.env.S3_ENDPOINT = 'http://localhost:4566';
   ```

3. **Run the tests** as normal

### Manual Lambda Invocation/Snapshot Creation

```bash
# Test the Lambda function
AWS_PROFILE=experience-developer aws lambda invoke \
  --function-name prismic-snapshot \
  --payload '{}' \
  response.json

# Check the response
cat response.json
```

### Checking S3 Backups

```bash
# List document snapshots
AWS_PROFILE=experience-developer aws s3 ls s3://wellcomecollection-prismic-backups/snapshots/

# List asset inventory files
AWS_PROFILE=experience-developer aws s3 ls s3://wellcomecollection-prismic-backups/media-library/

# List asset files
AWS_PROFILE=experience-developer aws s3 ls s3://wellcomecollection-prismic-backups/media-library/files/

# Check latest asset tracking file
AWS_PROFILE=experience-developer aws s3 cp s3://wellcomecollection-prismic-backups/media-library/latest-assets.json - | jq .

# Download latest snapshot
AWS_PROFILE=experience-developer aws s3 cp s3://wellcomecollection-prismic-backups/snapshots/ ./snapshots/ --recursive

# Download specific asset
AWS_PROFILE=experience-developer aws s3 cp s3://wellcomecollection-prismic-backups/media-library/files/{asset-id}.jpg ./
```

### Manual Step Functions Execution

```bash
# Start asset backup manually
AWS_PROFILE=experience-developer aws stepfunctions start-execution \
  --state-machine-arn $(terraform output -raw assets_backup_state_machine_arn) \
  --input '{}'

# Check execution status
AWS_PROFILE=experience-developer aws stepfunctions describe-execution \
  --execution-arn <execution-arn-from-above>
```

## Monitoring

### CloudWatch Logs

```bash
# Check recent logs
AWS_PROFILE=experience-developer aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/prismic-snapshot"

# Follow logs in real-time
AWS_PROFILE=experience-developer aws logs tail /aws/lambda/prismic-snapshot --follow
```

### CloudWatch Alarms

There are CloudWatch alarms to monitor Lambda function health:

#### Where to Find Alarms

1. **AWS Console** > **CloudWatch** > **Alarms**
2. Look for alarms named:
   - `prismic-snapshot-errors`
   - `prismic-snapshot-duration-warning`
   - `prismic-snapshot-missing-invocations`

#### Alarm Details

| Alarm Name                             | Triggers When                  | Purpose                                               |
| -------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| `prismic-snapshot-errors`              | Any unhandled exception occurs | Catch Lambda failures immediately                     |
| `prismic-snapshot-duration-warning`    | Execution takes >12 minutes    | Early warning before reaching the 15min timeout limit |
| `prismic-snapshot-missing-invocations` | No invocations in 24 hours     | Detect if scheduled job stops running                 |

#### Notifications

**Slack Integration**: All alarms automatically post to the **#wc-platform-alerts** Slack channel via the platform chatbot.

**Manual Checking**:

```bash
# Check alarm status via CLI
AWS_PROFILE=experience-developer aws cloudwatch describe-alarms --alarm-names "prismic-snapshot-errors" "prismic-snapshot-duration-warning" "prismic-snapshot-missing-invocations"

# Get alarm history
AWS_PROFILE=experience-developer aws cloudwatch describe-alarm-history --alarm-name "prismic-snapshot-errors"
```

## Cleanup/Destruction\*\*

To completely remove all infrastructure:

```bash
cd infrastructure/prismic-snapshots

# Review what will be destroyed
terraform plan -destroy

# Destroy all resources
terraform destroy
```

**⚠️ Warning**: This will delete all snapshots and cannot be undone!
