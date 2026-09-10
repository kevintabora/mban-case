'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Database,
  ArrowRight,
  BookOpen,
  FlaskConical,
  RotateCcw,
} from 'lucide-react';
import {
  customers,
  parts,
  lines,
  rfqs,
  orders,
  joinLine,
  clean,
  featureHistory,
  train,
  evaluate,
  extract,
  samples,
  type Feature,
  type Rules,
} from './engine';
type Row = Record<string, string | number | boolean | null>;
const stages = [
  'Raw records',
  'Connect the tables',
  'Clean the rows',
  'Build the features',
  'Train & compare',
  'Explore predictions',
  'From email to action',
  'What the paper found',
];
const leads = [
  'A request begins as an email. Select a quote line to highlight its customer, part, and candidate order records.',
  'A join brings related records together. Change the matching rules and watch the learning row change.',
  'A tidy-looking table can still teach the wrong lesson. Turn cleaning rules on and off to see their exact effects.',
  'Features are clues made from records. Inspect the arithmetic, then see how categories become model inputs.',
  'Practice on some rows and test on others. This small, working tree ensemble makes the learning steps visible.',
  'A score becomes a prediction only after you choose a cut-off. Move it and see which mistakes change.',
  'The model needs fields, but the customer sends words. Try a message and inspect what a dictionary matcher sees.',
  'These are the paper’s findings. The interactive examples elsewhere are teaching models, not a reproduction of its experiments.',
];
const sources = [
  '§§3.1.1–3.1.2 · pp. 3–4',
  '§3.1.3 · p. 4',
  '§3.2 · pp. 4–5',
  '§§3.1.2, 3.2.1, 3.5.1 · pp. 4–7',
  '§§3.3–3.5 · pp. 5–8',
  '§§3.5.3–3.6 · p. 8',
  '§§3.7, 4.2, 6 · pp. 8–12',
  '§§4–6 · pp. 9–12',
];
const pct = (n: number | null) =>
  n === null ? 'Not defined' : `${(n * 100).toFixed(1)}%`;
