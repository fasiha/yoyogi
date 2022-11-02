import { Entity, MegalodonInterface } from "megalodon";
import { useEffect, useState } from "react";
import { Thread } from "./Thread";

export type Trees = {
  // Set to hold the toots starting threads (even of length 1), also indexed by ID (number)
  progenitorIds: Set<string>;
  // ids of statuses by the author below which are only non-author statuses
  parent2foldedchildren: Map<string, Set<string>>;
  // Map between ID (number) and its corresponding status object
  id2status: Map<string, Entity.Status>;
  // Maps to hold the directed graph of toots: indexed by ID (number) only
  child2parentid: Map<string, string>;
  parent2childid: Map<string, Set<string>>;
  maxContiguousId?: string;
  minContiguousId?: string;
};

function initializeTrees(): Trees {
  return {
    progenitorIds: new Set(),
    parent2foldedchildren: new Map(),
    id2status: new Map(),
    child2parentid: new Map(),
    parent2childid: new Map(),
  };
}

async function newest(
  megalodon: MegalodonInterface,
  account: Entity.Account
): Promise<Trees> {
  const trees = initializeTrees();
  const res = await megalodon.getAccountStatuses(account.id);
  await addStatusesToTreesImpure(trees, res.data, megalodon, account.id);
  return trees;
}
async function oldest(
  megalodon: MegalodonInterface,
  account: Entity.Account
): Promise<Trees> {
  const trees = initializeTrees();
  const res = await megalodon.getAccountStatuses(account.id, { min_id: "0" });
  await addStatusesToTreesImpure(trees, res.data, megalodon, account.id);
  return trees;
}
async function newer(
  megalodon: MegalodonInterface,
  account: Entity.Account,
  trees: Trees,
  numNewThreads: number
): Promise<Trees> {
  const initialNumThreads = trees.progenitorIds.size;
  while (trees.progenitorIds.size < initialNumThreads + numNewThreads) {
    const res = await megalodon.getAccountStatuses(account.id, {
      min_id: trees.maxContiguousId,
    });
    if (res.data.length === 0) {
      break;
    }
    await addStatusesToTreesImpure(trees, res.data, megalodon, account.id);
  }
  return { ...trees };
}
async function older(
  megalodon: MegalodonInterface,
  account: Entity.Account,
  trees: Trees,
  numNewThreads: number
): Promise<Trees> {
  const initialNumThreads = trees.progenitorIds.size;
  while (trees.progenitorIds.size < initialNumThreads + numNewThreads) {
    const res = await megalodon.getAccountStatuses(account.id, {
      max_id: trees.minContiguousId,
    });
    if (res.data.length === 0) {
      break;
    }
    await addStatusesToTreesImpure(trees, res.data, megalodon, account.id);
  }
  return { ...trees };
}

export interface ShowAuthorProps {
  megalodon: MegalodonInterface;
  account: Entity.Account;
}
export function ShowAuthor({ account, megalodon }: ShowAuthorProps) {
  const [trees, setTrees] = useState(() => initializeTrees());
  // initial populate for this account
  useEffect(() => {
    if (trees.id2status.size) {
      return;
    }
    (async function () {
      const trees = await newest(megalodon, account);
      setTrees(trees);
    })();
  }, [megalodon, account, trees.id2status.size]);
  // Save to global
  useEffect(() => {
    (window as any).trees = trees;
  }, [trees]);

  return (
    <>
      Showing {trees.progenitorIds.size ?? 0} thread
      {trees.progenitorIds.size !== 1 && "s"} for @{account.username}!
      <button
        onClick={async () => {
          setTrees(await newest(megalodon, account));
        }}
      >
        Newest
      </button>
      <button
        onClick={async () => {
          setTrees(await newer(megalodon, account, trees, 1));
        }}
      >
        Newer
      </button>
      <button
        onClick={async () => {
          setTrees(await older(megalodon, account, trees, 1));
        }}
      >
        Older
      </button>
      <button
        onClick={async () => {
          setTrees(await oldest(megalodon, account));
        }}
      >
        Oldest
      </button>
      <div>
        {Array.from(trees.progenitorIds)
          .sort((a, b) => b.localeCompare(a))
          .map((id) => (
            <Thread
              key={id + "/0"}
              trees={trees}
              progenitorId={id}
              authorId={account.id}
              depth={1}
            />
          ))}
      </div>
    </>
  );
}

