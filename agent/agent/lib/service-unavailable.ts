export function serviceUnavailable(service: string, operation: string) {
  return {
    status: "unavailable",
    service,
    operation,
    message: `The ${service} service is not connected.`,
  };
}
