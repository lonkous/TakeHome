import { initializeCosmosDB } from "@/services/cosmos/config";
import { getAllData } from "@/services/cosmos/data.service";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initializeCosmosDB();
    initialized = true;
  }
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();
    const datas = await getAllData();
    return Response.json(datas);
  } catch (error: any) {
    return Response.json(
      { error: error.message ?? "Failed to fetch datas" },
      { status: 500 },
    );
  }
}
