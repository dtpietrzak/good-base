type TimeoutWrapperProps = {
  request: Request;
  requestHandler: (request: Request) => Promise<Response>;
  timeoutSeconds: number;
}

export const timeoutWrapper = async (props: TimeoutWrapperProps) => {
  // Create timeout promise
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Request timeout after ${props.timeoutSeconds} seconds`,
        ),
      );
    }, props.timeoutSeconds * 1000);
  });

  try {
    // Race between request handling and timeout
    return await Promise.race([
      props.requestHandler(props.request),
      timeoutPromise,
    ]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it's a timeout error
    if (errorMessage.includes("timeout")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Request timeout",
          info:
            `Request took longer than ${props.timeoutSeconds} seconds`,
        }),
        {
          status: 408, // Request Timeout
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      );
    }

    // Re-throw other errors
    throw error;
  }
};
