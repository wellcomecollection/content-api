output "url" {
  value = aws_lambda_function_url.webhook.function_url
}

output "unpublish_event_bus" {
  value = aws_cloudwatch_event_bus.document_unpublish_events
}

output "secret_name" {
  value = ""
}
