/**
 * Receipts API - Receipt upload and OCR management
 */
import { ApiClient } from './client';
import type {
  ReceiptResponse,
  ReceiptUploadResponse,
  ReceiptDownloadResponse,
  ReceiptOcrData,
} from './types';

export class ReceiptsApi extends ApiClient {
  async uploadReceipt(
    businessId: string,
    transactionId: string,
    file: File,
    runOcr: boolean = false
  ): Promise<ReceiptUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (runOcr) {
      formData.append('run_ocr', 'true');
    }
    return this.uploadRequest<ReceiptUploadResponse>(
      `/businesses/${businessId}/transactions/${transactionId}/receipts`,
      formData
    );
  }

  async listReceipts(businessId: string, transactionId: string): Promise<ReceiptResponse[]> {
    return this.request<ReceiptResponse[]>(
      `/businesses/${businessId}/transactions/${transactionId}/receipts`
    );
  }

  // Alias for backward compatibility
  async list(businessId: string, transactionId: string): Promise<ReceiptResponse[]> {
    return this.listReceipts(businessId, transactionId);
  }

  async getReceipt(businessId: string, receiptId: string): Promise<ReceiptResponse> {
    return this.request<ReceiptResponse>(`/businesses/${businessId}/receipts/${receiptId}`);
  }

  // Alias for backward compatibility
  async get(businessId: string, receiptId: string): Promise<ReceiptResponse> {
    return this.getReceipt(businessId, receiptId);
  }

  async deleteReceipt(businessId: string, receiptId: string): Promise<void> {
    await this.request<Record<string, never>>(
      `/businesses/${businessId}/receipts/${receiptId}`,
      { method: 'DELETE' }
    );
  }

  // Alias for backward compatibility
  async delete(businessId: string, receiptId: string): Promise<void> {
    return this.deleteReceipt(businessId, receiptId);
  }

  async getReceiptDownloadUrl(
    businessId: string,
    receiptId: string
  ): Promise<ReceiptDownloadResponse> {
    return this.request<ReceiptDownloadResponse>(
      `/businesses/${businessId}/receipts/${receiptId}/download`
    );
  }

  // Alias for backward compatibility
  async getDownloadUrl(businessId: string, receiptId: string): Promise<ReceiptDownloadResponse> {
    return this.getReceiptDownloadUrl(businessId, receiptId);
  }

  async uploadBillReceipt(
    businessId: string,
    billId: string,
    file: File,
    runOcr: boolean = false
  ): Promise<ReceiptUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (runOcr) {
      formData.append('run_ocr', 'true');
    }
    return this.uploadRequest<ReceiptUploadResponse>(
      `/businesses/${businessId}/bills/${billId}/receipts`,
      formData
    );
  }

  async listBillReceipts(businessId: string, billId: string): Promise<ReceiptResponse[]> {
    return this.request<ReceiptResponse[]>(
      `/businesses/${businessId}/bills/${billId}/receipts`
    );
  }

  async extractOcr(file: File, businessId: string): Promise<{ ocr_data: ReceiptOcrData | null }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.uploadRequest<{ ocr_data: ReceiptOcrData | null }>(
      `/businesses/${businessId}/receipts/extract-ocr`,
      formData
    );
  }
}
