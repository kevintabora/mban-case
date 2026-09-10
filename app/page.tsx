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
  'Imagine you are beside a sales employee as a customer’s email arrives: “Can you quote these spare parts?” Preparing a quote takes work, and a request may never become a sale. Before an analyst can help the team decide which requests deserve attention, they must find out what the company recorded. Start with the email below, then follow one offered part through the separate tables.',
  'The analyst now has the files, but each tells only part of the story. The quote table says what was offered; the customer and part files describe who and what; the order table records what was bought. The next job is to bring those pieces together and ask: did this offered item lead to a sale? Change the matching rules below to see why that answer needs care.',
  'The records are connected, but the analyst is not ready to trust them. One line appears twice, some cells are blank, and a suspiciously large amount needs checking. Simply deleting everything unusual could throw away useful evidence. Work through the cleaning rules below as if you were reviewing the export with the staff who know how the records were created.',
  'With the records checked, the analyst asks what the sales team could have known when each request arrived. A customer’s earlier buying history might help; a sale that happens next month cannot. This step turns the available history into a few useful clues, called features. Follow how several old records become single cells in the row the model will read.',
  'The analyst has prepared the clues and found the historical answers. Now it is time to learn a pattern: which combinations of clues tend to appear beside a sale? For this lesson, we switch to a separate set of 20 invented examples so you can inspect every row. The analyst lets a small group of trees practice on some examples while keeping others aside for a fair test.',
  'The trees have finished practicing. Now the analyst opens the answers that were kept aside and checks the predictions against what actually happened. But the sales team needs more than a score: it needs a way to decide which requests to consider first. Move the cut-off below and watch how a stricter or more generous selection changes both the opportunities found and the mistakes made.',
  'So far, the analyst has worked with neatly arranged historical rows. Back at the sales desk, the next request arrives as an email, with part numbers mixed into ordinary sentences. Before a model could score it, someone must identify the customer and the requested parts. Try the small dictionary matcher below to see how text can become a proposed table—and where a staff member still needs to check it.',
  'We have followed an imagined request from the inbox to a prediction. Now we step back from the teaching examples and ask what the researchers actually found. Their study used far more records and a full Random Forest. Read the results below as evidence about selecting promising historical quote lines, then consider what the team would still need to prove in daily use.',
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
                  note="The employee records each offered part on its own line. One email can therefore create several rows. Choose a line ID to follow that item."
                  rows={lines}
                  active={(r) => r.line === lineId}
                  onPick={pick}
                />
              </div>
              <div className="two-col">
                <Grid
                  title="Customer master"
                  note="The analyst looks up the customer by account ID instead of repeating their details on every quote. Each row describes one account; C is deliberately missing from this file."
                  rows={customers}
                  active={(r) => r.account === line.account}
                />
                <Grid
                  title="Part master"
                  note="The part ID leads to a separate description of the item. Each row describes one part. A NULL cell means the file contains no value there; it does not mean zero."
                  rows={parts}
                  active={(r) => r.part === line.part}
                />
              </div>
              <Grid
                title="Sales-order table"
                note="Later, a purchase creates an order record. Unfortunately, these records do not name the original quote line. Green rows share its account and part, giving the analyst possible matches to investigate next."
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
                  Follow R1: the customer sends one request, but the employee
                  offers two items, recorded as L01 and L02. If an item is later
                  purchased, that purchase appears in the order table, with its
                  own ID such as O1. These are different events, so counting
                  emails, quote lines, and order lines answers different
                  questions. The analyst keeps those units clear before
                  connecting the files. IDs help find the records; their digits
                  do not measure how likely a sale is.
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
                  note="Using the selected line’s account and part IDs, the analyst copies the matching descriptive fields into one view. This lookup is the first part of the join."
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
                  Next, the analyst checks whether connecting the files has
                  quietly lost a request. Try L04 and turn on the inner customer
                  join: it disappears because account C is absent from the
                  customer file. A left join keeps the quote and shows the
                  missing details as NULL. There is another question for staff:
                  could one order belong to several earlier quotes? A real
                  system needs a review rule for that ambiguity; this small
                  exercise does not settle it.
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
                    Imagine the analyst asking why L04 has no customer details.
                    In this example, the lookup file contains only customers
                    with sales. L04’s mature outcome is “No sale,” so the
                    missing details can accidentally reveal the answer. A model
                    might learn <b>“blank means no sale”</b> instead of learning
                    a useful pattern about a new request.
                  </p>
                  <p>
                    This is called leakage: information about the answer has
                    slipped into the clues. Turn on removal to see how excluding
                    this affected row changes the dataset. The reason matters:
                    the analyst is addressing how this file was made, not
                    assuming that every blank in real life means a lost sale.
                  </p>
                </Note>
                <section className="panel">
                  <h2>Different kinds of missing</h2>
                  <p>
                    <b>MCAR — missing completely at random:</b> imagine an
                    accidental loss of cells unrelated to any record’s values.
                    The analyst cannot explain the gaps using those values.
                  </p>
                  <p>
                    <b>MAR — missing at random:</b> the gaps may be related to
                    information that is recorded. For example, one recorded
                    supplier group might use a form that leaves price blank.
                    After accounting for the observed information, missingness
                    does not depend on the missing value itself.
                  </p>
                  <p>
                    <b>MNAR — missing not at random:</b> even after considering
                    the recorded information, the gaps depend on something
                    unobserved. Imagine unusually high prices being withheld
                    because they are high. The missingness itself is selective.
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
                  The analyst pauses at L07’s quoted amount: 999,999. Was this a
                  typing error or an unusually large quote? The number alone
                  cannot answer that, so it needs checking rather than automatic
                  deletion. The paper used a three-standard-deviation
                  training-data rule and checked flagged entries. Quoted amount
                  here is an audit example, not a prediction-time feature.
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
                    The analyst adds the quoted value that turned into sales,
                    then divides by all quoted value in the available history.
                    This asks how much of the offered value became business. It
                    is value-based, so it differs from counting how many
                    requests succeeded.
                  </p>
                  <h3>Customer frequency = {hist.frequency}</h3>
                  <p>
                    Next, the analyst counts the customer’s historical
                    order-line appearances. Notice that H1 already summarizes
                    two appearances. Counting H1 as just one because it occupies
                    one row here would lose part of that history.
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
                    The analyst also wants the model to use customer type.
                    Calling Airline “1” and Broker “2” could suggest a numeric
                    order that does not exist. Instead, one-hot encoding asks
                    separate yes/no questions: is this an airline? Is it a
                    broker? Government is the reference category here, so both
                    flags are zero for that known type.
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
                  The analyst now has two things to keep separate. <b>X</b> is
                  the table of clues available at the time of a request;
                  <b> y</b> is the later answer, sale or no sale. Historical
                  examples have both, which lets the model learn. A new request
                  has only the clues. The model must predict its answer, and the
                  staff must later record what really happened. That is the
                  handoff from preparing data to training a model.
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
                <p>
                  Think of the analyst dividing a workbook into practice pages
                  and an exam. Each letter below marks one group, called a fold.
                  The chosen fold is the exam: its answers must not influence
                  what the trees learn. Switching folds gives a different group
                  a turn as the exam, with the remaining groups used for
                  practice.
                </p>
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
                  note="These are the practice examples. The learner can see both the clues and the answers, and uses them to choose where each tree splits."
                  rows={model.training.map((s) => ({
                    id: s.id,
                    ...Object.fromEntries(features.map((f) => [f, s[f]])),
                    label: s.label ? 'Sale' : 'No sale',
                  }))}
                />
                <Grid
                  title="Held-out inputs"
                  note="These are the exam examples. The trees receive the clues, but their answers stayed out of training. In the next step, the analyst reveals them to check the predictions."
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
                  <p>
                    The practice pile contains more non-sales than sales. The
                    analyst can set aside some non-sale examples so the learner
                    gets a more balanced practice set. This is undersampling.
                    Toggle it above and compare the bars. The test pile keeps
                    its original mix, so the exam is not made easier by
                    balancing it.
                  </p>
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
                    A small tree is learning one question, such as whether a hit
                    rate is below a certain value. The lab tries cut-offs
                    between the observed training values and chooses the one
                    that best separates sales from non-sales. That improvement
                    is measured by Gini gain. On each side, the tree predicts
                    whichever answer is more common there. The group, or
                    ensemble, then averages the trees’ sale/no-sale votes.
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
                  <p>
                    The analyst sorts each tested request by two answers: what
                    the model predicted and what actually happened. A false
                    positive is a request selected as a likely sale that did not
                    sell. A false negative is a sale the model missed. For the
                    sales team, these suggest different concerns: spending
                    effort on an unsuccessful request or overlooking an
                    opportunity.
                  </p>
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
                  <p>
                    Imagine the team asking for a shorter list of promising
                    requests. Raising the threshold requires a higher share of
                    sale votes before a row is selected. Lowering it lets more
                    rows through. Watch the selected rows alongside precision
                    and recall; a shorter list is not automatically a better
                    one.
                  </p>
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
                  Before choosing a working cut-off, the analyst would sit down
                  with the sales team. How long does a quote take to prepare?
                  How valuable is a missed sale? Precision asks how many
                  selected requests really sold; recall asks how many actual
                  sales were found. F1 combines those measures, but does not
                  account for staff time or profit margins. These four examples
                  let you see the decisions move; they are too few to establish
                  a reliable policy for the business.
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
                  <p>
                    The employee can read the message as a sentence. The matcher
                    takes a simpler approach: break it into pieces and look for
                    known part numbers. Edit the message or try the examples to
                    see which pieces it recognizes.
                  </p>
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
                note="Each candidate part becomes a proposed row. Before this could join the customer and part tables from step 1, the employee needs to check that the identities are right. These rows are not yet model predictions."
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
                  Imagine the employee comparing the proposed table with the
                  original email. With hyphen preservation off, AB-12-CD breaks
                  into pieces and “12” can be mistaken for a requested part. The
                  matcher can also mistake the street number “42” for a part.
                  Try excluding it, then try the message where 42 really is the
                  part number. A rule that fixes one message can damage another,
                  which is why recognition still needs checking.
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
                  <p>
                    When the analyst presents these figures to the sales team,
                    the first question should be “a percentage of which group?”
                    An email can contain several offered items, and the model
                    selects only some items as likely sales. The bars below
                    describe different groups, so they need to be read with
                    their definitions.
                  </p>
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
                  <p>
                    The researchers first compared different kinds of models
                    after selecting features. They then refined the Random
                    Forest and chose its decision threshold. Read the first
                    three bars as the comparison between model types, and the
                    last as the forest’s later result.
                  </p>
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
                    Before putting this into daily use, the team has unfinished
                    work. Requests it never pursued have no sales labels to
                    learn from. The analyst has linked orders approximately and
                    reconstructed stock history, rather than observing perfect
                    records. Mapping customer emails also blocked full
                    automation, and the described model does not cover new
                    customers. These gaps affect which requests it can judge.
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
