# Step Functions State Machine for assets backup
resource "aws_sfn_state_machine" "assets_backup" {
  name     = "prismic-assets-backup"
  role_arn = aws_iam_role.assets_backup_state_machine_role.arn

  definition = jsonencode({
    Comment = "State machine to trigger backup and download Prismic assets"
    StartAt = "BackupTrigger"
    States = {
      BackupTrigger = {
        Type     = "Task"
        Resource = aws_lambda_function.prismic_backup_trigger.arn
        Comment  = "Returns batched assets: {items: [[batch1], [batch2], ...]}"
        Next     = "BackupDownload"
      }
      BackupDownload = {
        Type           = "Map"
        Comment        = "Processes each batch in parallel (max 10 concurrent batches)"
        ItemsPath      = "$.items"
        MaxConcurrency = 10
        Iterator = {
          StartAt = "DownloadAssets"
          States = {
            DownloadAssets = {
              Type     = "Task"
              Resource = aws_lambda_function.prismic_backup_download.arn
              End      = true
            }
          }
        }
        Next = "Success"
      },
      Success = {
        Type = "Succeed"
      }
    }
  })
}

resource "aws_iam_role_policy_attachment" "assets_backup_state_machine_policy" {
  role       = aws_iam_role.assets_backup_state_machine_role.name
  policy_arn = aws_iam_policy.assets_backup_state_machine_policy.arn
}
