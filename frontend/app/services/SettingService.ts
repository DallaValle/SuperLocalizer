import { HttpClient } from '../utils/HttpClient';

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

        return HttpClient.postFormData<string>(url, formData);
    }

    /**
     * Download/export a localization file
     * @param language The target language to export (e.g., 'en', 'de-CH', 'fr')
     * @returns Promise<Blob> The file data as a blob
     */
    async exportFile(language: string): Promise<Blob> {
        const url = `${this.endpointDownload()}?language=${encodeURIComponent(language)}`;

        return HttpClient.download(url, { method: 'POST' });
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