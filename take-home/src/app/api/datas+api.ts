import { initializeCosmosDB } from "@/services/cosmos/config";
import { getAllData } from "@/services/cosmos/data.service";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initializeCosmosDB();
    initialized = true;
  }
}

async function verifyBearerToken(
  request: Request,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const header =
    request.headers.get("authorization") ??
    request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return {
      ok: false,
      status: 401,
      message: "Missing or malformed Authorization header",
    };
  }
  const token = header.slice(7).trim();
  if (!token) {
    return { ok: false, status: 401, message: "Missing token" };
  }
  try {
    const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!graphRes.ok) {
      return { ok: false, status: 401, message: "Invalid or expired token" };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 401, message: "Token validation failed" };
  }
}

export async function GET(request: Request) {
  const auth = await verifyBearerToken(request);
  if (!auth.ok) {
    return Response.json({ error: auth.message }, { status: auth.status });
  }

  try {
    await ensureInitialized();
    const datas = await getAllData();
    return Response.json(datas);
  } catch (error: unknown) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch datas",
      },
      { status: 500 },
    );
  }
}
