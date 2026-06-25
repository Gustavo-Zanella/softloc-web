export interface DashboardMetrics {
  contractsThisMonth: number;
  revenueThisMonth: number;
  overdueReturns: number;
  topProducts: {
    productId: string;
    productName: string;
    count: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    contracts: number;
  }[];
  contractsByStatus: {
    status: string;
    count: number;
  }[];
}
