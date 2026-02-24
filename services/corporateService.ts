
import { ApprovalRequest, Booking, CorporatePolicy, CorporateProfile, Department, TransportMode } from "../types";

// Mock Data Store
let corporateProfile: CorporateProfile = {
  id: 'corp-001',
  companyName: 'Acme Innovations Pvt Ltd',
  gstin: '29ABCDE1234F1Z5',
  address: 'Tech Park, Bangalore',
  billingEmail: 'accounts@acme.com',
  totalBudget: 5000000,
  spentAmount: 1250000
};

let departments: Department[] = [
  { id: 'dept-sales', name: 'Sales', headEmail: 'head.sales@acme.com', monthlyBudget: 1000000, currentSpend: 450000 },
  { id: 'dept-eng', name: 'Engineering', headEmail: 'cto@acme.com', monthlyBudget: 500000, currentSpend: 120000 },
  { id: 'dept-hr', name: 'HR', headEmail: 'head.hr@acme.com', monthlyBudget: 200000, currentSpend: 50000 }
];

let globalPolicy: CorporatePolicy = {
  id: 'pol-global',
  departmentId: 'GLOBAL',
  maxFlightPrice: 15000,
  maxHotelPrice: 8000,
  minAdvanceBookingDays: 3,
  allowedModes: ['FLIGHT', 'TRAIN', 'BUS', 'CAB'],
  requireApprovalAbove: 10000
};

let approvalQueue: ApprovalRequest[] = [
  { id: 'req-1', bookingId: 'BK-101', employeeName: 'John Doe', amount: 18000, violationReason: 'Exceeds max flight price (₹15k)', status: 'PENDING', requestedAt: Date.now() - 86400000 },
  { id: 'req-2', bookingId: 'BK-102', employeeName: 'Jane Smith', amount: 12000, violationReason: 'Last minute booking', status: 'PENDING', requestedAt: Date.now() - 3600000 }
];

// --- API Methods ---

export const getCorporateProfile = async (): Promise<CorporateProfile> => {
  // Simulate delay
  await new Promise(r => setTimeout(r, 500));
  return corporateProfile;
};

export const getDepartments = (): Department[] => departments;

export const getPolicy = (): CorporatePolicy => globalPolicy;

export const updatePolicy = (policy: Partial<CorporatePolicy>) => {
  globalPolicy = { ...globalPolicy, ...policy };
  return globalPolicy;
};

export const getApprovals = (): ApprovalRequest[] => approvalQueue;

export const processApproval = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
  const req = approvalQueue.find(r => r.id === requestId);
  if (req) {
    req.status = status;
    req.actionedAt = Date.now();
    req.approverName = 'Admin User'; // Mock current user
  }
  return approvalQueue;
};

export const checkPolicyCompliance = (
  bookingAmt: number, 
  mode: TransportMode, 
  travelDateStr: string
): { isCompliant: boolean; violations: string[], requiresApproval: boolean } => {
  const violations: string[] = [];
  const today = new Date();
  const travelDate = new Date(travelDateStr);
  const diffTime = Math.abs(travelDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check Advance Booking
  if (diffDays < globalPolicy.minAdvanceBookingDays) {
    violations.push(`Booking must be made ${globalPolicy.minAdvanceBookingDays} days in advance.`);
  }

  // Check Price Limits
  if (mode === 'FLIGHT' && bookingAmt > globalPolicy.maxFlightPrice) {
    violations.push(`Flight cost ₹${bookingAmt} exceeds limit of ₹${globalPolicy.maxFlightPrice}.`);
  }

  // Check Mode
  if (!globalPolicy.allowedModes.includes(mode) && mode !== 'MIXED') {
    violations.push(`Travel mode ${mode} is not allowed by policy.`);
  }

  const requiresApproval = violations.length > 0 || bookingAmt > globalPolicy.requireApprovalAbove;

  return {
    isCompliant: violations.length === 0,
    violations,
    requiresApproval
  };
};

export const submitForApproval = (booking: Booking, violations: string[]): ApprovalRequest => {
  const req: ApprovalRequest = {
    id: `req-${Date.now()}`,
    bookingId: booking.id,
    employeeName: 'Current User', // Should come from Auth
    amount: booking.totalAmount,
    violationReason: violations.join(', ') || 'Amount exceeds auto-approval limit',
    status: 'PENDING',
    requestedAt: Date.now()
  };
  approvalQueue.unshift(req);
  return req;
};

export const exportExpenses = () => {
  const headers = ['Booking ID', 'Employee', 'Department', 'Amount', 'Date', 'Status'];
  const rows = [
    ['BK-101', 'John Doe', 'Sales', '18000', '2023-10-01', 'Approved'],
    ['BK-102', 'Jane Smith', 'Eng', '5000', '2023-10-05', 'Completed']
  ];
  
  let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "corporate_expenses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
