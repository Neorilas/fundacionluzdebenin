import { useEffect, useState, FormEvent } from 'react';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import BilingualField from '../../components/BilingualField';

interface CoverItem { icon: string; textEs: string; textFr: string; }
interface StatItem  { value: string; labelEs: string; labelFr: string; }
interface WhyItem   { icon: string; textEs: string; textFr: string; }

interface FormData {
  slug: string;
  emoji: string;
  amountCents: number;
  colorScheme: string;
  active: boolean;
  sortOrder: number;
  // Hero
  tagEs: string; tagFr: string;
  titleEs: string; titleFr: string;
  taglineEs: string; taglineFr: string;
  priceLabel: string;
  periodEs: string; periodFr: string;
  ctaEs: string; ctaFr: string;
  fineEs: string; fineFr: string;
  // Cover items
  coverItems: CoverItem[];
  // Project section
  projectTitleEs: string; projectTitleFr: string;
  projectTextEs: string; projectTextFr: string;
  projectBadgeEs: string; projectBadgeFr: string;
  projectLinkEs: string; projectLinkFr: string;
  projectHref: string;
  // Extra section
  extraType: string;
  extraTitleEs: string; extraTitleFr: string;
  extraItems: (StatItem | WhyItem)[];
  // CTA bottom
  ctaBottomEs: string; ctaBottomFr: string;
  ctaBottomNoteEs: string; ctaBottomNoteFr: string;
  // SEO
  metaTitleEs: string; metaTitleFr: string;
  metaDescEs: string; metaDescFr: string;
}

const emptyCoverItem = (): CoverItem => ({ icon: '', textEs: '', textFr: '' });
const emptyStatItem = (): StatItem => ({ value: '', labelEs: '', labelFr: '' });
const emptyWhyItem = (): WhyItem => ({ icon: '', textEs: '', textFr: '' });

const empty: FormData = {
  slug: '', emoji: '🐾', amountCents: 500, colorScheme: 'amber', active: true, sortOrder: 0,
  tagEs: '', tagFr: '', titleEs: '', titleFr: '', taglineEs: '', taglineFr: '',
  priceLabel: '', periodEs: '', periodFr: '', ctaEs: '', ctaFr: '', fineEs: '', fineFr: '',
  coverItems: [emptyCoverItem(), emptyCoverItem(), emptyCoverItem(), emptyCoverItem()],
  projectTitleEs: '', projectTitleFr: '', projectTextEs: '', projectTextFr: '',
  projectBadgeEs: '', projectBadgeFr: '', projectLinkEs: '', projectLinkFr: '', projectHref: '',
  extraType: '', extraTitleEs: '', extraTitleFr: '', extraItems: [],
  ctaBottomEs: '', ctaBottomFr: '', ctaBottomNoteEs: '', ctaBottomNoteFr: '',
  metaTitleEs: '', metaTitleFr: '', metaDescEs: '', metaDescFr: '',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">{title}</h3>
      {children}
    </div>
  );
}

