/**
 * QuickBooks Import API - QuickBooks data import
 */
import { ApiClient } from './client';
import type {
  QbImportParseResponse,
  QbImportConfirmRequest,
  QbImportConfirmResponse,
} from './types';

export class QuickBooksApi extends ApiClient {
  async parseQuickBooksImport(
    businessId: string,
    files: Record<string, File>
  ): Promise<QbImportParseResponse> {
    const formData = new FormData();
    for (const [key, file] of Object.entries(files)) {
      formData.append(key, file);
    }
    return this.uploadRequest<QbImportParseResponse>(
      `/businesses/${businessId}/quickbooks/import/parse`,
      formData
    );
  }

  async confirmQuickBooksImport(
    businessId: string,
    data: QbImportConfirmRequest
  ): Promise<QbImportConfirmResponse> {
    return this.request<QbImportConfirmResponse>(
      `/businesses/${businessId}/quickbooks/import/confirm`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }
}
