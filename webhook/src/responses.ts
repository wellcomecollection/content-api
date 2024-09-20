import { APIGatewayProxyResultV2 } from "aws-lambda/trigger/api-gateway-proxy";

import log from "@weco/content-common/services/logging";

export const response = ({
  status,
  label,
  description,
}: {
  status: number;
  label: string;
  description?: string;
}): APIGatewayProxyResultV2 => {
  log.info("Response: ");
  log.info(JSON.stringify({ status, label, description }), null, 2);
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "Error",
      errorType: "http",
      httpStatus: status,
      label,
      description,
    }),
  };
};
