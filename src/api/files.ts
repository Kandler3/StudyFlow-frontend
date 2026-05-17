import httpClient from './httpClient';
import { getAuthHeader } from './authHeader';
import type { FileInfo } from '../types';

export async function initUpload(uploadedBy: string, filename: string): Promise<{ file_id: string; upload_url: string }> {
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

export async function uploadFile(uploadUrl: string, file: File): Promise<void> {
  const authHeader = getAuthHeader();
  const headers: Record<string, string> = {
    'Content-Type': file.type || 'application/octet-stream',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers,
  });
  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
