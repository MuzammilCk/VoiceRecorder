/**
 * Network Monitor Utility
 * Monitors network status and notifies subscribers of changes
 */

export class NetworkMonitor {
    private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
    private listeners: ((online: boolean) => void)[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline);
            window.addEventListener('offline', this.handleOffline);
        }
    }

    private handleOnline = () => {
        this.isOnline = true;
        this.notifyListeners();
    };

    private handleOffline = () => {
        this.isOnline = false;
        this.notifyListeners();
    };

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.isOnline));
    }

    /**
     * Subscribe to network status changes
     * @param listener Callback function that receives online status
     * @returns Unsubscribe function
     */
    subscribe(listener: (online: boolean) => void): () => void {
        this.listeners.push(listener);
        // Immediately notify with current status
        listener(this.isOnline);

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Get current network status
     * @returns true if online, false if offline
     */
    getStatus(): boolean {
        return this.isOnline;
    }

    /**
     * Cleanup event listeners
     */
    cleanup() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
        }
        this.listeners = [];
    }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();
