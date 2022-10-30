import { Entity, MegalodonInterface } from "megalodon";
import { useEffect, useState } from "react";
export interface ShowAuthorProps {
  megalodon: MegalodonInterface;
  account: Entity.Account;
}
export function ShowAuthor({ account, megalodon }: ShowAuthorProps) {
  const [threads, setThreads] = useState<Entity.Status[][]>([]);
  useEffect(() => {
    (async function () {
      const res = await megalodon.getAccountStatuses(account.id);

      const trees = await statusesToTrees(res.data, megalodon, account.id);
      (window as any).trees = trees;
      (window as any).findAllDescsendants = findAllDescsendants;
      const newThreads: Entity.Status[][] = [];
      for (const ancestorId of trees.progenitorIds) {
        const hit = trees.id2status.get(ancestorId);
        if (!hit) {
          continue;
        }
        const thread = findAllDescsendants(
          trees.parent2childid,
          ancestorId
        ).map((id) => {
          const hit = trees.id2status.get(id);
          if (!hit) {
            throw new Error("?");
          }
          return hit;
        });
        thread.sort((a, b) => a.created_at.localeCompare(b.created_at));

        newThreads.push(thread);
      }
      setThreads(newThreads);
    })();
  }, [megalodon, account]);

  return (
    <>
      We know about {threads.length} threads for @{account.username}!
      <ul>
        {threads.map((thread) => (
          <li key={"" + thread[0].id + thread.length}>
            <ol>
              {thread.map((status) => (
                <li key={status.id}>
                  {status.account.username}:{" "}
                  {status.content.replace(/<.*?>/g, "")} <sup>{status.created_at}</sup> <sub>{status.id}</sub>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
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

async function statusesToTrees(
  statuses: Entity.Status[],
  megalodon: MegalodonInterface,
  authorId: string
) {
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
  const tombstoneIds = new Set<string>();

  // prune the trees
  for (const [id, status] of id2status.entries()) {
    const hit = parent2childid.get(id);
    if (hit?.size === 0) {
      // this status is a leaf node (no children). Start here and find the first post by author
      let thisStatus = status;
      while (thisStatus.account.id !== authorId) {
        const hitStatus = id2status.get(
          child2parentid.get(thisStatus.id) ?? ""
        );
        if (hitStatus) {
          thisStatus = hitStatus;
        }
      }
      tombstoneIds.add(thisStatus.id);
    }
  }
  return {
    progenitorIds,
    tombstoneIds,
    id2status,
    child2parentid,
    parent2childid,
  };
}
