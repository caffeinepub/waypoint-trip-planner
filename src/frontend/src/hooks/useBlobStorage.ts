import { HttpAgent } from "@icp-sdk/core/agent";
import { useRef, useState } from "react";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";

// Load config from the environment - these are injected at build time
const BACKEND_HOST =
  (import.meta as any).env?.VITE_BACKEND_HOST || "https://icp-api.io";
const CANISTER_ID = (import.meta as any).env?.VITE_CANISTER_ID_BACKEND || "";
const PROJECT_ID = (import.meta as any).env?.VITE_PROJECT_ID || "";
const STORAGE_GATEWAY_URL =
  (import.meta as any).env?.VITE_STORAGE_GATEWAY_URL || "";
const IS_LOCAL = (import.meta as any).env?.VITE_DFX_NETWORK === "local";

async function createStorageClient(): Promise<StorageClient> {
  const agent = await HttpAgent.create({
    host: IS_LOCAL ? "http://localhost:4943" : BACKEND_HOST,
  });

  if (IS_LOCAL) {
    await agent.fetchRootKey().catch(() => {});
  }

  return new StorageClient(
    "media",
    STORAGE_GATEWAY_URL || "https://storage.caffeine.ai",
    CANISTER_ID,
    PROJECT_ID,
    agent,
  );
}

export interface UploadResult {
  blobId: string;
  directUrl: string;
}

export function useBlobStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const clientRef = useRef<StorageClient | null>(null);

  const getClient = async (): Promise<StorageClient> => {
    if (!clientRef.current) {
      clientRef.current = await createStorageClient();
    }
    return clientRef.current;
  };

  const upload = async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);

    try {
      const client = await getClient();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(bytes, (pct) => setProgress(pct));
      const directUrl = await client.getDirectURL(hash);

      return { blobId: hash, directUrl };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const getDirectUrl = async (blobId: string): Promise<string> => {
    const client = await getClient();
    return client.getDirectURL(blobId);
  };

  return { upload, getDirectUrl, uploading, progress };
}
