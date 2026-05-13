import httpClient from './httpClient';
import type { FileInfo } from '../types';

export async function initUpload(filename: string): Promise<{ file_id: string; upload_url: string }> {
  const telegramId = localStorage.getItem('telegram_id');
  if (!telegramId) {
    throw new Error('Telegram ID not found');
  }
  const response = await httpClient.post('/files/init-upload', {
    uploadedBy: telegramId,
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

export function getFileUrl(id: string): string {
  const baseUrl = import.meta.env.VITE_API_URL as string || 'http://localhost';
  return `${baseUrl}/files/${id}/download`;
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