function findAllDescsendants(
  parent2child: Map<string, Set<string>>,
  start: string
): string[] {
  const hit = parent2child.get(start);
  if (!hit) return [start];
  return [start].concat(
    Array.from(hit).flatMap((child) => findAllDescsendants(parent2child, child))
  );
}

function minmaxStrings(v: string[]): [string | undefined, string | undefined] {
  if (v.length === 0) {
    return [undefined, undefined];
  }
  const iter = v.values();
  let min: string = iter.next().value;
  let max = min;
  for (const x of iter) {
    min = x.localeCompare(min) < 0 ? x : min;
    max = x.localeCompare(max) > 0 ? x : max;
  }
  return [min, max];
}

async function addStatusesToTreesImpure(
  trees: Trees,
  statuses: Entity.Status[],
  megalodon: MegalodonInterface,
  authorId: string
): Promise<void> {
  {
    const ids = statuses.map((s) => s.id);
    if (trees.maxContiguousId !== undefined) {
      ids.concat(trees.maxContiguousId);
    }
    if (trees.minContiguousId !== undefined) {
      ids.concat(trees.minContiguousId);
    }
    const [min, max] = minmaxStrings(ids);
    trees.maxContiguousId = max;
    trees.minContiguousId = min;
  }

  for (const s of statuses) {
    trees.id2status.set(s.id, s);
  }

  const contexts: Entity.Context[] = [];

  // serialize this to reduce Chrome making a ton of HTTP requests
  // Otherwise we could use Promise.all…
  for (const s of statuses) {
    // this should really be in try/catch
    const context = (await megalodon.getStatusContext(s.id)).data;

    contexts.push(context);
  }

  // make the big trees (populate the above maps/sets)
  for (const [idx, context] of contexts.entries()) {
    const status = statuses[idx];
    const { ancestors, descendants } = context;

    // link context's statuses
    for (const s of ancestors.concat(descendants)) {
      if (s.in_reply_to_id === null) {
        trees.progenitorIds.add(s.id);
      } else {
        // this has a parent
        const hit = trees.parent2childid.get(s.in_reply_to_id) || new Set();
        hit.add(s.id);
        trees.parent2childid.set(s.in_reply_to_id, hit);
        trees.child2parentid.set(s.id, s.in_reply_to_id);
      }
      trees.id2status.set(s.id, s);
    }

    // link the status up, since the above loop didn't include `status`
    if (ancestors.length > 0) {
      const parent = ancestors[ancestors.length - 1];
      const hit = trees.parent2childid.get(parent.id) || new Set();
      hit.add(status.id);
      trees.parent2childid.set(parent.id, hit);
      trees.child2parentid.set(status.id, parent.id);
    }
  }

  // prune the trees
  for (const [id, status] of trees.id2status.entries()) {
    // we're looking for subtrees containing only NON-authors
    if (status.account.id === authorId) {
      continue;
    }

    const children = trees.parent2childid.get(id);
    if (!children || children.size === 0) {
      // this status is a leaf node (no children). Start here and find the first post by author
      let thisStatus = status;
      while (thisStatus.account.id !== authorId && thisStatus.in_reply_to_id) {
        // thisStatus is NOT by author and it has a parent.
        // Is the parent by author? If so, it should fold thisStatus
        const parentOfThis = getGuaranteed(
          trees.id2status,
          getGuaranteed(trees.child2parentid, thisStatus.id)
        );
        if (parentOfThis.account.id === authorId) {
          const hit =
            trees.parent2foldedchildren.get(parentOfThis.id) || new Set();
          hit.add(thisStatus.id);
          trees.parent2foldedchildren.set(parentOfThis.id, hit);
          break;
        }
        // Nope the parent is by non-author, let's keep looking for a potential fold
        thisStatus = parentOfThis;
      }
    }
  }
}

export function getGuaranteed<K, V>(m: Map<K, V>, key: K): V {
  const ret = m.get(key);
  if (ret === undefined) {
    throw new Error("safeGet was unsafe");
  }
  return ret;
}
