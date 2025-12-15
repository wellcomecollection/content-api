# Prismic Snapshots - Infrastructure

This directory contains Terraform infrastructure for daily Prismic content snapshots and media library backups.

## Purpose

Maintains 14 days of rolling snapshots for all Prismic document content. Keep up-to-date copies of every digital asset held in Prismic (eg. images, files...).  
Snapshots and backups are generated at 11 PM UTC.

## File Structure

```
infrastructure/prismic-snapshots/
├── terraform.tf                      # Terraform version configuration, remote state
├── data.tf                           # Data sources (Prismic access token id)
├── s3.tf                             # S3 bucket for snapshots and backups
├── iam.tf                            # IAM roles and policies
├── lambda_snapshot.tf                # Prismic snapshot Lambda
├── lambda_backup_trigger.tf          # Media library backup trigger Lambda
├── lambda_backup_download.tf         # Media library download Lambda
├── assets_backup_state_machine.tf    # Step Functions for asset backups
├── schedulers.tf                     # EventBridge schedulers
├── cloudwatch_alarms.tf              # CloudWatch alarms for monitoring
├── outputs.tf                        # Terraform outputs
├── README.md                         # This file
├── bucket-readme.md                  # Documentation for S3 bucket contents
├── lambda/
│   ├── prismic-snapshot.js           # Prismic content snapshot Lambda code
│   ├── prismic-backup-trigger.js     # Media library backup trigger Lambda code
│   └── prismic-backup-download.js    # Media library backup download Lambda code
└── scripts/
    ├── build-lambda.sh               # Script to build Lambda packages with dependencies
    ├── deploy.sh                     # Full infrastructure deployment
    └── deploy-code.sh                # Code-only deployment script
```

## Architecture

### Prismic Content Snapshots

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ EventBridge     │───▶│ Lambda Function  │───▶│ S3 Bucket       │
│ (Daily 11 PM)   │    │ (Snapshot)       │    │ (Store + Clean) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │ CloudWatch Logs  │
                       │ (Monitoring)     │
                       └──────────────────┘
```

### Media Library Backups

```
┌─────────────────┐    ┌──────────────────────────────────────┐
│ EventBridge     │───▶│ Step Functions State Machine         │
│ (Daily 11 PM)   │    │                                      │
└─────────────────┘    │  ┌────────────────────────────────┐ │
                       │  │ 1. Trigger Lambda              │ │
                       │  │    (Get asset list)            │ │───┐
                       │  └────────────────────────────────┘ │   │
                       │                │                     │   │
                       │                ▼                     │   │
                       │  ┌────────────────────────────────┐ │   │
                       │  │ 2. Download Lambda (parallel)  │ │   │
                       │  │    (Download assets)           │ │───┤
                       │  └────────────────────────────────┘ │   │
                       └──────────────────────────────────────┘   │
                                                                   ▼
                                                         ┌─────────────────┐
                                                         │ S3 Bucket       │
                                                         │ (Store list     │
                                                         │ and assets)     │
                                                         └─────────────────┘
```

## Configuration

### Schedule

The snapshot and backup run daily at **11 PM UTC**. To change this, modify the relevant `schedule_expression` in `schedulers.tf`:

```hcl
// "prismic_snapshot_daily"
schedule_expression = "cron(0 23 * * ? *)" # 11 PM UTC daily

// "prismic_backup_daily"
schedule_expression = "cron(0 23 * * ? *)" # 11 PM UTC daily
```

### Retention

Snapshots are kept for **14 days**. To change this, modify the `days` in the lifecycle configuration in `main.tf`:

```hcl
expiration {
  days = 14  # Change this value
}
```

### Memory/Timeout

Snapshot lambda is configured with:

- **1GB memory**
- **15 minute timeout**

Adjust in `lambda_snapshot.tf` if needed based on Prismic content size.

## Storage

### S3 Bucket Location

**Bucket**: `wellcomecollection-prismic-backups`

### Filename Structure

Snapshots are stored with ISO 8601 timestamp filenames:

```
snapshots/prismic-snapshot-<prismic-ref>-YYYY-MM-DDTHH-MM-SSZ.json
```

**Examples**:

- `snapshots/prismic-snapshot-prismicMasterRef1-2025-11-03T23-00-15Z.json` (daily backup at 11 PM UTC)
- `snapshots/prismic-snapshot-prismicMasterRef2-2025-11-04T23-00-22Z.json` (next day's backup)

### File Content

Each snapshot contains the complete prismic repository content data for wellcomecollection.org in JSON format

## Deployment

### Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Terraform installed** (>= 0.12)
3. **Node.js and npm installed** (for building Lambda package)
4. **Prismic access token** stored in AWS Secrets Manager

N.B. The Prismic access token is already stored in AWS Secrets Manager as `prismic-model/prod/access-token` and is used by other services. You can verify it exists:

```bash
AWS_PROFILE=catalogue-developer aws secretsmanager describe-secret --secret-id "prismic-model/prod/access-token"
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
cd infrastructure/prismic-snapshots
./deploy-code.sh <lambda_name>
// eg. ./deploy-code.sh prismic-snapshot
```

## Testing

### Manual Lambda Invocation/Snapshot Creation

```bash
# Test the Lambda function
AWS_PROFILE=catalogue-developer aws lambda invoke \
  --function-name prismic-snapshot \
  --payload '{}' \
  response.json

# Check the response
cat response.json
```

### Checking S3 snapshots

```bash
# List all snapshots
AWS_PROFILE=catalogue-developer aws s3 ls s3://wellcomecollection-prismic-backups/snapshots/

# Download latest snapshot
AWS_PROFILE=catalogue-developer aws s3 cp s3://wellcomecollection-prismic-backups/snapshots/ ./snapshots/ --recursive
```

## Monitoring

### CloudWatch Logs

```bash
# Check recent logs
AWS_PROFILE=catalogue-developer aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/prismic-snapshot"

# Follow logs in real-time
AWS_PROFILE=catalogue-developer aws logs tail /aws/lambda/prismic-snapshot --follow
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
AWS_PROFILE=catalogue-developer aws cloudwatch describe-alarms --alarm-names "prismic-snapshot-errors" "prismic-snapshot-duration-warning" "prismic-snapshot-missing-invocations"

# Get alarm history
AWS_PROFILE=catalogue-developer aws cloudwatch describe-alarm-history --alarm-name "prismic-snapshot-errors"
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
