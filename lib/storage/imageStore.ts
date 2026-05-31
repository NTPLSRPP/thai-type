import { get, set, del } from "idb-keyval";

const PREFIX = "thaitype:img:";

export async function putImage(id: string, blob: Blob): Promise<void> {
  await set(PREFIX + id, blob);
}

export async function getImage(id: string): Promise<Blob | undefined> {
  return (await get(PREFIX + id)) as Blob | undefined;
}

export async function deleteImage(id: string): Promise<void> {
  await del(PREFIX + id);
}
