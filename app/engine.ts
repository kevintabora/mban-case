export const customers = [
  { account: 'A', name: 'Aero North', type: 'Airline', domain: 'aero.example' },
  {
    account: 'B',
    name: 'Bolt Trading',
    type: 'Broker',
    domain: 'bolt.example',
  },
  {
    account: 'D',
    name: 'Public Air',
    type: 'Government',
    domain: 'public.example',
  },
];
export const parts = [
  {
    part: 'V1',
    description: 'Valve',
    price: 100,
    supplier: 'S1',
    rotable: 'No',
  },
  {
    part: 'P2',
    description: 'Pump',
    price: 200,
    supplier: 'S2',
    rotable: 'Yes',
  },
  {
    part: 'V3',
    description: 'Seal',
    price: null,
    supplier: null,
    rotable: 'No',
  },
];
export const rfqs = [
  {
    rfq: 'R1',
    from: 'buyer@aero.example',
    date: '2019-01-10',
    subject: 'Valve and pump quotation',
    body: 'Please quote 2 × V1 valves and 1 × P2 pump. Delivery address: 42 Main Street.',
  },
  {
    rfq: 'R2',
    from: 'sales@bolt.example',
    date: '2019-01-11',
    subject: 'V1 availability',
    body: 'Please send a quote for V1.',
  },
  {
    rfq: 'R3',
    from: 'buyer@coast.example',
    date: '2019-01-12',
    subject: 'Pump inquiry',
    body: 'What is your price for P2?',
  },
  {
    rfq: 'R4',
    from: 'office@public.example',
    date: '2019-01-13',
    subject: 'Seal request',
    body: 'Please quote V3 for our maintenance team.',
  },
  {
    rfq: 'R5',
    from: 'sales@bolt.example',
    date: '2019-01-14',
    subject: 'Seal and pump',
    body: 'Please quote V3 and P2.',
  },
  {
    rfq: 'R6',
    from: 'buyer@aero.example',
    date: '2019-01-15',
    subject: 'Pump exchange',
    body: 'Please quote a P2 exchange.',
  },
  {
    rfq: 'R7',
    from: 'new@newair.example',
    date: '2019-01-16',
    subject: 'New customer',
    body: 'We are a new customer. Please quote V1.',
  },
  {
    rfq: 'R8',
    from: 'sales@bolt.example',
    date: '2019-02-25',
    subject: 'Another valve',
    body: 'Please quote V1 for a new job.',
  },
];
export const lines = [
  {
    line: 'L01',
    rfq: 'R1',
    account: 'A',
    part: 'V1',
    date: '2019-01-10',
    salesType: 'Outright',
    quoted: 200,
  },
  {
    line: 'L02',
    rfq: 'R1',
    account: 'A',
    part: 'P2',
    date: '2019-01-10',
    salesType: 'Outright',
    quoted: 200,
  },
  {
    line: 'L03',
    rfq: 'R2',
    account: 'B',
    part: 'V1',
    date: '2019-01-11',
    salesType: 'Outright',
    quoted: 100,
  },
  {
    line: 'L04',
    rfq: 'R3',
    account: 'C',
    part: 'P2',
    date: '2019-01-12',
    salesType: 'Outright',
    quoted: 200,
  },
  {
    line: 'L05',
    rfq: 'R4',
    account: 'D',
    part: 'V3',
    date: '2019-01-13',
    salesType: 'Outright',
    quoted: 80,
  },
  {
    line: 'L06',
    rfq: 'R5',
    account: 'B',
    part: 'V3',
    date: '2019-01-14',
    salesType: 'Outright',
    quoted: 80,
  },
  {
    line: 'L07',
    rfq: 'R6',
    account: 'A',
    part: 'P2',
    date: '2019-01-15',
    salesType: 'Exchange',
    quoted: 999999,
  },
  {
    line: 'L08',
    rfq: 'R5',
    account: 'B',
    part: 'P2',
    date: '2019-01-14',
    salesType: 'Outright',
    quoted: 200,
  },
  {
    line: 'L09',
    rfq: 'R8',
    account: 'B',
    part: 'V1',
    date: '2019-02-25',
    salesType: 'Outright',
    quoted: 100,
  },
];
export const orders = [
  {
    order: 'O1',
    account: 'A',
    part: 'V1',
    salesType: 'Outright',
    date: '2019-01-15',
    value: 100,
  },
  {
    order: 'O2',
    account: 'A',
    part: 'V1',
    salesType: 'Outright',
    date: '2019-01-25',
    value: 100,
  },
  {
    order: 'O3',
    account: 'B',
    part: 'V1',
    salesType: 'Outright',
    date: '2019-01-20',
    value: 100,
  },
  {
    order: 'O4',
    account: 'B',
    part: 'V3',
    salesType: 'Outright',
    date: '2019-02-01',
    value: 80,
  },
  {
    order: 'O5',
    account: 'D',
    part: 'V3',
    salesType: 'Outright',
    date: '2019-03-01',
    value: 80,
  },
];
export const history = [
  {
    record: 'H1',
    account: 'A',
    part: 'V1',
    date: '2018-11-01',
    quoted: 500,
    sold: 200,
    orderLines: 2,
  },
  {
    record: 'H2',
    account: 'A',
    part: 'P2',
    date: '2018-12-01',
    quoted: 500,
    sold: 200,
    orderLines: 1,
  },
  {
    record: 'H3',
    account: 'B',
    part: 'V1',
    date: '2018-11-04',
    quoted: 400,
    sold: 100,
    orderLines: 1,
  },
  {
    record: 'H4',
    account: 'B',
    part: 'V3',
    date: '2018-12-08',
    quoted: 200,
    sold: 0,
    orderLines: 0,
  },
  {
    record: 'H5',
    account: 'D',
    part: 'V3',
    date: '2018-12-10',
    quoted: 300,
    sold: 100,
    orderLines: 1,
  },
  {
    record: 'H6',
    account: 'A',
    part: 'V1',
    date: '2019-04-01',
    quoted: 1000,
    sold: 1000,
    orderLines: 5,
  },
];
export type Line = (typeof lines)[number];
export function joinLine(l: Line, days = 30, government = true) {
  const c = customers.find((x) => x.account === l.account);
  const p = parts.find((x) => x.part === l.part);
  const window = government && c?.type === 'Government' ? 90 : days;
  const matches = orders.filter(
    (o) =>
      o.account === l.account &&
      o.part === l.part &&
      o.salesType === l.salesType &&
      Date.parse(o.date) >= Date.parse(l.date) &&
      Date.parse(o.date) - Date.parse(l.date) <= window * 86400000,
  );
  const mature =
    Date.parse('2019-03-02') - Date.parse(l.date) >= window * 86400000;
  return {
    ...l,
    type: c?.type ?? null,
    price: p?.price ?? null,
    supplier: p?.supplier ?? null,
    orders: matches.map((x) => x.order).join(', ') || '—',
    matched: matches.length,
    value: matches.reduce((s, x) => s + x.value, 0),
    label: matches.length ? 'Sale' : mature ? 'No sale' : 'Pending',
    window,
  };
}
export const rawExport = [...lines, lines[1]];
export type Rules = {
  duplicate: boolean;
  leak: boolean;
  mar: boolean;
  mnar: boolean;
};
export function clean(rules: Rules) {
  const seen = new Set<string>();
  return rawExport.map((l) => {
    const j = joinLine(l);
    const reasons = [];
    if (rules.duplicate && seen.has(l.line)) reasons.push('Duplicate export');
    seen.add(l.line);
    if (rules.leak && j.type === null)
      reasons.push('All customer fields absent');
    if (rules.mar && j.price === null)
      reasons.push('Missing price (assumed MAR)');
    return {
      ...j,
      supplier: j.supplier ?? (rules.mnar ? 'Unknown' : null),
      status: reasons.length ? 'Removed' : 'Retained',
      reason:
        reasons.join(' + ') ||
        (j.label === 'Pending'
          ? 'Keep record; not ready for training'
          : 'Ready for next checks'),
    };
  });
}
export function featureHistory(l: Line, future = false) {
  const rows = history.filter(
    (h) => h.account === l.account && (future || h.date < l.date),
  );
  const quoted = rows.reduce((s, x) => s + x.quoted, 0);
  const sold = rows.reduce((s, x) => s + x.sold, 0);
  return {
    rows,
    quoted,
    sold,
    hitRate: quoted ? sold / quoted : 0,
    frequency: rows.reduce((s, x) => s + x.orderLines, 0),
  };
}
export type Feature = 'hitRate' | 'stock' | 'price';
export type Sample = {
  id: string;
  fold: number;
  hitRate: number;
  stock: number;
  price: number;
  label: number;
};
export const samples: Sample[] = Array.from({ length: 20 }, (_, i) => ({
  id: `T${String(i + 1).padStart(2, '0')}`,
  fold: i % 5,
  hitRate: [
    0.8, 0.2, 0.35, 0.55, 0.65, 0.1, 0.7, 0.25, 0.45, 0.6, 0.3, 0.4, 0.85, 0.15,
    0.5, 0.2, 0.75, 0.55, 0.1, 0.65,
  ][i],
  stock: [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1][i],
  price: [
    100, 400, 80, 700, 150, 200, 300, 120, 90, 220, 350, 180, 90, 500, 240, 300,
    180, 60, 450, 130,
  ][i],
  label: i % 4 === 0 ? 1 : 0,
}));
const impurity = (r: Sample[]) => {
  if (!r.length) return 0;
  const p = r.reduce((s, x) => s + x.label, 0) / r.length;
  return 2 * p * (1 - p);
};
export function fitTree(rows: Sample[], feature: Feature) {
  let best = { feature, cut: 0, left: 0, right: 0, gain: -1 };
  const values = [...new Set(rows.map((x) => x[feature]))].sort(
    (a, b) => a - b,
  );
  for (let i = 0; i < values.length - 1; i++) {
    const cut = (values[i] + values[i + 1]) / 2;
    const left = rows.filter((x) => x[feature] <= cut),
      right = rows.filter((x) => x[feature] > cut);
    const gain =
      impurity(rows) -
      (left.length * impurity(left) + right.length * impurity(right)) /
        rows.length;
    const vote = (r: Sample[]) =>
      r.reduce((s, x) => s + x.label, 0) / r.length >= 0.5 ? 1 : 0;
    if (gain > best.gain)
      best = { feature, cut, left: vote(left), right: vote(right), gain };
  }
  if (best.gain < 0) {
    const vote =
      rows.length && rows.reduce((s, x) => s + x.label, 0) / rows.length >= 0.5
        ? 1
        : 0;
    return { ...best, left: vote, right: vote, gain: 0 };
  }
  return best;
}
export function train(
  fold: number,
  balance: boolean,
  features: Feature[],
  count: number,
) {
  const test = samples.filter((x) => x.fold === fold);
  const eligible = samples.filter((x) => x.fold !== fold);
  const positive = eligible.filter((x) => x.label === 1),
    negative = eligible.filter((x) => !x.label);
  const training = balance
    ? [...positive, ...negative.slice(0, positive.length)]
    : eligible;
  const used = features.length ? features : ['hitRate' as Feature];
  const trees = Array.from({ length: count }, (_, i) => {
    const subset = training.filter((_, j) => count === 1 || (j + i) % 4 !== 0);
    return fitTree(subset, used[i % used.length]);
  });
  const predicted = test.map((x) => {
    const votes = trees.map((t) => (x[t.feature] <= t.cut ? t.left : t.right));
    return {
      ...x,
      votes,
      score: votes.reduce((s, n) => s + n, 0) / trees.length,
    };
  });
  return { eligible, training, test: predicted, trees };
}
export function evaluate(
  rows: { score: number; label: number }[],
  threshold: number,
) {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
  for (const r of rows) {
    if (r.score >= threshold) {
      if (r.label) tp++;
      else fp++;
    } else if (r.label) fn++;
    else tn++;
  }
  const precision = tp + fp ? tp / (tp + fp) : null;
  const recall = tp + fn ? tp / (tp + fn) : null;
  return {
    tp,
    fp,
    fn,
    tn,
    precision,
    recall,
    f1:
      precision !== null && recall !== null
        ? precision + recall
          ? (2 * precision * recall) / (precision + recall)
          : 0
        : null,
  };
}
export function extract(message: string, preserve = true, exclude = false) {
  const tokens = message.split(preserve ? /[^\w-]+/ : /[^\w]+/).filter(Boolean);
  const dictionary = ['V1', 'P2', 'V3', 'AB-12-CD', '12', '42'];
  const found = [
    ...new Set(
      tokens.filter((t) => dictionary.includes(t) && (!exclude || t !== '42')),
    ),
  ];
  const domain =
    message.match(/@([a-z0-9.-]+)/i)?.[1]?.replace(/\.$/, '') ?? null;
  const customer = customers.find((c) => c.domain === domain);
  return { tokens, found, domain, account: customer?.account ?? null };
}
