output "url" {
  value = aws_lambda_function_url.webhook.function_url
}

output "unpublish_event_rule" {
  value = aws_cloudwatch_event_rule.document_unpublish_events
}

output "secret_name" {
  value = local.webhook_secret_name
}
