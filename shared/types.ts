export interface PlatformStats {
  totalBorrowers: number;
  totalLenders: number;
  totalInvestors: number;
  activeLoans: number;
  serverStatus: 'online' | 'offline' | 'maintenance';
  lastUpdated: string;
}

export interface OnlineUsersResponse {
  onlineUsers: number;
  lastUpdated: string;
}