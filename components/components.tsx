import generator, { Entity, Response } from "megalodon";
import { useState } from "react";
import styles from "../styles/components.module.css";

interface LoginProps {
  loggedIn: boolean;
  submit: (url: string, token: string) => void;
  logout: () => void;
}
function Login({ loggedIn, submit, logout }: LoginProps) {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  return (
    <div className={styles["login-box"]}>
      {loggedIn ? (
        <>
          Logged into {url}.{" "}
          <button
            onClick={() => {
              logout();
              setUrl("");
              setToken("");
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <label>
            Mastodon URL?
            <input
              type="url"
              placeholder="https://octodon.social"
              onChange={(e) => setUrl(e.target.value)}
              value={url}
            />
          </label>
          <label>
            Token?
            <input
              type="password"
              placeholder="token"
              onChange={(e) => setToken(e.target.value)}
              value={token}
            />
          </label>
          <button onClick={() => submit(url, token)}>Submit</button>
        </>
      )}
    </div>
  );
}

function removeTrailingSlashes(url: string) {
  const match = url.match(/\/+$/);
  if (match && match.index) {
    url = url.slice(0, match.index);
  }
  return url;
}
async function verify(
  url: string,
  token: string
): Promise<undefined | Entity.Account> {
  const client = generator("mastodon", url, token);
  try {
    const res = await client.verifyAccountCredentials();
    // above will throw if 401 (unauthorized) or 404 (bad URL)
    return res.data;
  } catch (e) {
    console.error("Network error:", e);
    return undefined;
  }
}
export function Yoyogi() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const logout = () => {
    setUrl("");
    setToken("");
    setLoggedIn(false);
  };

  const loginProps: LoginProps = {
    loggedIn,
    logout,
    submit: async (enteredUrl: string, enteredToken: string) => {
      enteredUrl = removeTrailingSlashes(enteredUrl);
      const res = await verify(enteredUrl, enteredToken);
      if (res) {
        setUrl(enteredUrl);
        setToken(token);
        setLoggedIn(true);
        console.log(res);
      }
    },
  };
  return (
    <div>
      <h1>Yoyogi</h1>
      <Login {...loginProps} />
    </div>
  );
}
