export async function loader() {
  const body = JSON.stringify({
    message: "Hello, world",
    timestamp: new Date().toISOString(),
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
