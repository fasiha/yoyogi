import { Entity, MegalodonInterface } from "megalodon";
import { Trees } from "./ShowAuthor";
import stylesAuthor from "../styles/ShowAuthor.module.css";

function statusToPlain(status: Entity.Status): string {
  return status.content.replace(/<.*?>/g, "");
}
function basicStatusToJsx(status: Entity.Status): JSX.Element {
  return (
    <>
      {status.account.username}: {statusToPlain(status)}{" "}
      <span className={stylesAuthor["supsub"]}>
        <sup>{status.created_at}</sup>
        <sub>{status.id}</sub>
      </span>
    </>
  );
}

export interface ThreadProps {
  progenitorId: string;
  trees?: Trees;
  authorId: string;
  depth: number;
}
export function Thread({ progenitorId, trees, authorId, depth }: ThreadProps) {
  if (!trees) {
    return <></>;
  }

  const progenitor = getGuaranteed(trees.id2status, progenitorId);
  const bullets: JSX.Element[] = [];

  let thisStatus: Entity.Status | undefined = progenitor;
  while (thisStatus) {
    const childrenOfThis: Entity.Status[] = Array.from(
      trees.parent2childid.get(thisStatus.id) || []
    ).map((s) => getGuaranteed(trees.id2status, s));
    const foldedChildren: Set<string> =
      trees.parent2foldedchildren.get(thisStatus.id) || new Set();
    const numChildrenToShow = childrenOfThis.length - foldedChildren.size;
    const childrenToShow = childrenOfThis.filter(
      (s) => !foldedChildren.has(s.id)
    );
    if (numChildrenToShow !== childrenToShow.length) {
      throw new Error("these should be equal?");
    }

    const foldFooter = foldedChildren.size ? (
      <sub>
        {" "}
        {foldedChildren.size} hidden{" "}
        {foldedChildren.size === 1 ? "reply" : "replies"}
      </sub>
    ) : (
      ""
    );

    if (numChildrenToShow <= 1) {
      // either no children or just one child (straight-shot thread)
      bullets.push(
        <li key={thisStatus.id}>
          {basicStatusToJsx(thisStatus)}
          {foldFooter}
        </li>
      );
      thisStatus = childrenToShow[0]; // might be undefined! ok! While guard above will work
    } else {
      bullets.push(
        <li key={thisStatus.id}>
          {basicStatusToJsx(thisStatus)}
          {foldFooter}
          <ul>
            {childrenToShow.map((s) => (
              <li key={s.id + "…"}>[{statusToPlain(s).slice(0, 10)}…]</li>
            ))}
          </ul>
          {childrenToShow.map((s) => (
            <Thread
              key={s.id + "/" + depth}
              progenitorId={s.id}
              trees={trees}
              authorId={authorId}
              depth={depth + 1}
            />
          ))}
        </li>
      );
      thisStatus = undefined;
    }
  }
  return <ol>{bullets}</ol>;
}

interface TootProps {
  status: Entity.Status;
  trees: Trees;
}
function Toot({ status }: TootProps) {}

function getGuaranteed<K, V>(m: Map<K, V>, key: K): V {
  const ret = m.get(key);
  if (ret === undefined) {
    throw new Error("safeGet was unsafe");
  }
  return ret;
}

function statusToRepliesHelper(
  status: Entity.Status,
  trees: Trees,
  authorId: string
): { numReplies: number; numAuthorReplies: number; numOtherReplies: number } {
  const childIds = trees.parent2childid.get(status.id);
  if (!childIds) {
    return { numReplies: 0, numAuthorReplies: 0, numOtherReplies: 0 };
  }
  const children = Array.from(childIds, (id) =>
    getGuaranteed(trees.id2status, id)
  );
  const numAuthorReplies = children.filter(
    (s) => s.account.id === authorId
  ).length;
  const numOtherReplies = children.length - numAuthorReplies;
  return { numReplies: children.length, numAuthorReplies, numOtherReplies };
}
