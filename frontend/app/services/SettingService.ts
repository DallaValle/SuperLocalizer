import { HttpClient } from '../utils/HttpClient';
import { API_CONFIG } from '../types/api';

/**
 * Service for managing import/export operations for localization files
 */
export class SettingService {
    private readonly projectId: number;

    constructor(projectId: number) {
        this.projectId = projectId;
    }

    private endpointUpload(): string {
        return `/project/${encodeURIComponent(this.projectId)}/setting/upload`;
    }

    private endpointDownload(): string {
        return `/project/${encodeURIComponent(this.projectId)}/setting/download`;
    }

    private endpointSnapshot(): string {
        return `/project/${encodeURIComponent(this.projectId)}/setting/snapshot`;
    }

    /**
     * Upload a localization file for import
     * @param file The localization file to upload
     * @param language The language code for the file (e.g., 'en', 'de-CH', 'fr')
     * @returns Promise<string> Success message
     */
    async importFile(file: File, language: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.endpointUpload()}?language=${encodeURIComponent(language)}`;

        // Use direct fetch for file upload since HttpClient doesn't handle FormData properly
        const token = localStorage.getItem('auth-token');
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Import failed: ${response.statusText}`);
        }

        return response.text();
    }

    /**
     * Download/export a localization file
     * @param language The target language to export (e.g., 'en', 'de-CH', 'fr')
     * @returns Promise<Blob> The file data as a blob
     */
    async exportFile(language: string): Promise<Blob> {
        const url = `${this.endpointDownload()}?targetLanguage=${encodeURIComponent(language)}`;

        const token = localStorage.getItem('auth-token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.statusText}`);
        }

        return response.blob();
    }

    /**
     * Save a snapshot of the current project state
     * @returns Promise<string> Success message
     */
    async saveSnapshot(): Promise<string> {
        return HttpClient.post<string>(this.endpointSnapshot());
    }

    /**
     * Download a file blob with a given filename
     * @param blob The file blob to download
     * @param filename The name for the downloaded file
     */
    static downloadBlob(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}