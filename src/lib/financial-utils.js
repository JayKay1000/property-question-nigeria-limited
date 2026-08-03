// Enterprise Financial & Commission Utilities

export const COMMISSION_TYPES = {
  sale: { label: 'Property Sale', color: 'bg-success/15 text-success', rate: 5 },
  referral: { label: 'Referral', color: 'bg-info/15 text-info', rate: 2 },
  management: { label: 'Property Management', color: 'bg-flame-500/15 text-flame-600', rate: 10 },
  consultation: { label: 'Consultation', color: 'bg-primary/10 text-primary', rate: 15 },
  valuation: { label: 'Valuation', color: 'bg-purple-500/15 text-purple-600', rate: 8 },
  leasing: { label: 'Leasing', color: 'bg-blue-500/15 text-blue-600', rate: 5 },
};

export const COMMISSION_STATUS = {
  pending: { label: 'Pending', color: 'bg-warning/15 text-warning' },
  approved: { label: 'Approved', color: 'bg-info/15 text-info' },
  paid: { label: 'Paid', color: 'bg-success/15 text-success' },
  disputed: { label: 'Disputed', color: 'bg-error/15 text-error' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
  reversed: { label: 'Reversed', color: 'bg-error/15 text-error' },
};

export const INVOICE_STATUS = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', color: 'bg-info/15 text-info' },
  paid: { label: 'Paid', color: 'bg-success/15 text-success' },
  partially_paid: { label: 'Partially Paid', color: 'bg-warning/15 text-warning' },
  overdue: { label: 'Overdue', color: 'bg-error/15 text-error' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
  refunded: { label: 'Refunded', color: 'bg-purple-500/15 text-purple-600' },
};

export const INVOICE_TYPES = {
  property_sale: 'Property Sale',
  service_fee: 'Service Fee',
  commission: 'Commission',
  management_fee: 'Management Fee',
  consultation: 'Consultation',
  valuation: 'Valuation',
  construction: 'Construction',
  other: 'Other',
};

export const PAYMENT_METHODS = {
  cash: { label: 'Cash', icon: 'Banknote' },
  bank_transfer: { label: 'Bank Transfer', icon: 'Building' },
  card: { label: 'Card', icon: 'CreditCard' },
  cheque: { label: 'Cheque', icon: 'ScrollText' },
  online: { label: 'Online', icon: 'Globe' },
  mobile_money: { label: 'Mobile Money', icon: 'Smartphone' },
  pos: { label: 'POS', icon: 'CreditCard' },
};

export const RECEIPT_STATUS = {
  confirmed: { label: 'Confirmed', color: 'bg-success/15 text-success' },
  pending: { label: 'Pending', color: 'bg-warning/15 text-warning' },
  disputed: { label: 'Disputed', color: 'bg-error/15 text-error' },
  reversed: { label: 'Reversed', color: 'bg-error/15 text-error' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
};

export function formatCurrency(amount, currency = 'NGN') {
  if (amount === undefined || amount === null) return '—';
  const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : '';
  return `${symbol}${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function calculateCommission(baseAmount, rate) {
  return (baseAmount * rate) / 100;
}

export function calculateNet(amount, taxRate = 0) {
  return amount - (amount * taxRate) / 100;
}

export function calculateInvoiceTotals(lineItems, taxRate = 0, discountAmount = 0) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || (item.quantity * item.unit_price) || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount - (discountAmount || 0);
  return { subtotal, taxAmount, discountAmount, totalAmount };
}

export function getCommissionTypeInfo(type) {
  return COMMISSION_TYPES[type] || COMMISSION_TYPES.sale;
}

export function getCommissionStatusInfo(status) {
  return COMMISSION_STATUS[status] || COMMISSION_STATUS.pending;
}

export function getInvoiceStatusInfo(status) {
  return INVOICE_STATUS[status] || INVOICE_STATUS.draft;
}

export function getReceiptStatusInfo(status) {
  return RECEIPT_STATUS[status] || RECEIPT_STATUS.pending;
}

export function getPaymentMethodInfo(method) {
  return PAYMENT_METHODS[method] || PAYMENT_METHODS.bank_transfer;
}

export function generateInvoiceNumber(prefix = 'INV') {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}${month}-${random}`;
}

export function generateReceiptNumber(prefix = 'RCP') {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}${month}-${random}`;
}

export function generateCommissionCode(prefix = 'COM') {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${random}`;
}