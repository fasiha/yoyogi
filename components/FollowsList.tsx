import { Entity } from "megalodon";
import styles from "../styles/components.module.css";
export interface FollowsListProps {
  myAccount: Entity.Account;
  follows: Entity.Account[];
  authorId: string;
  setAuthor: (account: Entity.Account) => void;
}
export function FollowsList({
  myAccount,
  follows,
  authorId,
  setAuthor,
}: FollowsListProps) {
  return (
    <div className={styles["follows-list"]}>
      <ol start={follows.length + 1} reversed>
        {[myAccount].concat(follows).map((f) => (
          <li
            key={f.id}
            className={f.id === authorId ? styles["selected-author"] : ""}
          >
            @{f.acct} {f.display_name}{" "}
            {f.id !== authorId && (
              <button onClick={() => setAuthor(f)}>Select</button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
