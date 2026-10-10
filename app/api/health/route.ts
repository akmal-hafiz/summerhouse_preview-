export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { status: "ok" },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
