import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { approveOrderEditRequest, getOrders, rejectOrderEditRequest, updateAdminOrder, updateOrderStatus } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import type { DeliveryArea, Order, OrderStatus, Product } from '../../types';
import { formatPrice } from '../../utils/format';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'paid', 'cancelled'];
const pageSizeOptions = [5, 10, 20];

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-teal-100 text-teal-700',
  paid: 'bg-emerald-500 text-white',
  cancelled: 'bg-red-100 text-red-600',
};

const deliveryAreaLabels: Record<DeliveryArea, string> = {
  inside_dhaka: 'Inside Dhaka',
  outside_dhaka: 'Outside Dhaka',
};

const deliveryCharges: Record<DeliveryArea, number> = {
  inside_dhaka: 70,
  outside_dhaka: 130,
};

type DraftItem = { productId: string; quantity: number };
type FilterStatus = OrderStatus | 'all';

type DraftOrder = {
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: DeliveryArea;
  adminNote: string;
  items: DraftItem[];
};

function getOrderSubtotal(order: Order) {
  return order.subtotalAmount ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getOrderDeliveryCharge(order: Order) {
  return order.deliveryCharge ?? Math.max(order.totalAmount - getOrderSubtotal(order), 0);
}

function getDeliveryLabel(order: Order) {
  return order.deliveryArea ? deliveryAreaLabels[order.deliveryArea] : 'Delivery';
}

function requestedQuantity(order: Order, productId: string) {
  return order.editRequest?.requestedItems.find((item) => item.productId === productId)?.quantity;
}

function toDateInputValue(value: string | Date) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function todayInputValue() {
  return toDateInputValue(new Date());
}

function draftFromOrder(order: Order): DraftOrder {
  return {
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    deliveryArea: order.deliveryArea ?? 'inside_dhaka',
    adminNote: '',
    items: order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
  };
}

function draftItemProduct(item: DraftItem, productsById: Map<string, Product>, order: Order) {
  return productsById.get(item.productId) ?? order.items.find((orderItem) => orderItem.productId === item.productId);
}

function draftSubtotal(draft: DraftOrder, productsById: Map<string, Product>, order: Order) {
  return draft.items.reduce((sum, item) => {
    const product = draftItemProduct(item, productsById, order);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
}

function uniqueDraftItems(items: DraftItem[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item.productId) continue;
    map.set(item.productId, (map.get(item.productId) ?? 0) + Math.max(1, item.quantity));
  }
  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

function orderMatchesSearch(order: Order, search: string) {
  if (!search.trim()) return true;
  const query = search.trim().toLowerCase();
  return [order.customerName, order.phone, order.address, order.orderStatus, ...order.items.map((item) => item.name)]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query));
}

export default function Orders() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: getOrders });
  const { data: productsData } = useQuery({ queryKey: ['admin-order-products'], queryFn: () => getProducts({ limit: 200 }) });
  const products = useMemo(() => productsData?.products ?? [], [productsData?.products]);
  const productsById = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftOrder | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesDate = selectedDate ? toDateInputValue(order.createdAt) === selectedDate : true;
    const matchesStatus = statusFilter === 'all' ? true : order.orderStatus === statusFilter;
    return matchesDate && matchesStatus && orderMatchesSearch(order, search);
  }), [orders, search, selectedDate, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => filteredOrders.slice((page - 1) * pageSize, page * pageSize), [filteredOrders, page, pageSize]);
  const summary = useMemo(() => filteredOrders.reduce((acc, order) => {
    acc.revenue += order.orderStatus === 'cancelled' ? 0 : order.totalAmount;
    acc.items += order.items.reduce((sum, item) => sum + item.quantity, 0);
    if (order.orderStatus === 'pending' || order.orderStatus === 'confirmed') acc.open += 1;
    return acc;
  }, { revenue: 0, items: 0, open: 0 }), [filteredOrders]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedDate, statusFilter, pageSize]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Could not update order status. Check stock and backend API.'),
  });

  const adminUpdateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: DraftOrder }) => updateAdminOrder(id, {
      customerName: values.customerName,
      phone: values.phone,
      address: values.address,
      deliveryArea: values.deliveryArea,
      adminNote: values.adminNote || undefined,
      items: uniqueDraftItems(values.items),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrderId(null);
      setDraft(null);
      toast.success('Order updated');
    },
    onError: () => toast.error('Could not update order. Check stock and product selection.'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) => approveOrderEditRequest(id, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Edit request approved');
    },
    onError: () => toast.error('Could not approve edit request'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) => rejectOrderEditRequest(id, adminNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Edit request rejected');
    },
    onError: () => toast.error('Could not reject edit request'),
  });

  const respondToEdit = (id: string, action: 'approve' | 'reject') => {
    const adminNote = window.prompt(action === 'approve' ? 'Optional approval note' : 'Optional rejection note')?.trim() || undefined;
    if (action === 'approve') approveMutation.mutate({ id, adminNote });
    else rejectMutation.mutate({ id, adminNote });
  };

  const startEdit = (order: Order) => {
    setEditingOrderId(order._id);
    setDraft(draftFromOrder(order));
  };

  const updateDraftItem = (index: number, patch: Partial<DraftItem>) => {
    setDraft((current) => current ? { ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : current);
  };

  const removeDraftItem = (index: number) => {
    setDraft((current) => current ? { ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) } : current);
  };

  const addDraftItem = () => {
    const firstAvailable = products.find((product) => !draft?.items.some((item) => item.productId === product._id));
    if (!firstAvailable) {
      toast.error('No products available to add');
      return;
    }
    setDraft((current) => current ? { ...current, items: [...current.items, { productId: firstAvailable._id, quantity: 1 }] } : current);
  };

  const saveDraft = (order: Order) => {
    if (!draft) return;
    if (!draft.items.length || draft.items.some((item) => !item.productId || item.quantity < 1)) {
      toast.error('Order must have at least one valid product');
      return;
    }
    adminUpdateMutation.mutate({ id: order._id, values: draft });
  };

  return (
    <AdminShell title="Orders">
      {isLoading ? <LoadingState label="Loading orders..." /> : null}

      <div className="mb-5 grid gap-3 rounded-3xl border border-roseGold/10 bg-white/90 p-4 shadow-[0_18px_40px_-32px_rgba(74,40,48,0.45)] lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-bold text-ink">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ink/45"><CalendarDays size={15} /> Date</span>
            <input className="field" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>
          <label className="text-sm font-bold text-ink">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-ink/45">Status</span>
            <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}>
              <option value="all">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-ink sm:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ink/45"><Search size={15} /> Search</span>
            <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, address, product" />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary py-2" type="button" onClick={() => setSelectedDate(todayInputValue())}>Today</button>
          <button className="btn-secondary py-2" type="button" onClick={() => { setSelectedDate(''); setStatusFilter('all'); setSearch(''); }}>Clear</button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-roseGold/10 bg-white/85 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Showing</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{filteredOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-roseGold/10 bg-white/85 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Open orders</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{summary.open}</p>
        </div>
        <div className="rounded-2xl border border-roseGold/10 bg-white/85 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Items</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{summary.items}</p>
        </div>
        <div className="rounded-2xl border border-roseGold/10 bg-white/85 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Revenue</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{formatPrice(summary.revenue)}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/55">{selectedDate ? `Orders for ${selectedDate}` : 'All orders'} · page {page} of {pageCount}</p>
        <select className="field w-full sm:w-32" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
          {pageSizeOptions.map((option) => <option key={option} value={option}>{option} / page</option>)}
        </select>
      </div>

      <div className="grid gap-4">
        {paginatedOrders.map((order) => {
          const subtotal = getOrderSubtotal(order);
          const deliveryCharge = getOrderDeliveryCharge(order);
          const hasPendingEdit = order.editRequest?.status === 'pending';
          const isEditing = editingOrderId === order._id && draft;
          const previewSubtotal = isEditing ? draftSubtotal(draft, productsById, order) : subtotal;
          const previewDelivery = isEditing ? deliveryCharges[draft.deliveryArea] : deliveryCharge;
          const previewTotal = previewSubtotal + previewDelivery;

          return (
            <div key={order._id} className="rounded-3xl border border-roseGold/10 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{new Date(order.createdAt).toLocaleString()}</p>
                    <span className={`badge ${statusStyles[order.orderStatus]}`}>{order.orderStatus}</span>
                    {hasPendingEdit ? <span className="badge bg-roseGold text-white">Edit requested</span> : null}
                    {order.adminEditedAt ? <span className="badge-gold">Admin updated</span> : null}
                  </div>
                  {isEditing ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input className="field" value={draft.customerName} onChange={(event) => setDraft({ ...draft, customerName: event.target.value })} placeholder="Customer name" />
                      <input className="field" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="Phone" />
                      <textarea className="field min-h-24 sm:col-span-2" value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} placeholder="Delivery address" />
                      <select className="field" value={draft.deliveryArea} onChange={(event) => setDraft({ ...draft, deliveryArea: event.target.value as DeliveryArea })}>
                        <option value="inside_dhaka">Inside Dhaka - BDT 70</option>
                        <option value="outside_dhaka">Outside Dhaka - BDT 130</option>
                      </select>
                      <input className="field" value={draft.adminNote} onChange={(event) => setDraft({ ...draft, adminNote: event.target.value })} placeholder="Admin note optional" />
                    </div>
                  ) : (
                    <>
                      <h2 className="mt-1.5 font-display text-2xl font-bold">{order.customerName}</h2>
                      <p className="mt-1 text-sm text-ink/60">{order.phone} - {order.address}</p>
                    </>
                  )}
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xl font-extrabold">{formatPrice(previewTotal)}</p>
                  <select
                    className="field mt-2 min-w-44"
                    value={order.orderStatus}
                    onChange={(event) => statusMutation.mutate({ id: order._id, status: event.target.value as OrderStatus })}
                    disabled={Boolean(isEditing) || statusMutation.isPending}
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-pearl/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Ordered products</p>
                  {isEditing ? <button className="btn-secondary py-2" type="button" onClick={addDraftItem}><Plus size={15} /> Add product</button> : null}
                </div>
                <div className="mt-3 grid gap-3">
                  {isEditing ? draft.items.map((item, index) => {
                    const product = draftItemProduct(item, productsById, order);
                    return (
                      <div key={`${order._id}-draft-${index}`} className="grid gap-3 rounded-2xl bg-white p-3 text-sm lg:grid-cols-[1fr_110px_44px] lg:items-center">
                        <select className="field" value={item.productId} onChange={(event) => updateDraftItem(index, { productId: event.target.value })}>
                          {products.map((productOption) => <option key={productOption._id} value={productOption._id}>{productOption.name} - {formatPrice(productOption.price)} ({productOption.stock} stock)</option>)}
                          {!productsById.has(item.productId) && product ? <option value={item.productId}>{product.name} - current order item</option> : null}
                        </select>
                        <input className="field text-center" type="number" min={1} max={99} value={item.quantity} onChange={(event) => updateDraftItem(index, { quantity: Number(event.target.value) })} />
                        <button className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" type="button" onClick={() => removeDraftItem(index)} aria-label="Remove product"><Trash2 size={17} /></button>
                      </div>
                    );
                  }) : order.items.map((item) => {
                    const requestedQty = requestedQuantity(order, item.productId);
                    return (
                      <div key={`${order._id}-${item.productId}`} className="grid gap-3 rounded-2xl bg-white p-3 text-sm sm:grid-cols-[56px_1fr_auto] sm:items-center">
                        {item.image ? <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" /> : <div className="hidden h-14 w-14 rounded-xl bg-blush sm:block" />}
                        <div>
                          <p className="font-bold text-ink">{item.name}</p>
                          <p className="text-xs text-ink/50">Qty {item.quantity} x {formatPrice(item.price)}</p>
                          {hasPendingEdit && requestedQty !== undefined && requestedQty !== item.quantity ? (
                            <p className="mt-1 text-xs font-bold text-roseGold">Requested qty: {requestedQty}</p>
                          ) : null}
                        </div>
                        <p className="font-extrabold text-ink sm:text-right">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-2 border-t border-roseGold/10 pt-4 text-sm text-ink/65 sm:grid-cols-3">
                  <p>Subtotal: <span className="font-bold text-ink">{formatPrice(previewSubtotal)}</span></p>
                  <p>Delivery ({isEditing ? deliveryAreaLabels[draft.deliveryArea] : getDeliveryLabel(order)}): <span className="font-bold text-ink">{formatPrice(previewDelivery)}</span></p>
                  <p>Total: <span className="font-bold text-ink">{formatPrice(previewTotal)}</span></p>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-primary py-2" type="button" disabled={adminUpdateMutation.isPending} onClick={() => saveDraft(order)}>{adminUpdateMutation.isPending ? 'Saving...' : 'Save order changes'}</button>
                  <button className="btn-secondary py-2" type="button" onClick={() => { setEditingOrderId(null); setDraft(null); }}>Cancel</button>
                </div>
              ) : (
                <button className="btn-secondary mt-4 py-2" type="button" onClick={() => startEdit(order)}>Edit order</button>
              )}

              {order.editRequest ? (
                <div className="mt-4 rounded-2xl border border-roseGold/15 bg-white p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">Edit request: {order.editRequest.status}</p>
                      <p className="mt-1 text-sm text-ink/65">Requested total: <span className="font-bold text-ink">{formatPrice(order.editRequest.requestedTotalAmount)}</span></p>
                      {order.editRequest.note ? <p className="mt-1 text-sm text-ink/60">Customer note: {order.editRequest.note}</p> : null}
                      {order.editRequest.adminNote ? <p className="mt-1 text-sm text-ink/60">Admin note: {order.editRequest.adminNote}</p> : null}
                    </div>
                    {hasPendingEdit ? (
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-primary py-2" type="button" disabled={approveMutation.isPending} onClick={() => respondToEdit(order._id, 'approve')}>Approve edit</button>
                        <button className="rounded-full bg-red-50 px-5 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100" type="button" disabled={rejectMutation.isPending} onClick={() => respondToEdit(order._id, 'reject')}>Reject</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {!isLoading && !filteredOrders.length ? <p className="rounded-3xl border border-roseGold/10 bg-white/80 p-8 text-center text-ink/55">No orders match these filters.</p> : null}
      </div>

      {filteredOrders.length ? (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-roseGold/10 bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink/55">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length}</p>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full border border-roseGold/20 text-ink disabled:opacity-40" type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page"><ChevronLeft size={18} /></button>
            <span className="min-w-16 text-center text-sm font-bold text-ink">{page} / {pageCount}</span>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-roseGold/20 text-ink disabled:opacity-40" type="button" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page"><ChevronRight size={18} /></button>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
