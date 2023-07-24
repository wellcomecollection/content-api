resource "aws_cloudwatch_event_bus" "document_unpublish_events" {
  name = "prismic-document-unpublish-events"
}

resource "aws_cloudwatch_event_rule" "document_unpublish_events" {
  name           = "prismic-document-unpublish-events"
  description    = "Webhook events from Prismic triggered by document unpublish"
  event_bus_name = aws_cloudwatch_event_bus.document_unpublish_events.name
  event_pattern = jsonencode({
    detail-type : [local.event_trigger]
  })
}
