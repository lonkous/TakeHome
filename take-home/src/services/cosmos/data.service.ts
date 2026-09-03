import { getDataContainer, handleCosmosError } from "./config";
import type { TData } from "@/schemas/data.schema";

type CosmosData = Omit<TData, "id"> & { id: string };

function toCosmosItem(data: TData): CosmosData {
  return { ...data, id: String(data.id) };
}

function fromCosmosItem(item: CosmosData): TData {
  return { ...item, id: Number(item.id) };
}

export async function getDataById(id: number): Promise<TData | null> {
  try {
    const container = getDataContainer();
    const idStr = String(id);
    const { resource, statusCode } = await container
      .item(idStr, id)
      .read<CosmosData>();

    if (statusCode === 404 || !resource) {
      return null;
    }
    return fromCosmosItem(resource);
  } catch (error: unknown) {
    return handleCosmosError(error);
  }
}

export async function getAllData(): Promise<TData[]> {
  try {
    const container = getDataContainer();
    const { resources } = await container.items
      .readAll<CosmosData>()
      .fetchAll();
    return resources.map(fromCosmosItem);
  } catch (error: unknown) {
    return handleCosmosError(error);
  }
}

export async function createData(data: TData): Promise<TData> {
  try {
    const container = getDataContainer();
    const { resource } = await container.items.create<CosmosData>(
      toCosmosItem(data),
    );
    if (!resource) throw new Error("Failed to create data");
    return fromCosmosItem(resource);
  } catch (error: unknown) {
    return handleCosmosError(error);
  }
}

export async function upsertData(data: TData): Promise<TData> {
  try {
    const container = getDataContainer();
    const { resource } = await container.items.upsert<CosmosData>(
      toCosmosItem(data),
    );
    if (!resource) throw new Error("Failed to upsert data");
    return fromCosmosItem(resource);
  } catch (error: unknown) {
    return handleCosmosError(error);
  }
}

export async function deleteData(id: number): Promise<void> {
  try {
    const container = getDataContainer();
    await container.item(String(id), id).delete();
  } catch (error: unknown) {
    return handleCosmosError(error);
  }
}
