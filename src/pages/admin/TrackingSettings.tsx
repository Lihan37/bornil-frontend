import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { getTrackingSettings, updateTrackingSettings, type TrackingSettings as Settings } from '../../services/settingsService';

const EMPTY: Settings = { gtmId: '', metaPixelId: '', ga4Id: '' };

export default function TrackingSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['tracking-settings'], queryFn: getTrackingSettings });
  const [form, setForm] = useState<Settings>(EMPTY);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateTrackingSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-settings'] });
      toast.success('Saved! Refresh the storefront to load the new IDs.');
    },
    onError: () => toast.error('Could not save. Please try again.'),
  });

  const set = (key: keyof Settings, value: string) => setForm((current) => ({ ...current, [key]: value.trim() }));

  return (
    <AdminShell title="Tracking & Marketing">
      {isLoading ? (
        <LoadingState label="Loading settings…" />
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate(form);
          }}
          className="max-w-2xl rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-8"
        >
          <p className="eyebrow mb-2">Analytics & pixels</p>
          <h2 className="font-display text-2xl font-bold">Paste your tracking IDs</h2>
          <p className="mt-2 text-sm text-ink/55">
            No code needed — the storefront loads these automatically. Save, then refresh the shop to apply.
          </p>

          <div className="mt-6 grid gap-5">
            <Field
              label="Google Tag Manager ID"
              badge="Recommended"
              hint="Manage your Meta Pixel & GA4 as tags inside GTM. Example: GTM-XXXXXXX"
              placeholder="GTM-XXXXXXX"
              value={form.gtmId}
              onChange={(v) => set('gtmId', v)}
            />
            <Field
              label="Meta (Facebook) Pixel ID"
              hint="Only fill this if you are NOT loading the Pixel through GTM (avoids double-counting). Example: 1234567890123456"
              placeholder="1234567890123456"
              value={form.metaPixelId}
              onChange={(v) => set('metaPixelId', v)}
            />
            <Field
              label="GA4 Measurement ID"
              hint="Only fill this if you are NOT loading GA4 through GTM. Example: G-XXXXXXX"
              placeholder="G-XXXXXXX"
              value={form.ga4Id}
              onChange={(v) => set('ga4Id', v)}
            />
          </div>

          <div className="mt-6 rounded-2xl bg-blush/40 p-4 text-sm leading-6 text-ink/70">
            <p className="font-bold text-ink">How events reach your tags</p>
            <p className="mt-1">
              The shop automatically sends these events to the GTM data layer:{' '}
              <b>view_item</b>, <b>add_to_cart</b>, <b>begin_checkout</b>, <b>purchase</b> — each with product, price,
              quantity and value. Build your triggers/tags in GTM on these event names.
            </p>
          </div>

          <button type="submit" disabled={mutation.isPending} className="btn-primary mt-6">
            {mutation.isPending ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      )}
    </AdminShell>
  );
}

function Field({
  label,
  badge,
  hint,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  badge?: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-sm font-bold text-ink">{label}</label>
        {badge ? <span className="badge-gold">{badge}</span> : null}
      </div>
      <input className="field font-mono" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      <p className="mt-1 text-xs leading-5 text-ink/50">{hint}</p>
    </div>
  );
}
