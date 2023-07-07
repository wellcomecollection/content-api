import { APIGatewayProxyResultV2 } from "aws-lambda/trigger/api-gateway-proxy";

export const response = ({
  status,
  label,
  description,
}: {
  status: number;
  label: string;
  description?: string;
}): APIGatewayProxyResultV2 => ({
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
});
