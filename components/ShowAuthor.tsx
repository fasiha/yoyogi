import { Entity, MegalodonInterface } from "megalodon";
import { useEffect, useState } from "react";
import { Thread } from "./Thread";

export interface ShowAuthorProps {
  megalodon: MegalodonInterface;
  account: Entity.Account;
}
export function ShowAuthor({ account, megalodon }: ShowAuthorProps) {
  const [trees, setTrees] = useState<Trees | undefined>(undefined);
  useEffect(() => {
    (async function () {
      const res = await megalodon.getAccountStatuses(account.id, {});
      const trees = await statusesToTrees(res.data, megalodon, account.id);
      (window as any).trees = trees;
      setTrees(trees);
    })();
  }, [megalodon, account]);

  return (
    <>
      Showing {trees?.progenitorIds.size ?? 0} thread
      {trees?.progenitorIds.size !== 1 && "s"} for @{account.username}!
      <div>
        {Array.from(trees?.progenitorIds || [], (id) => (
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

export type Trees = {
  progenitorIds: Set<string>;
  parent2foldedchildren: Map<string, Set<string>>;
  id2status: Map<string, Entity.Status>;
  child2parentid: Map<string, string>;
  parent2childid: Map<string, Set<string>>;
};

async function statusesToTrees(
  statuses: Entity.Status[],
  megalodon: MegalodonInterface,
  authorId: string
): Promise<Trees> {
  const contexts: Entity.Context[] = [];

  // serialize this to reduce Chrome making a ton of HTTP requests
  // Otherwise we could use Promise.all…
  for (const s of statuses) {
    // this should really be in try/catch
    const context = (await megalodon.getStatusContext(s.id)).data;

    contexts.push(context);
  }

  // Maps to hold the directed graph of toots: indexed by ID (number) only
  const parent2childid = new Map<string, Set<string>>();
  const child2parentid = new Map<string, string>();

  // Set to hold the toots starting threads (even of length 1), also indexed by ID (number)
  const progenitorIds = new Set<string>();

  // Map between ID (number) and its corresponding status object
  const id2status = new Map<string, Entity.Status>(
    statuses.map((s) => [s.id, s])
  );

  // make the big trees (populate the above maps/sets)
  for (const [idx, context] of contexts.entries()) {
    const status = statuses[idx];
    const { ancestors, descendants } = context;

    // link context's statuses
    for (const s of ancestors.concat(descendants)) {
      if (s.in_reply_to_id === null) {
        progenitorIds.add(s.id);
      } else {
        // this has a parent
        const hit = parent2childid.get(s.in_reply_to_id) || new Set();
        hit.add(s.id);
        parent2childid.set(s.in_reply_to_id, hit);
        child2parentid.set(s.id, s.in_reply_to_id);
      }
      id2status.set(s.id, s);
    }

    // link the status up, since the above loop didn't include `status`
    if (ancestors.length > 0) {
      const parent = ancestors[ancestors.length - 1];
      const hit = parent2childid.get(parent.id) || new Set();
      hit.add(status.id);
      parent2childid.set(parent.id, hit);
      child2parentid.set(status.id, parent.id);
    }
  }

  // ids of statuses by the author below which are only non-author statuses
  const parent2foldedchildren = new Map<string, Set<string>>();

  // prune the trees
  for (const [id, status] of id2status.entries()) {
    // we're looking for subtrees containing only NON-authors
    if (status.account.id === authorId) {
      continue;
    }

    const children = parent2childid.get(id);
    if (!children || children.size === 0) {
      // this status is a leaf node (no children). Start here and find the first post by author
      let thisStatus = status;
      while (thisStatus.account.id !== authorId && thisStatus.in_reply_to_id) {
        // thisStatus is NOT by author and it has a parent.
        // Is the parent by author? If so, it should fold thisStatus
        const parentOfThis = id2status.get(
          child2parentid.get(thisStatus.id) ?? ""
        );
        if (!parentOfThis) {
          throw new Error("cannot find status with this id?"); // should never ever happen
        }
        if (parentOfThis.account.id === authorId) {
          const hit = parent2foldedchildren.get(parentOfThis.id) || new Set();
          hit.add(thisStatus.id);
          parent2foldedchildren.set(parentOfThis.id, hit);
          break;
        }
        // Nope the parent is by non-author, let's keep looking for a potential fold
        thisStatus = parentOfThis;
      }
    }
  }
  return {
    progenitorIds,
    parent2foldedchildren,
    id2status,
    child2parentid,
    parent2childid,
  };
}
