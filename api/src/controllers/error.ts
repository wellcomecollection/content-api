import { ErrorRequestHandler } from "express";
import log from "@weco/content-common/services/logging";

export type ErrorResponse = {
  type: "Error";
  httpStatus: number;
  label: string;
  description?: string;
  errorType: "http";
};

export class HttpError extends Error {
  public readonly status: number;
  public readonly label: string;
  public readonly description?: string;

  constructor({
    status,
    label,
    description,
  }: {
    status: number;
    label: string;
    description?: string;
  }) {
    super(`${label}: ${description}`);
    Object.setPrototypeOf(this, HttpError.prototype);

    this.status = status;
    this.label = label;
    this.description = description;
  }

  get responseJson(): ErrorResponse {
    return {
      type: "Error",
      httpStatus: this.status,
      label: this.label,
      description: this.description,
      errorType: "http",
    };
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json(err.responseJson);
  } else {
    // Log this to prevent it getting swallowed
    log.error(err);
    // if (apm.isStarted()) {
    //   apm.captureError(err);
    // }
    const httpError = new HttpError({
      status: 500,
      label: "Server Error",
    });
    res.status(httpError.status).json(httpError.responseJson);
  }
};
