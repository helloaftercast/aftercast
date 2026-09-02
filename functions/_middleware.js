export async function onRequest(context) {
  var country =
    (context.request.cf && context.request.cf.country) ||
    context.request.headers.get("CF-IPCountry") ||
    "";
  if (country === "CN") {
    return new Response("Not available in your region.", {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
  return context.next();
}
