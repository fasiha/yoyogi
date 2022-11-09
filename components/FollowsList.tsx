import { Entity } from "megalodon";
import styles from "../styles/components.module.css";
export interface FollowsListProps {
  follows: Entity.Account[];
}
export function FollowsList({ follows }: FollowsListProps) {
  return (
    <div className={styles["follows-list"]}>
      <ol>
        {follows.map((f) => (
          <li key={f.id}>
            @{f.acct} {f.display_name}
          </li>
        ))}
      </ol>
    </div>
  );
}
