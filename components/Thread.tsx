import { Entity, MegalodonInterface } from "megalodon";
import { getGuaranteed, Trees } from "./ShowAuthor";
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
  trees: Trees;
  authorId: string;
  depth: number;
}
export function Thread({ progenitorId, trees, authorId, depth }: ThreadProps) {
  const progenitor = getGuaranteed(trees.id2status, progenitorId);
  const bullets: JSX.Element[] = [];

  let thisStatus: Entity.Status | undefined = progenitor;
  while (thisStatus) {
    const childrenOfThis: Entity.Status[] = Array.from(
      trees.parent2childid.get(thisStatus.id) || []
    ).map((s) => getGuaranteed(trees.id2status, s));
    const childrenToShow = childrenOfThis.filter(
      (s) => trees.foldedIds.get(s.id) !== true
    );
    const numFoldedChildren = childrenOfThis.length - childrenToShow.length;

    const foldFooter = numFoldedChildren ? (
      <sub>
        {" "}
        {numFoldedChildren} hidden{" "}
        {numFoldedChildren === 1 ? "reply" : "replies"}
      </sub>
    ) : (
      ""
    );

    if (childrenToShow.length <= 1) {
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
  return depth === 1 ? (
    <ol>{bullets}</ol>
  ) : (
    <details open>
      <summary></summary>
      <ol>{bullets}</ol>
    </details>
  );
}
