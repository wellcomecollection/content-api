# Prismic Webhook

This is a Lambda which expects to live at a [Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) which is configured as a webhook in Prismic.

It receives Webhook events, checks that they are valid and contain a specified secret, and then forwards them to an EventBridge bus.

We configure one of these Lambdas with a webhook that runs on document unpublish, and the events are subscribed to by an "unpublisher" Lambda in each pipeline stack.

Unfortunately we can't configure Prismic webhooks programmatically, so the process is documented here. It shouldn't need to happen often/ever!

## Configuring the unpublish webhook

1. Apply the Terraform in `infrastructure`: there will be 2 outputs, `webhook_secret_name` and `webhook_url`. Note these down.
2. In the Prismic dashboard, go to settings (gear icon in the bottom left) and then to "Webhooks". Create a new webhook.
3. Configure the webhook as follows:
  
    - _Name_: whatever you want, eg ("document unpublish")
    - _URL_: the value of `webhook_url` from the Terraform output
    - _Secret_: the value of the secret with the name from `webhook_secret_name`; you'll be able to find this in Secrets Manager in the AWS console (in the catalogue account).
    - _Custom Headers_: add a new header with name `x-weco-prismic-trigger` and value `document-unpublish`. Make sure you click the "add" button after entering these details!
    - _Triggers_: "A document is unpublished" only.
