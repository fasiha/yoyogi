/*

This is inteded to be used ONLY IN DEVELOPMENT because it is a TERRIBLE cache.

Assuming Next.js is running on port 3000, this cache makes it so requests to

http://localhost:3000/api/mastodonCache/__anything__

get mapped to

$MASTODON/__anything__

If the cache has seen such a URL before, it returns the cached value.

Otherwise it makes the request to the actual Mastodon server, saves the reply
in the cache, and sends it on to the client.

The only reason to do this is to not place undue burden on an actual Mastodon
server during testing this ridiculous app.

*/


import {existsSync, readFileSync} from 'fs'
import {writeFile} from 'fs/promises'
import {NextApiRequest, NextApiResponse} from 'next'
import fetch from 'node-fetch';

const MASTODON = process.env.MASTODON || 'https://octodon.social';
const CACHE_FILE_NAME = 'mastodon-cache.json';

let cache: Record<string, string> = {};

if (existsSync(CACHE_FILE_NAME)) {
  cache = JSON.parse(readFileSync(CACHE_FILE_NAME, 'utf8'))
  console.log(`Cache loaded from disk: ${Object.keys(cache).length} URLs.`)
} else {
  updateCache('/api/mastodonCache/test', '{"message": "Hi test"}')
  console.log('Initialized empty cache')
}

function updateCache(key: string, value: string) {
  cache[key] = value;
  return writeFile(CACHE_FILE_NAME, JSON.stringify(cache, null, 1))
}

export default async function handler(
    req: NextApiRequest, res: NextApiResponse) {
  console.log('Requested ', req.url);

  const {url} = req;
  if (req.method !== 'GET') {
    res.status(501).json({message: 'Only GET supported'})
    return
  }
  if (!url) {
    res.status(400).json({message: 'no URL?'})
    return;
  }

  const externalUrl = `${MASTODON}/${url.replace('/api/mastodonCache/', '')}`
  if (url in cache) {
    const hit = cache[url];
    console.log(`Cache found ${hit.length}-long entry for ${externalUrl}`)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.status(200).write(hit)
    res.end()
    return
  }

  const token = typeof req.headers.authorization === 'string' ?
      req.headers.authorization :
      '';
  console.log(`Fetching remote URL: ${externalUrl}`)
  try {
    const externalRequest = await fetch(
        externalUrl,
        {headers: {'User-Agent': 'Yoyogi Cache', 'Authorization': token}})
    if (externalRequest.ok) {
      const text = await externalRequest.text();
      console.log(`Remote fetch ok, ${
          text.length} bytes received. Saving to cache and returning to client.`)
      updateCache(url, text)
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.status(200).write(text)
      res.end()
      return
    }
    console.error(`Remote fetch not ok: ${externalRequest.status} ${
        externalRequest.statusText}`)
  } catch (e) {
    console.error(
        `Remote URL fetch failed
- original URL: ${url}
- external URL: ${externalUrl}
- error:`,
        e)
  }
  res.status(500).json({message: 'External network error, see logs'})
  return
}