function Grid({
  title,
  note,
  rows,
  active,
  onPick,
}: {
  title: string;
  note?: string;
  rows: Row[];
  active?: (r: Row) => boolean;
  onPick?: (r: Row) => void;
}) {
  const keys = Object.keys(rows[0] || {});
  return (
    <section className="panel data-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        <span>{rows.length} rows</span>
      </div>
      {note && <p className="table-note">{note}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            {keys.map((k) => (
              <TableHead key={k}>{k}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i} className={active?.(r) ? 'selected' : ''}>
              {keys.map((k, j) => (
                <TableCell key={k}>
                  {onPick && j === 0 ? (
                    <button className="row-link" onClick={() => onPick(r)}>
                      {String(r[k])}
                    </button>
                  ) : r[k] === null ? (
                    <span className="missing">NULL</span>
                  ) : (
                    String(r[k])
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!rows.length && (
        <p className="empty">
          No rows match. Change a rule to compare what returns.
        </p>
      )}
    </section>
  );
}
function Check({
  label,
  value,
  set,
}: {
  label: string;
  value: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <label className="control-label">
      <Checkbox checked={value} onCheckedChange={(v) => set(Boolean(v))} />
      {label}
    </label>
  );
}
function Range({
  label,
  value,
  set,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  label: string;
  value: number;
  set: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="range">
      <p>
        {label} <b>{value}</b>
      </p>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => set(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
function Bars({
  rows,
  max = 1,
}: {
  rows: { label: string; value: number; color?: string }[];
  max?: number;
}) {
  return (
    <div
      className="chart"
      aria-label={rows.map((r) => `${r.label}: ${r.value}`).join('; ')}
    >
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span>{r.label}</span>
          <div className="bar-track">
            <div
              className={'bar-fill ' + (r.color || '')}
              style={{
                width: `${Math.max(0, Math.min(100, (r.value / max) * 100))}%`,
              }}
            />
          </div>
          <b>{Number(r.value.toFixed(3))}</b>
        </div>
      ))}
    </div>
  );
}
function Note({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="explain">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export default function Home() {
  const [stage, setStage] = useState(0),
    [lineId, setLineId] = useState('L01'),
    [days, setDays] = useState(30),
    [gov, setGov] = useState(true),
    [inner, setInner] = useState(false),
    [aggregate, setAggregate] = useState(true);
  const [rules, setRules] = useState<Rules>({
    duplicate: true,
    leak: false,
    mar: false,
    mnar: false,
  });
  const [future, setFuture] = useState(false),
    [encoded, setEncoded] = useState(true),
    [delivery, setDelivery] = useState(5);
  const [fold, setFold] = useState(0),
    [balance, setBalance] = useState(true),
    [features, setFeatures] = useState<Feature[]>([
      'hitRate',
      'stock',
      'price',
    ]),
    [treeCount, setTreeCount] = useState(5),
    [threshold, setThreshold] = useState(0.62),
    [testId, setTestId] = useState('');
  const [message, setMessage] = useState(
      'From: buyer@aero.example\nPlease quote AB-12-CD and V1. Ship to 42 Main Street.',
    ),
    [preserve, setPreserve] = useState(true),
    [exclude, setExclude] = useState(false);
  const line = lines.find((x) => x.line === lineId)!;
  const mail = rfqs.find((x) => x.rfq === line.rfq)!;
  const joined = joinLine(line, days, gov);
  const cleaned = clean(rules);
  const hist = featureHistory(line, future);
  const model = useMemo(
    () => train(fold, balance, features, treeCount),
    [fold, balance, features, treeCount],
  );
  const metrics = evaluate(model.test, threshold);
  const selectedTest = model.test.find((x) => x.id === testId) || model.test[0];
  const parsed = extract(message, preserve, exclude);
  function reset() {
    setStage(0);
    setLineId('L01');
    setDays(30);
    setGov(true);
    setInner(false);
    setAggregate(true);
    setRules({ duplicate: true, leak: false, mar: false, mnar: false });
    setFuture(false);
    setEncoded(true);
    setDelivery(5);
    setFold(0);
    setBalance(true);
    setFeatures(['hitRate', 'stock', 'price']);
    setTreeCount(5);
    setThreshold(0.62);
    setTestId('');
    setMessage(
      'From: buyer@aero.example\nPlease quote AB-12-CD and V1. Ship to 42 Main Street.',
    );
    setPreserve(true);
    setExclude(false);
  }
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'explore_data_stage',
            description:
              'Open a learning stage and optionally follow one illustrative quote line.',
            inputSchema: {
              type: 'object',
              properties: {
                stage: { type: 'integer', minimum: 1, maximum: 8 },
                line: { type: 'string', enum: lines.map((x) => x.line) },
              },
              required: ['stage'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute: (input: unknown) => {
              const x = input as { stage: number; line?: string };
              if (
                !x ||
                !Number.isInteger(x.stage) ||
                x.stage < 1 ||
                x.stage > 8 ||
                (x.line && !lines.some((l) => l.line === x.line))
              )
                throw Error('Choose stage 1–8 and a valid line ID.');
              setStage(x.stage - 1);
              if (x.line) setLineId(x.line);
              return {
                stage: x.stage,
                title: stages[x.stage - 1],
                line: x.line ?? null,
              };
            },
          },
          { signal: controller.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => controller.abort();
  }, []);
  const pick = (r: Row) => setLineId(String(r.line));
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="brand">
            <span className="brand-icon">
              <Database size={23} />
            </span>
            <div>
              Data Journey<small>THE RFQ LEARNING LAB</small>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <p className="nav-label">FOLLOW THE DATA</p>
          <SidebarMenu>
            {stages.map((s, i) => (
              <SidebarMenuItem key={s}>
                <SidebarMenuButton
                  isActive={stage === i}
                  onClick={() => setStage(i)}
                >
                  <span className="stage-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="source-box">
            <BookOpen size={18} />
            <p>
              Rohaan et al. · 2022
              <br />
              <span>Spare-parts sales forecasting</span>
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="topbar">
          <SidebarTrigger />
          <span>CASE STUDY / INTERACTIVE COMPANION</span>
          <span className="badge">
            <FlaskConical size={14} />
            {stage === 7 ? 'Reported evidence' : 'Illustrative data'}
          </span>
          <button
            className="reset"
            onClick={reset}
            title="Reset all experiments"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </header>
        <div className="workspace">
          <div className="page-title">
            <div>
              <p className="eyebrow">STEP {stage + 1} OF 8</p>
              <h1>{stages[stage]}</h1>
            </div>
            {stage < 7 && (
              <button className="next" onClick={() => setStage(stage + 1)}>
                Next step <ArrowRight size={17} />
              </button>
            )}
          </div>
          <p className="lead">{leads[stage]}</p>
          <div className="notice">
            {stage === 7
              ? 'Paper findings below are historical results. The lab does not reproduce the authors’ model or use private company records.'
              : 'All row values and model experiments are invented for learning. Dates and cleaning assumptions are illustrative. No record is a real customer.'}
          </div>
          {stage < 4 && (
            <>
              <div className="line-trail">
                <span className="trail-label">FOLLOW A QUOTE LINE</span>
                {lines.map((l) => (
                  <button
                    key={l.line}
                    onClick={() => setLineId(l.line)}
                    aria-pressed={lineId === l.line}
                  >
                    {l.line}
                  </button>
                ))}
                <span className="trail-description">
                  {line.rfq} → Account {line.account} → {line.part}
                </span>
              </div>
            </>
          )}
          {stage === 0 && (
            <>
              <div className="stat-grid">
                <Stat label="RFQ emails" value={rfqs.length} />
                <Stat label="Quote lines" value={lines.length} />
                <Stat label="Order lines" value={orders.length} />
                <Stat label="Unpursued RFQ, no label" value="R7" />
              </div>
              <div className="two-col">
                <section className="panel email">
                  <p className="eyebrow">RAW EMAIL · {mail.rfq}</p>
                  <h2>{mail.subject}</h2>
                  <p className="muted">
                    From: {mail.from}
                    <br />
                    Received: {mail.date}
                  </p>
                  <blockquote>{mail.body}</blockquote>
                  <p className="annotation">
                    The customer asks for prices.{' '}
                    {mail.rfq === 'R1'
                      ? 'R1 produces two quote lines: L01 and L02.'
                      : 'The selected quote line belongs to this request.'}{' '}
                    An email is not a sale.
                  </p>
                </section>
                <Grid
                  title="Quote-line table"
                  note="One row = one offered part. Choose a line ID."
                  rows={lines}
                  active={(r) => r.line === lineId}
                  onPick={pick}
                />
              </div>
              <div className="two-col">
                <Grid
                  title="Customer master"
                  note="One row = one account. Account C is absent in this deliberately incomplete file."
                  rows={customers}
                  active={(r) => r.account === line.account}
                />
                <Grid
                  title="Part master"
                  note="One row = one part. NULL means no value was stored."
                  rows={parts}
                  active={(r) => r.part === line.part}
                />
              </div>
              <Grid
                title="Sales-order table"
                note="These records have no quote-line ID. Green rows share the selected account and part; time and sales type still need checking."
                rows={orders}
                active={(r) =>
                  r.account === line.account && r.part === line.part
                }
              />
              <Grid
                title="RFQ inbox register"
                note="One row = one email request. R7 was not quoted, so it has no quote-line outcome to learn from."
                rows={rfqs.map(({ body: _body, ...r }) => ({
                  ...r,
                  quoted: r.rfq === 'R7' ? 'No' : 'Yes',
                }))}
              />
              <Note title="A row is not always the same thing">
                <p>
                  R1 is one request, L01 is one offered item, and O1 is one
                  order line. Joining tables without respecting those units can
                  multiply counts. IDs identify records; their digits are not
                  useful measurements.
                </p>
              </Note>
            </>
          )}
          {stage === 1 && (
            <>
              <div className="controls">
                <Range
                  label="Regular match window (days)"
                  value={days}
                  set={setDays}
                  min={7}
                  max={90}
                  step={1}
                />
                <Check label="Government: 90 days" value={gov} set={setGov} />
                <Check
                  label="Inner customer join"
                  value={inner}
                  set={setInner}
                />
                <Check
                  label="Aggregate order matches"
                  value={aggregate}
                  set={setAggregate}
                />
              </div>
              <div className="two-col">
                <Grid title="Selected quote line" rows={[line]} />
                <Grid
                  title="Matching customer + part"
                  note="These are lookup joins on their IDs."
                  rows={[
                    {
                      account: line.account,
                      type: joined.type,
                      part: line.part,
                      price: joined.price,
                      supplier: joined.supplier,
                    },
                  ]}
                />
              </div>
              <Grid
                title="Order-match audit"
                note={`For ${lineId}: account + part + sales type + date window. Toy observation date: 2 March 2019.`}
                rows={orders.map((o) => {
                  const same =
                    o.account === line.account &&
                    o.part === line.part &&
                    o.salesType === line.salesType;
                  const elapsed = Math.round(
                    (Date.parse(o.date) - Date.parse(line.date)) / 86400000,
                  );
                  return {
                    ...o,
                    'days after quote': elapsed,
                    match:
                      same && elapsed >= 0 && elapsed <= joined.window
                        ? 'YES'
                        : 'No',
                    reason: !same
                      ? 'Key mismatch'
                      : elapsed < 0
                        ? 'Before quote'
                        : elapsed > joined.window
                          ? 'Outside window'
                          : 'All checks pass',
                  };
                })}
                active={(r) => r.match === 'YES'}
              />
              <Grid
                title="Resulting learning rows"
                note={
                  aggregate
                    ? 'One row per quote line. Orders supply the label and separate realized value.'
                    : 'Unaggregated: L01 may appear twice. Repeated quote values would inflate a naive SUM.'
                }
                rows={lines
                  .filter(
                    (l) =>
                      !inner || customers.some((c) => c.account === l.account),
                  )
                  .flatMap((l) => {
                    const j = joinLine(l, days, gov);
                    const ids = j.orders === '—' ? ['—'] : j.orders.split(', ');
                    return (aggregate ? [j.orders] : ids).map((id) => ({
                      line: l.line,
                      account: l.account,
                      part: l.part,
                      type: j.type,
                      price: j.price,
                      'order IDs': id,
                      'quote value': l.quoted,
                      label: j.label,
                      ...(aggregate ? { 'order value': j.value } : {}),
                    }));
                  })}
                active={(r) => r.line === lineId}
                onPick={pick}
              />
              <Note
                title={
                  joined.matched > 1
                    ? 'Several orders can still mean one positive label'
                    : joined.label === 'Pending'
                      ? 'No order yet is not a final no-sale'
                      : 'Matching is evidence, not a perfect key'
                }
              >
                <p>
                  {lineId} matches {joined.matched} order line(s) under the
                  current window. Its label is <b>{joined.label}</b>. A positive
                  label asks whether at least one qualifying order exists;
                  revenue adds their values separately.
                </p>
                <p>
                  An inner customer join hides L04 because C is absent. A left
                  join keeps L04 and exposes NULL fields. If several quotes
                  could match one order, a real system needs ambiguity review.
                  These small examples do not resolve that problem.
                </p>
              </Note>
              <details className="panel">
                <summary>Read the join as a recipe</summary>
                <pre className="code">{`FROM quote_lines q\nLEFT JOIN customers c ON q.account = c.account\nLEFT JOIN parts p ON q.part = p.part\nMATCH orders ON account + part + sales_type\n  AND order_date >= quote_date\n  AND order_date <= quote_date + allowed_window\nGROUP BY quote_line\nlabel = any qualifying order?`}</pre>
                <p>
                  30/90 days are teaching settings. The paper describes
                  different customer windows but does not supply these
                  particular cut-offs.
                </p>
              </details>
            </>
          )}
          {stage === 2 && (
            <>
              <div className="controls">
                {(
                  [
                    ['duplicate', 'Remove duplicate export'],
                    ['leak', 'Remove all-missing customer rows'],
                    ['mar', 'Drop missing price (assume MAR)'],
                    ['mnar', 'Mark absent supplier Unknown'],
                  ] as const
                ).map(([key, label]) => (
                  <Check
                    key={key}
                    label={label}
                    value={rules[key]}
                    set={(v) => setRules({ ...rules, [key]: v })}
                  />
                ))}
              </div>
              <div className="stat-grid">
                <Stat label="Raw exported rows" value={cleaned.length} />
                <Stat
                  label="Retained rows"
                  value={cleaned.filter((x) => x.status === 'Retained').length}
                />
                <Stat
                  label="Removed rows"
                  value={cleaned.filter((x) => x.status === 'Removed').length}
                />
                <Stat
                  label="Pending labels (retained)"
                  value={
                    cleaned.filter(
                      (x) => x.status === 'Retained' && x.label === 'Pending',
                    ).length
                  }
                />
              </div>
              <Grid
                title="Before → after audit"
                note="L02 appears twice in the raw export. Every removal has a visible reason."
                rows={cleaned.map((x) => ({
                  line: x.line,
                  type: x.type,
                  price: x.price,
                  supplier: x.supplier,
                  label: x.label,
                  status: x.status,
                  reason: x.reason,
                }))}
                active={(r) => r.line === lineId}
                onPick={pick}
              />
              <div className="two-col">
                <Note title="The dangerous shortcut">
                  <p>
                    L04 has no customer fields after the sales-only master
                    lookup, and its mature label is “No sale.” The model could
                    learn <b>“blank means no sale”</b> from how the file was
                    created.
                  </p>
                  <p>
                    That is leakage: an accidental answer clue. Toggle removal
                    and watch L04 leave. It does not mean every blank in real
                    life predicts no sale.
                  </p>
                </Note>
                <section className="panel">
                  <h2>Different kinds of missing</h2>
                  <p>
                    <b>MCAR:</b> absence is unrelated to the data values.
                  </p>
                  <p>
                    <b>MAR:</b> absence can depend on observed information.
                  </p>
                  <p>
                    <b>MNAR:</b> absence depends on unobserved information.
                  </p>
                  <p className="annotation">
                    We assume Price is MAR and Supplier is MNAR only for this
                    exercise. Appearance alone cannot diagnose the mechanism.
                    The paper used expert discussion.
                  </p>
                </section>
              </div>
              <section className="panel">
                <h2>What about that 999,999?</h2>
                <p>
                  L07’s quoted amount looks suspicious. A value being large does
                  not prove it is wrong. The paper used a
                  three-standard-deviation training-data rule and checked
                  flagged entries. Quoted amount here is an audit example, not a
                  prediction-time feature.
                </p>
                <p>
                  Outlier rules and resampling belong inside training
                  partitions. Pending L09 should be retained in operational
                  records but withheld from training until its outcome matures.
                </p>
                <p className="muted">
                  Duplicate removal and pending-status tracking are explanatory
                  safeguards added in this lab; they are not claimed as
                  additional steps measured by the authors.
                </p>
              </section>
            </>
          )}
          {stage === 3 && (
            <>
              <div className="controls">
                <Check
                  label="Include future history (show leakage)"
                  value={future}
                  set={setFuture}
                />
                <Check
                  label="One-hot encode customer type"
                  value={encoded}
                  set={setEncoded}
                />
                <Range
                  label="Illustrative delivery window (days)"
                  value={delivery}
                  set={setDelivery}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              {future && (
                <div className="callout">
                  Leakage mode: April history now helps predict a
                  January/February request. The arithmetic is correct, but the
                  information was unavailable then.
                </div>
              )}
              <div className="two-col">
                <Grid
                  title={`Account ${line.account}: historical summaries`}
                  note={`Only records before ${line.date} should contribute. These summaries aggregate invented prior quotes and orders.`}
                  rows={hist.rows}
                />
                <section className="panel">
                  <p className="eyebrow">FROM HISTORY TO ONE CELL</p>
                  <h2>Account hit rate</h2>
                  <div className="formula">
                    {hist.sold} ÷ {hist.quoted} ={' '}
                    {hist.quoted ? pct(hist.hitRate) : 'No history'}
                  </div>
                  <p>
                    Sold quoted value ÷ total quoted value. This is value-based,
                    not a count of successful RFQs.
                  </p>
                  <h3>Customer frequency = {hist.frequency}</h3>
                  <p>
                    Sum the historical order-line appearances. H1 contributes
                    two appearances, not one, despite occupying one summary row
                    here.
                  </p>
                  <p className="annotation">
                    Future H6 changes A’s history. Select L01 and toggle future
                    data to see why “as of this date” matters.
                  </p>
                </section>
              </div>
              <Grid
                title="Feature row: clues only"
                note="The line ID is an identifier for this display, not a numeric predictor. No outcome column belongs in X."
                rows={[
                  {
                    line: lineId,
                    price: joined.price,
                    'customer frequency': hist.frequency,
                    'account hit rate': hist.quoted
                      ? Number(hist.hitRate.toFixed(3))
                      : null,
                    'stock proxy': delivery <= 7 ? 1 : 0,
                    ...(encoded
                      ? {
                          'is airline': joined.type === 'Airline' ? 1 : 0,
                          'is broker': joined.type === 'Broker' ? 1 : 0,
                        }
                      : { type: joined.type }),
                  },
                ]}
              />
              <div className="two-col">
                <section className="panel">
                  <h2>Categories become flags</h2>
                  <p>
                    Airline and Broker are names, not amounts. One-hot encoding
                    makes yes/no columns. Government is the reference category
                    here: both flags are zero.
                  </p>
                  <p>
                    A missing type also gives zero flags in this simple display,
                    so an unresolved row must not silently pass as Government.
                    The cleaning stage handles that leak.
                  </p>
                  <p>
                    <b>Stock proxy:</b> the paper approximated availability
                    using a delivery window of seven days or less. Moving the
                    slider changes that estimate; it does not recover a true
                    stock snapshot.
                  </p>
                </section>
                <section className="panel">
                  <h2>ABC encoding groups long tails</h2>
                  <p>
                    Imagine revenue shares A 60%, B 20%, C 15%, D 5%. Keep A and
                    B separate; group C and D in the final 80–100% cumulative
                    revenue band.
                  </p>
                  <Bars
                    max={100}
                    rows={[
                      { label: 'A · keep A', value: 60 },
                      { label: 'B · keep B', value: 20 },
                      { label: 'C · group 80–100', value: 15, color: 'green' },
                      { label: 'D · group 80–100', value: 5, color: 'green' },
                    ]}
                  />
                  <p className="muted">
                    Separate illustrative distribution; these shares are not
                    calculated from H1–H6. Actual study categories shrank from
                    1,288 to 14 accounts and 47,131 to 29 parts.
                  </p>
                </section>
              </div>
              <Note title="X is clues. y is the answer.">
                <p>
                  Training pairs a feature matrix <b>X</b> with historical
                  labels <b>y</b>. At arrival, a new row has X but no observed
                  y. A model predicts; the business must later record the real
                  outcome. Primary IDs link records; useful derived categories
                  or histories become features.
                </p>
              </Note>
            </>
          )}
          {(stage === 4 || stage === 5) && (
            <>
              <div className="controls">
                <div>
                  <p>Test fold</p>
                  <div className="choice-row">
                    {[0, 1, 2, 3, 4].map((f) => (
                      <button
                        key={f}
                        className="pill-button"
                        aria-pressed={fold === f}
                        onClick={() => setFold(f)}
                      >
                        {String.fromCharCode(65 + f)}
                      </button>
                    ))}
                  </div>
                </div>
                <Check
                  label="Undersample training only"
                  value={balance}
                  set={setBalance}
                />
                <Range
                  label="Teaching trees"
                  value={treeCount}
                  set={setTreeCount}
                  min={1}
                  max={9}
                  step={1}
                />
                {stage === 5 && (
                  <Range
                    label="Decision threshold"
                    value={threshold}
                    set={setThreshold}
                  />
                )}
              </div>
              <div className="notice">
                A separate 20-row teaching dataset gives each fold one sale and
                three non-sales. This miniature ensemble fits one-split trees
                using training data. It is not the paper’s full Random Forest;
                its scores are vote fractions, not calibrated probabilities.
              </div>
            </>
          )}
          {stage === 4 && (
            <>
              <div className="stat-grid">
                <Stat
                  label="Eligible training rows"
                  value={model.eligible.length}
                />
                <Stat
                  label="After training sampling"
                  value={model.training.length}
                />
                <Stat label="Untouched test rows" value={model.test.length} />
                <Stat label="Test sales share" value="25%" />
              </div>
              <section className="panel">
                <h2>Keep the test answers sealed</h2>
                <div className="chips">
                  {samples.map((s) => (
                    <span
                      key={s.id}
                      className={
                        'chip ' +
                        (s.fold === fold
                          ? 'test'
                          : !model.training.some((t) => t.id === s.id)
                            ? 'removed'
                            : '')
                      }
                    >
                      {s.id} · {String.fromCharCode(65 + s.fold)}
                    </span>
                  ))}
                </div>
                <p className="muted">
                  Green = held-out test. Crossed out = non-sale training rows
                  set aside by undersampling. Every fold takes a turn as test.
                </p>
                <div className="controls">
                  {(['hitRate', 'stock', 'price'] as Feature[]).map((f) => (
                    <Check
                      key={f}
                      label={f}
                      value={features.includes(f)}
                      set={(v) =>
                        setFeatures(
                          v
                            ? [...features, f]
                            : features.length > 1
                              ? features.filter((x) => x !== f)
                              : features,
                        )
                      }
                    />
                  ))}
                </div>
                <p>
                  Keep at least one feature. Toggling clues refits the teaching
                  trees. This is for exploration: choosing features repeatedly
                  from final test results would contaminate a real evaluation.
                </p>
              </section>
              <div className="two-col">
                <Grid
                  title="Training matrix + labels"
                  note="Only these rows influence the fitted split points."
                  rows={model.training.map((s) => ({
                    id: s.id,
                    ...Object.fromEntries(features.map((f) => [f, s[f]])),
                    label: s.label ? 'Sale' : 'No sale',
                  }))}
                />
                <Grid
                  title="Held-out inputs"
                  note="Labels are hidden here. Step 6 reveals them for evaluation."
                  rows={model.test.map((s) => ({
                    id: s.id,
                    ...Object.fromEntries(features.map((f) => [f, s[f]])),
                    label: 'Sealed',
                  }))}
                />
              </div>
              <Grid
                title="What the trees learned"
                note="Each small tree tests one feature. Gini gain measures how much the split reduces class mixing in its training subset."
                rows={model.trees.map((t, i) => ({
                  tree: `Tree ${i + 1}`,
                  question: `${t.feature} ≤ ${t.cut.toFixed(3)}?`,
                  'if yes': t.left ? 'Sale' : 'No sale',
                  'if no': t.right ? 'Sale' : 'No sale',
                  'Gini gain': t.gain.toFixed(3),
                }))}
              />
              <div className="two-col">
                <section className="panel">
                  <h2>Class mix</h2>
                  <Bars
                    max={16}
                    rows={[
                      {
                        label: 'Before · sales',
                        value: model.eligible.filter((x) => x.label).length,
                        color: 'green',
                      },
                      {
                        label: 'Before · non-sales',
                        value: model.eligible.filter((x) => !x.label).length,
                      },
                      {
                        label: 'After · sales',
                        value: model.training.filter((x) => x.label).length,
                        color: 'green',
                      },
                      {
                        label: 'After · non-sales',
                        value: model.training.filter((x) => !x.label).length,
                      },
                    ]}
                  />
                </section>
                <Note title="What is actually running here?">
                  <p>
                    For each tree, the lab tries cut-offs between observed
                    training values, picks the greatest Gini improvement, and
                    predicts the majority class on each side. The ensemble
                    averages its binary votes.
                  </p>
                  <p>
                    For variety, trees cycle through enabled features and
                    deterministic subsets. This is an intentionally small
                    demonstration, not a standard bootstrapped Random Forest.
                    Real tuning uses validation inside training; a final test
                    remains untouched.
                  </p>
                </Note>
              </div>
              <button className="next" onClick={() => setStage(5)}>
                Reveal held-out outcomes <ArrowRight size={17} />
              </button>
            </>
          )}
          {stage === 5 && (
            <>
              <div className="stat-grid">
                <Stat
                  label="Precision · selected that were sales"
                  value={pct(metrics.precision)}
                />
                <Stat
                  label="Recall · actual sales found"
                  value={pct(metrics.recall)}
                />
                <Stat label="F1 · harmonic balance" value={pct(metrics.f1)} />
                <Stat
                  label="Predicted sales / 4 test rows"
                  value={metrics.tp + metrics.fp}
                />
              </div>
              <div className="two-col">
                <section className="panel">
                  <h2>Four piles, different mistakes</h2>
                  <div className="cell-grid">
                    <div className="matrix-cell">
                      <b>{metrics.tp}</b>True positive
                      <br />
                      <small>Predict sale / actual sale</small>
                    </div>
                    <div className="matrix-cell bad">
                      <b>{metrics.fp}</b>False positive
                      <br />
                      <small>Predict sale / actual no sale</small>
                    </div>
                    <div className="matrix-cell bad">
                      <b>{metrics.fn}</b>False negative
                      <br />
                      <small>Predict no sale / actual sale</small>
                    </div>
                    <div className="matrix-cell">
                      <b>{metrics.tn}</b>True negative
                      <br />
                      <small>Predict no sale / actual no sale</small>
                    </div>
                  </div>
                  <p className="muted">
                    Precision = TP / (TP + FP). Recall = TP / (TP + FN). “Not
                    defined” means the denominator is zero.
                  </p>
                </section>
                <section className="panel">
                  <h2>Threshold trade-off</h2>
                  <svg
                    viewBox="0 0 540 280"
                    aria-label="Precision in blue and recall in green as the threshold rises from 0 to 1"
                  >
                    <line x1="45" y1="235" x2="515" y2="235" stroke="#92a7c0" />
                    <line x1="45" y1="25" x2="45" y2="235" stroke="#92a7c0" />
                    {[0, 0.5, 1].map((x) => (
                      <g key={x}>
                        <text
                          x={45 + x * 470}
                          y="258"
                          textAnchor="middle"
                          fontSize="14"
                          fill="#52647c"
                        >
                          {x}
                        </text>
                        <text
                          x="33"
                          y={239 - x * 210}
                          textAnchor="end"
                          fontSize="14"
                          fill="#52647c"
                        >
                          {x}
                        </text>
                      </g>
                    ))}
                    {(['precision', 'recall'] as const).map((key, i) => (
                      <polyline
                        key={key}
                        fill="none"
                        stroke={i ? '#148575' : '#1759cc'}
                        strokeWidth="3"
                        points={Array.from({ length: 101 }, (_, n) => {
                          const v = evaluate(model.test, n / 100)[key];
                          return v === null
                            ? ''
                            : `${45 + (n / 100) * 470},${235 - v * 210}`;
                        })
                          .filter(Boolean)
                          .join(' ')}
                      />
                    ))}
                    <line
                      x1={45 + threshold * 470}
                      x2={45 + threshold * 470}
                      y1="25"
                      y2="235"
                      stroke="#a55d16"
                      strokeDasharray="5 4"
                    />
                  </svg>
                  <p className="muted">
                    Blue: precision · Green: recall · Dashed: selected
                    threshold. Precision ends where no rows are selected. Curves
                    come from these four test rows, not the paper.
                  </p>
                </section>
              </div>
              <Grid
                title="Predictions beside actual answers"
                note="Click an ID to inspect the votes. The outcome column did not train these trees."
                rows={model.test.map((r) => ({
                  id: r.id,
                  hitRate: r.hitRate,
                  stock: r.stock,
                  price: r.price,
                  score: r.score.toFixed(3),
                  prediction: r.score >= threshold ? 'Sale' : 'No sale',
                  actual: r.label ? 'Sale' : 'No sale',
                  result:
                    r.score >= threshold === Boolean(r.label)
                      ? 'Correct'
                      : 'Error',
                }))}
                active={(r) => r.id === selectedTest.id}
                onPick={(r) => setTestId(String(r.id))}
              />
              <section className="panel">
                <h2>{selectedTest.id}: follow the votes</h2>
                <div className="flow-steps">
                  {selectedTest.votes.map((v, i) => (
                    <span key={i}>
                      Tree {i + 1}
                      <br />
                      <b>{v ? 'Sale' : 'No sale'}</b>
                    </span>
                  ))}
                  <ArrowRight />
                  <span>
                    <b>{selectedTest.score.toFixed(3)}</b>
                    <br />
                    average vote
                  </span>
                </div>
                <p>
                  {selectedTest.votes.filter(Boolean).length} of {treeCount}{' '}
                  trees vote sale. At threshold {threshold.toFixed(2)}, the
                  prediction is{' '}
                  <b>{selectedTest.score >= threshold ? 'Sale' : 'No sale'}</b>.
                  The real label is{' '}
                  <b>{selectedTest.label ? 'Sale' : 'No sale'}</b>.
                </p>
              </section>
              <Note title="A better metric is not automatically more money">
                <p>
                  Lowering the cut-off usually selects more requests and can
                  find more sales, at the cost of extra false positives. Staff
                  time and margins may differ. F1 balances classification
                  measures; it does not price those costs. Four examples make
                  the mechanics visible but do not establish a reliable
                  operating policy.
                </p>
              </Note>
            </>
          )}
          {stage === 6 && (
            <>
              <div className="two-col">
                <section className="panel">
                  <label htmlFor="email-input">
                    <h2>Try an incoming message</h2>
                  </label>
                  <textarea
                    id="email-input"
                    className="field-input"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={3000}
                  />
                  <div className="controls">
                    <Check
                      label="Preserve hyphens"
                      value={preserve}
                      set={setPreserve}
                    />
                    <Check
                      label="Exclude number 42"
                      value={exclude}
                      set={setExclude}
                    />
                  </div>
                  <div className="choice-row">
                    <button
                      className="pill-button"
                      onClick={() =>
                        setMessage(
                          'From: buyer@aero.example\nPlease quote AB-12-CD and V1. Ship to 42 Main Street.',
                        )
                      }
                    >
                      Known customer
                    </button>
                    <button
                      className="pill-button"
                      onClick={() =>
                        setMessage(
                          'From: buyer@newair.example\nPlease quote P2.',
                        )
                      }
                    >
                      New customer
                    </button>
                    <button
                      className="pill-button"
                      onClick={() =>
                        setMessage(
                          'From: buyer@aero.example\nPlease quote part 42.',
                        )
                      }
                    >
                      42 really is a part
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <h2>Text → tokens → candidates</h2>
                  <p className="muted">
                    Tiny dictionary: V1, P2, V3, AB-12-CD, 12, 42
                  </p>
                  <div className="chips">
                    {parsed.tokens.map((t, i) => (
                      <span
                        className={
                          'chip ' + (parsed.found.includes(t) ? 'test' : '')
                        }
                        key={i}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="annotation">
                    Candidates: <b>{parsed.found.join(', ') || 'None'}</b>
                    <br />
                    Domain: {parsed.domain || 'Not found'}
                    <br />
                    Account: {parsed.account || 'Unresolved'}
                  </p>
                </section>
              </div>
              <Grid
                title="Proposed structured intake"
                rows={
                  parsed.found.length
                    ? parsed.found.map((p) => ({
                        candidate: p,
                        account: parsed.account,
                        lookup: parts.some((x) => x.part === p)
                          ? 'In toy part master'
                          : 'Needs verification',
                        route: !parsed.account
                          ? 'Manual customer review'
                          : !parts.some((x) => x.part === p)
                            ? 'Manual part review'
                            : 'Eligible for further checks',
                      }))
                    : []
                }
              />
              <Note title="The matcher does not understand the request">
                <p>
                  Turn hyphen preservation off: AB-12-CD breaks into pieces and
                  “12” can match incorrectly. “42” may be a street number or a
                  genuine part. Excluding it fixes one false match but can hide
                  a real request.
                </p>
                <p>
                  An unresolved account needs review, not an automatic no-sale.
                  This is a basic dictionary/token demonstration, not spaCy or a
                  trained NER model. Even a recognized account and part still
                  require verified features and business controls before
                  scoring.
                </p>
              </Note>
              <div className="flow-steps">
                <span>Email</span>
                <ArrowRight />
                <span>Validate identities</span>
                <ArrowRight />
                <span>Build available features</span>
                <ArrowRight />
                <span>Score + staff decision</span>
                <ArrowRight />
                <span>Record actual outcome</span>
              </div>
            </>
          )}
          {stage === 7 && (
            <>
              <div className="stat-grid">
                <Stat
                  label="Historical quote lines, 2012–2019"
                  value="~180,000"
                />
                <Stat label="Selected input features" value="13" />
                <Stat label="Selected Random Forest trees" value="400" />
                <Stat label="Selected threshold" value="0.62" />
              </div>
              <div className="two-col">
                <section className="panel">
                  <h2>Different denominators</h2>
                  <Bars
                    max={100}
                    rows={[
                      { label: 'RFQ success', value: 17 },
                      { label: 'Quote-line baseline', value: 19 },
                      { label: 'Model precision', value: 48.5, color: 'green' },
                      { label: 'Model recall', value: 66.9, color: 'green' },
                    ]}
                  />
                  <p>
                    17% describes the stated RFQ success ratio. 19% describes
                    the quote-line dataset. Precision is 48.5% among predicted
                    sales; recall is 66.9% among actual sales.
                  </p>
                  <p className="annotation">
                    (48.5 − 19) ÷ 19 ≈ 155.3% relative improvement. It is not
                    measured revenue growth. The absolute difference is 29.5
                    percentage points.
                  </p>
                </section>
                <section className="panel">
                  <h2>Model selection, then tuning</h2>
                  <Bars
                    max={60}
                    rows={[
                      { label: 'Logistic · selected', value: 46.69 },
                      { label: 'Boosting · selected', value: 48.84 },
                      { label: 'Forest · selected', value: 54.26 },
                      { label: 'Forest · final', value: 56.24, color: 'green' },
                    ]}
                  />
                  <p>
                    F1 percentages. The first three are after feature selection
                    (Table 1); the final forest includes later tuning and
                    threshold choice. Different stages must not be confused.
                  </p>
                  <p>
                    <b>ROC-AUC: 0.83.</b> Ranking separation, not 83% accuracy.
                    The paper also reports roughly 80% specificity.
                  </p>
                </section>
              </div>
              <Grid
                title="The selected 13 features"
                note="Reported importance order, Table 6. These are original feature groups before dummy-column expansion."
                rows={[
                  'Account hit rate',
                  'Account frequency',
                  'Main supplier list price',
                  'Part frequency',
                  'Account (ABC)',
                  'Customer type',
                  'Stock proxy',
                  'Part (ABC)',
                  'Supplier (ABC)',
                  'Part manufacturer (ABC)',
                  'Rotable',
                  'Regional sales manager',
                  'Supplier type',
                ].map((f, i) => ({ rank: i + 1, feature: f }))}
              />
              <div className="two-col">
                <Note title="What the experiment supports">
                  <p>
                    The study supports more promising selection within evaluated
                    historical quote lines. Training was balanced to 54,874
                    lines after undersampling. An NLP proof of concept found
                    correct parts in all 100 tested RFQs, but also found extra
                    false matches.
                  </p>
                  <p>
                    The authors propose prioritizing by predicted sale
                    probability until capacity is used and reserving manual
                    capacity for new customers. They do not specify that
                    reserve’s percentage.
                  </p>
                </Note>
                <section className="panel">
                  <h2>What still needs evidence</h2>
                  <p>
                    Unpursued RFQs lack labels. Order linkage is approximate.
                    Stock history was reconstructed. Customer email mapping
                    blocked full automation. New customers are outside the
                    described model’s coverage.
                  </p>
                  <p>
                    Actual revenue, response-time improvement, fairness, and
                    reliable live operation need a prospective test. Retraining
                    alone does not guarantee that selective historical bias
                    disappears.
                  </p>
                </section>
              </div>
              <section className="panel">
                <h2>Source and teaching boundaries</h2>
                <p>
                  Rohaan, D., Topan, E., & Groothuis-Oudshoorn, C.G.M. (2022).{' '}
                  <i>
                    Using supervised machine learning for B2B sales forecasting:
                    A case study of spare parts sales forecasting at an
                    after-sales service provider.
                  </i>{' '}
                  Expert Systems with Applications, 188, 115925.
                </p>
                <p>
                  <a
                    href="https://doi.org/10.1016/j.eswa.2021.115925"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original article ↗
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CC BY 4.0
                  </a>
                </p>
                <p>
                  The explanation, invented records, controls, diagrams, and
                  small tree learner are an educational adaptation. Step 4’s ABC
                  distribution and steps 5–6’s training rows are explicitly
                  separate examples, not rows derived from the raw-record
                  exercise. The original authors did not endorse this app.
                </p>
              </section>
            </>
          )}
          <footer className="lesson-foot">
            Source: Rohaan et al. · {sources[stage]}. Page numbers refer to the
            supplied 13-page PDF. Explanatory controls and toy data are added
            teaching material.
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
