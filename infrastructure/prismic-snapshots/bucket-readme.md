# Prismic backups

This S3 bucket contains automated daily backups of the Wellcome Collection Prismic content repository.

The `/snapshots` prefix contains complete exports of all content from our Prismic CMS in JSON format.

The `/media-library` prefix contains data related to digital assets hosted in our Prismic CMS:

- the `latest-asset-snapshot-metadata.json` file contains information about the most recent successful run of asset backup: the filename of the most recent list of assets (eg. `prismic-assets-2026-01-04T23:00:53.674Z.json`) and the time the last successful fetch started (eg. `1767567642255`)
- the `latest-batches.json` file contains batches of assets to backup. It is used in the `BackupDownload` step of the [assets_backup state machine](./assets_backup_state_machine.tf)
- the `assets` prefix contains all the digital assets hosted in our Prismic CMS, such as images, files and videos.

`latest-asset-snapshot-metadata.json` and `latest-batches.json` are overwritten every time the state machine runs.

## File naming convention

#### Snapshots files are named with the Prismic ref and an ISO 8601 timestamp:

```
snapshots/prismic-snapshot-<prismic-ref>-YYYY-MM-DDTHH-MM-SSZ.json
```

For example: `snapshots/prismic-snapshot-ref123-2025-11-03T23-00-00Z.json`

#### Media libray backups are named with their Prismic id and filename:

```
media-library/assets/<prismic_asset_id>-<filename>
```

For example: `media-library/assets/dfsfgD57gffg£$TFa-some_digital_file.png`

We only keep one version of each asset, ie. the lastest version downloaded from Prismic.

## File format

Each snapshot is a JSON file containing a list of all the Prismic documents. It is the value of the `results` in the complete Prismic repository export as returned by the Prismic API.

Each `media-library/prismic-assets-<date>.json` file contains the complete list of digital assets hosted in Prismic at the given date, eg.:

```
{
  "id": "ZoQE4h5LeNNTwtnO",
  "url": "https://images.prismic.io/wellcomecollection/ZoQE4h5LeNNTwtnO_PoeticUnity.jpg?auto=format,compress",
  "filename": "Poetic Unity.jpg",
  "size": 8066890,
  "width": 4000,
  "height": 2250,
  "last_modified": 1720092571453,
  "kind": "image",
  "extension": "jpg",
  "notes": "reimagining your world",
  "credits": "Reimagining Our World. Artwork: Jess Thom. Portraits: Steven Pocock | | Wellcome Collection | | CC-BY-NC | |",
  "alt": "Photographic and digital artwork showing a young person pointing into the air against a pink background. Floating above their finger is a colourful drawing of a world, connect by lines to a speak bubble, a microphone, a pencil.",
  "uploader_id": "ghost",
  "created_at": 1719928035057,
  "tags": []
}
```

`latest-asset-snapshot-metadata.json` contain information about the latest backup run

```json
{
  "filename": "prismic-assets-2025-12-01T12-00-00Z.json",
  "fetch_started_at": 1733054400000
}
```

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

The `prismic-assets` lists are retained for 14 days. Assets do not expire.

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
