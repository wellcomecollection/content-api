# Prismic Snapshots

This S3 bucket contains automated daily backups of the Wellcome Collection Prismic content repository.

The `/snapshots` prefix contains complete exports of all content from our Prismic CMS in JSON format.  
The `/media-library` prefix contains all the digital assets hosted in our Prismic CMS, such as images, files and videos. TO DO: also has the latest list of assets? with timestamp?

## File naming convention

#### Snapshots files are named with the Prismic ref and an ISO 8601 timestamp:

```
snapshots/prismic-snapshot-<prismic-ref>-YYYY-MM-DDTHH-MM-SSZ.json
```

For example: `snapshots/prismic-snapshot-ref123-2025-11-03T23-00-00Z.json`

#### Media libray backups are named with their Prismic id:

```
media-library/prismic_asset_id
```

For example: `media-library/dfsfgD57gffg£$TFa`  
We only keep one version of each asset, ie. the lastest version downloaded from Prismic.

## File format

Each snapshot is a JSON file containing the complete Prismic repository export as returned by the Prismic API. The structure includes:

- `results`: Array of all documents
- `total_results_size`: Total number of documents
- `total_pages`: Number of pages in the export
- Various metadata fields

TO DO: add format of the asset list we get from Prismic API

## Backup schedule

Snapshots are created automatically every day at 11:00 PM UTC by an AWS Lambda function.
Media library is backed up every day at 11:00 PM UTC by an AWS State Machine

## Purpose

These backups serve as:

- **Disaster recovery**: Complete content restoration capability
- **Historical archive**: Point-in-time content snapshots
- **Content analysis**: Data for understanding content evolution
- **Migration support**: Source data for potential CMS migrations

## Retention

Snapshots are retained for 14 days.
Assets do not expire.

## Access

To download a snapshot (use the Prismic ref or a wildcard):

```bash
# exact file
aws s3 cp s3://wellcomecollection-prismic-backups/snapshots/prismic-snapshot-masterref123-2025-11-03T23-00-00Z.json .

# or using a wildcard for the timestamp/ref
aws s3 cp s3://wellcomecollection-prismic-backups/snapshots/ . --recursive
```

To list all available snapshots:

```bash
aws s3 ls s3://wellcomecollection-prismic-backups/snapshots/
```

## Related documentation

- Main project README: [infrastructure/prismic-snapshots/README.md](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/prismic-snapshots/README.md)
- Lambdas source code: [infrastructure/prismic-snapshots/lambda/](https://github.com/wellcomecollection/content-api/tree/main/infrastructure/prismic-snapshots/lambda)
- Terraform infrastructure: [infrastructure/prismic-snapshots](https://github.com/wellcomecollection/content-api/blob/main/infrastructure/prismic-snapshots)
