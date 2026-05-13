import httpClient from './httpClient';
import type { FileInfo } from '../types';

/**
 * Extract telegram user id from Telegram.WebApp.initData.
 * initData is a query-string with a `user` parameter that contains
 * a URL-encoded JSON object.
 */
function getTelegramIdFromInitData(): string | null {
  try {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return null;
    const params = new URLSearchParams(initData);
    const user = params.get('user');
    if (!user) return null;
    const parsed = JSON.parse(user);
    return String(parsed.id);
  } catch {
    return null;
  }
}

export async function initUpload(filename: string): Promise<{ file_id: string; upload_url: string }> {
  const uploadedBy = getTelegramIdFromInitData();
  if (!uploadedBy) {
    throw new Error('Telegram ID not found in initData');
  }
  const response = await httpClient.post('/files/init-upload', {
    uploadedBy,
    filename,
  });
  return {
    file_id: response.data.fileId,
    upload_url: response.data.uploadUrl,
  };
}

function toFileInfo(data: any): FileInfo {
  return {
    id: data.id,
    extension: data.extension,
    filename: data.filename,
    uploaded_by: data.uploadedBy ?? data.uploaded_by,
    created_at: data.createdAt ?? data.created_at,
  };
}

export async function getFileMeta(id: string): Promise<FileInfo> {
  const response = await httpClient.get(`/files/${id}/meta`);
  return toFileInfo(response.data);
}

/**
 * POST /files/{id}/confirm-upload -> FileInfo
 *
 * Confirms that a file upload is complete and returns the file metadata.
 */
export async function confirmUpload(fileId: string): Promise<FileInfo> {
  const response = await httpClient.post(`/files/${fileId}/confirm-upload`);
  return toFileInfo(response.data);
}

/**
 * Synchronous helper — returns a constructed download URL without making an HTTP request.
 * Useful for direct use in href attributes (mock/dev mode).
 *
 * In production, the actual serving URL path should be routed through nginx
 * or an S3 signed URL obtained via getFileDownloadUrl().
 */
export function getFileUrl(id: string): string {
  const baseUrl = import.meta.env.VITE_API_URL as string || 'http://localhost';
  return `${baseUrl}/files/download/${id}`;
}

/**
 * Async version — fetches file metadata first to verify the file exists and is uploaded,
 * then returns the download URL.
 *
 * Throws if the file metadata indicates the file is not uploaded.
 */
export async function getFileDownloadUrl(fileId: string): Promise<string> {
  const meta = await getFileMeta(fileId);
  const baseUrl = import.meta.env.VITE_API_URL as string || 'http://localhost';
  return `${baseUrl}/files/download/${meta.id}`;
}

export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