export default function CampaignsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [priceStr, setPriceStr] = useState('5.00');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!id);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/admin/campaigns/${id}`).then(r => {
        const d = r.data;
        setPriceStr((d.amountCents / 100).toFixed(2));
        setForm({
          slug: d.slug, emoji: d.emoji, amountCents: d.amountCents,
          colorScheme: d.colorScheme, active: d.active, sortOrder: d.sortOrder,
          tagEs: d.tagEs, tagFr: d.tagFr,
          titleEs: d.titleEs, titleFr: d.titleFr,
          taglineEs: d.taglineEs, taglineFr: d.taglineFr,
          priceLabel: d.priceLabel,
          periodEs: d.periodEs, periodFr: d.periodFr,
          ctaEs: d.ctaEs, ctaFr: d.ctaFr,
          fineEs: d.fineEs, fineFr: d.fineFr,
          coverItems: Array.isArray(d.coverItems) && d.coverItems.length > 0
            ? d.coverItems : [emptyCoverItem(), emptyCoverItem(), emptyCoverItem(), emptyCoverItem()],
          projectTitleEs: d.projectTitleEs, projectTitleFr: d.projectTitleFr,
          projectTextEs: d.projectTextEs, projectTextFr: d.projectTextFr,
          projectBadgeEs: d.projectBadgeEs, projectBadgeFr: d.projectBadgeFr,
          projectLinkEs: d.projectLinkEs, projectLinkFr: d.projectLinkFr,
          projectHref: d.projectHref,
          extraType: d.extraType, extraTitleEs: d.extraTitleEs, extraTitleFr: d.extraTitleFr,
          extraItems: Array.isArray(d.extraItems) ? d.extraItems : [],
          ctaBottomEs: d.ctaBottomEs, ctaBottomFr: d.ctaBottomFr,
          ctaBottomNoteEs: d.ctaBottomNoteEs, ctaBottomNoteFr: d.ctaBottomNoteFr,
          metaTitleEs: d.metaTitleEs, metaTitleFr: d.metaTitleFr,
          metaDescEs: d.metaDescEs, metaDescFr: d.metaDescFr,
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (name: string, value: unknown) => {
    setForm(f => {
      const next: Record<string, unknown> = { [name]: value };
      if (name === 'titleEs' && !slugTouched) {
        next.slug = toSlug(value as string);
      }
      return { ...f, ...next };
    });
  };

  const handleExtraTypeChange = (type: string) => {
    let items: (StatItem | WhyItem)[] = form.extraItems;
    if (type === 'stats' && (!items.length || !('value' in items[0]))) {
      items = [emptyStatItem(), emptyStatItem(), emptyStatItem()];
    } else if (type === 'why' && (!items.length || !('icon' in items[0]))) {
      items = [emptyWhyItem(), emptyWhyItem(), emptyWhyItem(), emptyWhyItem()];
    } else if (type === '') {
      items = [];
    }
    setForm(f => ({ ...f, extraType: type, extraItems: items }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        await api.put(`/admin/campaigns/${id}`, payload);
      } else {
        await api.post('/admin/campaigns', payload);
      }
      navigate('/admin/campaigns');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/campaigns')} className="text-gray-400 hover:text-gray-600">←</button>
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar campaña' : 'Nueva campaña'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* 1. Info básica */}
        <Section title="1. Información básica">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
              <input type="text" value={form.slug} onChange={e => { setSlugTouched(true); set('slug', e.target.value); }}
                required placeholder="apadrina-gallina"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
              <input type="text" value={form.emoji} onChange={e => set('emoji', e.target.value)}
                placeholder="🐔"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01"
                value={priceStr}
                onChange={e => setPriceStr(e.target.value)}
                onBlur={() => {
                  const cents = Math.round(parseFloat(priceStr) * 100);
                  if (!isNaN(cents) && cents >= 0) {
                    set('amountCents', cents);
                    setPriceStr((cents / 100).toFixed(2));
                  } else {
                    setPriceStr((form.amountCents / 100).toFixed(2));
                  }
                }}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
              <p className="text-xs text-gray-400 mt-1">{form.amountCents} céntimos</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Esquema de color</label>
              <select value={form.colorScheme} onChange={e => set('colorScheme', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800">
                <option value="amber">Ámbar (gallina)</option>
                <option value="green">Verde (oveja)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" value={form.sortOrder} onChange={e => set('sortOrder', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)}
              className="w-4 h-4 text-primary-800 rounded" />
            <span className="text-sm font-medium text-gray-700">Campaña activa (visible en el frontend)</span>
          </label>
        </Section>

        {/* 2. Hero */}
        <Section title="2. Hero">
          <div className="grid grid-cols-2 gap-4">
            <BilingualField label="Tag (etiqueta)" nameEs="tagEs" nameFr="tagFr"
              valueEs={form.tagEs} valueFr={form.tagFr} onChange={set} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta de precio (ej: 5€)</label>
              <input type="text" value={form.priceLabel} onChange={e => set('priceLabel', e.target.value)}
                placeholder="5€"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
            </div>
          </div>
          <BilingualField label="Título principal" nameEs="titleEs" nameFr="titleFr"
            valueEs={form.titleEs} valueFr={form.titleFr} onChange={set} required />
          <BilingualField label="Tagline" nameEs="taglineEs" nameFr="taglineFr"
            valueEs={form.taglineEs} valueFr={form.taglineFr} onChange={set} />
          <BilingualField label="Periodo (ej: al mes)" nameEs="periodEs" nameFr="periodFr"
            valueEs={form.periodEs} valueFr={form.periodFr} onChange={set} />
          <BilingualField label="Texto botón CTA" nameEs="ctaEs" nameFr="ctaFr"
            valueEs={form.ctaEs} valueFr={form.ctaFr} onChange={set} />
          <BilingualField label="Letra pequeña (condiciones)" nameEs="fineEs" nameFr="fineFr"
            valueEs={form.fineEs} valueFr={form.fineFr} onChange={set} />
        </Section>

        {/* 3. ¿Qué cubre? */}
        <Section title="3. ¿Qué cubre? (4 items)">
          {form.coverItems.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Item {i + 1}</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Icono (emoji)</label>
                <input type="text" value={item.icon}
                  onChange={e => {
                    const updated = [...form.coverItems];
                    updated[i] = { ...updated[i], icon: e.target.value };
                    set('coverItems', updated);
                  }}
                  placeholder="🌽"
                  className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
              </div>
              <BilingualField
                label="Texto"
                nameEs={`coverItem_${i}_textEs`}
                nameFr={`coverItem_${i}_textFr`}
                valueEs={item.textEs}
                valueFr={item.textFr}
                onChange={(name, val) => {
                  const updated = [...form.coverItems];
                  if (name.endsWith('_textEs')) updated[i] = { ...updated[i], textEs: val };
                  else updated[i] = { ...updated[i], textFr: val };
                  set('coverItems', updated);
                }}
              />
            </div>
          ))}
        </Section>

        {/* 4. Sección Proyecto */}
        <Section title="4. Sección Proyecto">
          <BilingualField label="Título" nameEs="projectTitleEs" nameFr="projectTitleFr"
            valueEs={form.projectTitleEs} valueFr={form.projectTitleFr} onChange={set} />
          <BilingualField label="Texto" nameEs="projectTextEs" nameFr="projectTextFr"
            valueEs={form.projectTextEs} valueFr={form.projectTextFr} onChange={set} multiline rows={4} />
          <BilingualField label="Badge (opcional)" nameEs="projectBadgeEs" nameFr="projectBadgeFr"
            valueEs={form.projectBadgeEs} valueFr={form.projectBadgeFr} onChange={set} />
          <BilingualField label="Texto enlace (opcional)" nameEs="projectLinkEs" nameFr="projectLinkFr"
            valueEs={form.projectLinkEs} valueFr={form.projectLinkFr} onChange={set} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL enlace (opcional)</label>
            <input type="text" value={form.projectHref} onChange={e => set('projectHref', e.target.value)}
              placeholder="/proyectos/granja-avicola-sostenible/"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
          </div>
        </Section>

        {/* 5. Sección extra */}
        <Section title="5. Sección extra">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de sección extra</label>
            <select value={form.extraType} onChange={e => handleExtraTypeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800">
              <option value="">Ninguna</option>
              <option value="stats">Estadísticas (fondo oscuro)</option>
              <option value="why">¿Por qué? (items con icono)</option>
            </select>
          </div>

          {form.extraType !== '' && (
            <BilingualField label="Título sección" nameEs="extraTitleEs" nameFr="extraTitleFr"
              valueEs={form.extraTitleEs} valueFr={form.extraTitleFr} onChange={set} />
          )}

          {form.extraType === 'stats' && (
            <div className="space-y-3">
              {(form.extraItems as StatItem[]).map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Stat {i + 1}</span>
                    <button type="button" onClick={() => {
                      const updated = (form.extraItems as StatItem[]).filter((_, j) => j !== i);
                      set('extraItems', updated);
                    }} className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
                      <input type="text" value={item.value}
                        onChange={e => {
                          const updated = [...(form.extraItems as StatItem[])];
                          updated[i] = { ...updated[i], value: e.target.value };
                          set('extraItems', updated);
                        }}
                        placeholder="2.500+"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-800" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label ES</label>
                      <input type="text" value={item.labelEs}
                        onChange={e => {
                          const updated = [...(form.extraItems as StatItem[])];
                          updated[i] = { ...updated[i], labelEs: e.target.value };
                          set('extraItems', updated);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-800" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label FR</label>
                      <input type="text" value={item.labelFr}
                        onChange={e => {
                          const updated = [...(form.extraItems as StatItem[])];
                          updated[i] = { ...updated[i], labelFr: e.target.value };
                          set('extraItems', updated);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-800" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button"
                onClick={() => set('extraItems', [...form.extraItems, emptyStatItem()])}
                className="text-sm text-primary-800 hover:underline">
                + Añadir estadística
              </button>
            </div>
          )}

          {form.extraType === 'why' && (
            <div className="space-y-3">
              {(form.extraItems as WhyItem[]).map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Item {i + 1}</span>
                    <button type="button" onClick={() => {
                      const updated = (form.extraItems as WhyItem[]).filter((_, j) => j !== i);
                      set('extraItems', updated);
                    }} className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Icono</label>
                    <input type="text" value={item.icon}
                      onChange={e => {
                        const updated = [...(form.extraItems as WhyItem[])];
                        updated[i] = { ...updated[i], icon: e.target.value };
                        set('extraItems', updated);
                      }}
                      placeholder="📈"
                      className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
                  </div>
                  <BilingualField
                    label="Texto"
                    nameEs={`extraItem_${i}_textEs`}
                    nameFr={`extraItem_${i}_textFr`}
                    valueEs={item.textEs}
                    valueFr={item.textFr}
                    onChange={(name, val) => {
                      const updated = [...(form.extraItems as WhyItem[])];
                      if (name.endsWith('_textEs')) updated[i] = { ...updated[i], textEs: val };
                      else updated[i] = { ...updated[i], textFr: val };
                      set('extraItems', updated);
                    }}
                  />
                </div>
              ))}
              <button type="button"
                onClick={() => set('extraItems', [...form.extraItems, emptyWhyItem()])}
                className="text-sm text-primary-800 hover:underline">
                + Añadir item
              </button>
            </div>
          )}
        </Section>

        {/* 6. CTA final */}
        <Section title="6. CTA final">
          <BilingualField label="Texto botón" nameEs="ctaBottomEs" nameFr="ctaBottomFr"
            valueEs={form.ctaBottomEs} valueFr={form.ctaBottomFr} onChange={set} />
          <BilingualField label="Nota a pie" nameEs="ctaBottomNoteEs" nameFr="ctaBottomNoteFr"
            valueEs={form.ctaBottomNoteEs} valueFr={form.ctaBottomNoteFr} onChange={set} />
        </Section>

        {/* 7. SEO */}
        <Section title="7. SEO">
          <BilingualField label="Meta título" nameEs="metaTitleEs" nameFr="metaTitleFr"
            valueEs={form.metaTitleEs} valueFr={form.metaTitleFr} onChange={set} />
          <BilingualField label="Meta descripción" nameEs="metaDescEs" nameFr="metaDescFr"
            valueEs={form.metaDescEs} valueFr={form.metaDescFr} onChange={set} multiline rows={2} />
        </Section>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/campaigns')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar campaña'}
          </button>
        </div>
      </form>
    </div>
  );
}
