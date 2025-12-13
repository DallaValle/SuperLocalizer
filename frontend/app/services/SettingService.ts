import { HttpClient } from '../utils/HttpClient';
import { SnapshotItem } from '../types/domain';

/**
 * Service for managing import/export operations for localization files
 */
export class SettingService {
    private readonly projectId: string;

    constructor(projectId: string) {
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
     * Download/export multiple localization files
     * @param languages Array of language codes to export
     * @returns Promise<Array<{language: string, blob: Blob}>> Array of exported files
     */
    async exportFiles(languages: string[]): Promise<Array<{ language: string, blob: Blob }>> {
        const exports = await Promise.all(
            languages.map(async (language) => {
                const blob = await this.exportFile(language);
                return { language, blob };
            })
        );
        return exports;
    }

    /**
     * Save a snapshot of the current project state
     * @returns Promise<string> Success message
     */
    async saveSnapshot(): Promise<string> {
        return HttpClient.post<string>(this.endpointSnapshot());
    }

    /**
     * Get snapshots for the project
     * @param limit Maximum number of snapshots to retrieve
     * @returns Promise<SnapshotItem[]> List of snapshots
     */
    async getSnapshots(limit: number = 10): Promise<SnapshotItem[]> {
        const url = `${this.endpointSnapshot()}s?limit=${encodeURIComponent(limit)}`;
        return HttpClient.get<SnapshotItem[]>(url);
    }

    /**
     * Rollback to a specific snapshot
     * @param snapshotId The ID of the snapshot to rollback to
     * @returns Promise<string> Success message
     */
    async rollbackToSnapshot(snapshotId: string): Promise<string> {
        const url = `${this.endpointSnapshot()}/rollback/${encodeURIComponent(snapshotId)}`;
        return HttpClient.post<string>(url);
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