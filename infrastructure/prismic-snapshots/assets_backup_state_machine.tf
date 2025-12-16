# Step Functions State Machine for assets backup
resource "aws_sfn_state_machine" "assets_backup" {
  name     = "prismic-assets-backup"
  role_arn = aws_iam_role.assets_backup_state_machine_role.arn
  
  definition = jsonencode({
    Comment       = "State machine to trigger backup and download Prismic assets"
    StartAt       = "BackupTrigger"
    States = {
      BackupTrigger = {
        Type     = "Task"
        Resource = aws_lambda_function.prismic_backup_trigger.arn
        Comment  = "Generates asset list and uploads to S3, returns S3 location"
        Next     = "BackupDownload"
      }
      BackupDownload = {
        Type           = "Map"
        ItemReader = {
          Resource = "arn:aws:states:::s3:getObject"
          ReaderConfig = {
            InputType = "JSON"
          }
          Parameters = {
            "Bucket.$" = "$.bucket"
            "Key.$"    = "$.key"
          }
        }
        MaxConcurrency = 10
        ItemProcessor = {
          ProcessorConfig = {
            Mode = "DISTRIBUTED"
            ExecutionType = "STANDARD"
          }
          StartAt = "DownloadAssets"
          States = {
            DownloadAssets = {
              Type     = "Task"
              Resource = aws_lambda_function.prismic_backup_download.arn
              Catch = [
                {
                  ErrorEquals = ["States.ALL"]
                  ResultPath  = "$.error"
                  Next        = "HandleError"
                }
              ]
              End = true
            }
            HandleError = {
              Type = "Pass"
              Parameters = {
                "error.$"       = "$.error"
                "input.$"       = "$"
                errorHandled    = true
              }
              End = true
            }
          }
        }
        Next = "Success"
      }
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
resource "aws_iam_role_policy_attachment" "assets_backup_state_machine_s3_policy" {
  role       = aws_iam_role.assets_backup_state_machine_role.name
  policy_arn = aws_iam_policy.lambda_s3_policy.arn
}