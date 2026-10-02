'use client';

import {
  Children,
  createElement,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { PresenceContext, type PresenceState } from './presence-context';

interface Entry {
  key: string;
  node: ReactElement;
  exiting: boolean;
}

type Claims = Map<string, Set<object>>;
type Latest = Map<string, ReactElement>;

interface Tracked {
  shown: Entry[];
  signature: string;
}

function toEntries(children: ReactNode): Entry[] {
  const out: Entry[] = [];
  Children.forEach(children, (child, index) => {
    if (isValidElement(child)) out.push({ key: String(child.key ?? index), node: child, exiting: false });
  });
  return out;
}

function withExiting(previous: Entry[], incoming: Entry[], claims: Claims, latest: Latest): Entry[] {
  const live = new Set(incoming.map((entry) => entry.key));
  const merged: Entry[] = incoming.map((entry) => ({ ...entry }));
  previous.forEach((entry, index) => {
    if (live.has(entry.key)) return;
    if (!claims.get(entry.key)?.size) return;
    const node = latest.get(entry.key) ?? entry.node;
    merged.splice(index, 0, entry.exiting ? entry : { ...entry, node, exiting: true });
  });
  return merged;
}

export interface PresenceProps {
  /** Keyed children. A child animates out only if it renders a `<Motion>` carrying `exit`. */
  children?: ReactNode;
  /** Let children present on the first paint play their `animate`. @default true */
  initial?: boolean;
  /** `wait` holds entering children back until the outgoing ones have left. @default 'sync' */
  mode?: 'sync' | 'wait';
  /** Fires once the last exiting child has been removed. */
  onExitComplete?: () => void;
}

export function Presence({ children, initial = true, mode = 'sync', onExitComplete }: PresenceProps) {
  const incoming = toEntries(children);
  const signature = incoming.map((entry) => entry.key).join('|');
  const claims = useRef<Claims>(new Map());
  const latest = useRef<Latest>(new Map());
  const values = useRef({ membership: '', byKey: new Map<string, PresenceState>() });
  for (const entry of incoming) latest.current.set(entry.key, entry.node);
  const [tracked, setTracked] = useState<Tracked>({ shown: incoming, signature });
  const bornAtMount = useRef(new Set(incoming.map((entry) => entry.key)));
  const wasExiting = useRef(false);
  const complete = useRef(onExitComplete);
  complete.current = onExitComplete;

  let shown = tracked.shown;
  if (tracked.signature !== signature) {
    shown = withExiting(tracked.shown, incoming, claims.current, latest.current);
    setTracked({ shown, signature });
  }

  const drop = (key: string) => {
    latest.current.delete(key);
    setTracked((previous) => {
      const next = previous.shown.filter((entry) => entry.key !== key || !entry.exiting);
      return next.length === previous.shown.length ? previous : { ...previous, shown: next };
    });
  };

  const claimExit = (key: string) => (): (() => void) => {
    let tokens = claims.current.get(key);
    if (!tokens) {
      tokens = new Set<object>();
      claims.current.set(key, tokens);
    }
    const token = {};
    const held = tokens;
    held.add(token);
    return () => {
      if (!held.delete(token) || held.size) return;
      if (claims.current.get(key) === held) claims.current.delete(key);
      drop(key);
    };
  };

  const leaving = shown.some((entry) => entry.exiting);

  useEffect(() => {
    bornAtMount.current.clear();
  }, []);

  useEffect(() => {
    if (wasExiting.current && !leaving) complete.current?.();
    wasExiting.current = leaving;
  }, [leaving]);

  const fresh = new Map(incoming.map((entry) => [entry.key, entry.node]));
  const visible = mode === 'wait' && leaving ? shown.filter((entry) => entry.exiting) : shown;

  const membership = visible.map((entry) => entry.key).join('|');
  const reflowed = values.current.membership !== membership;
  const priorValues = values.current.byKey;
  values.current = { membership, byKey: new Map() };
  const valueFor = ({ key, exiting }: Entry): PresenceState => {
    const born = initial || !bornAtMount.current.has(key);
    const kept = reflowed ? undefined : priorValues.get(key);
    const value =
      kept?.isPresent === !exiting && kept.initial === born
        ? kept
        : { isPresent: !exiting, initial: born, claimExit: claimExit(key) };
    values.current.byKey.set(key, value);
    return value;
  };

  return createElement(
    Fragment,
    null,
    visible.map((entry) =>
      createElement(
        PresenceContext.Provider,
        { key: entry.key, value: valueFor(entry) },
        fresh.get(entry.key) ?? entry.node,
      ),
    ),
  );
}
