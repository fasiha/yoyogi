# Yoyogi

Yoyogi is, in simple terms, a Google Reader-inspired Mastodon (and soon Pleroma and Misskey) reader app. It rejects The Timeline, where posts from lots of people are interleaved temporally. It instead elevates the author and centers the thread. You log in. You pick one account you’re following. You see just their threads.

- Visit the app! https://fasiha.github.io/yoyogi/
- Read its "about" page! https://fasiha.github.io/yoyogi/about

The rest of this README is a general tutorial exploring the Mastodon API with command-line tools intended for developers.

Acknowledgements: thanks to https://toot.cafe/@qm3jp for a ton of advice and feedback and testing; thanks to everyone who tried Yoyogi and gave feedback (see, e.g., [this thread](https://octodon.social/@22/109341060401995256)).

## Mastodon API tutorial
### Get a token
1. Log into your Mastodon instance
2. Click on "Preferences" --> "Development" --> "New application".
3. Type in whatever you want for "Application name", and uncheck `write` ❌ and `follow` ❌, so the only thing you have checked is `read` ✅.
4. Click "Submit"
5. Go to the application you just created, and copy the *access token*, which today is the third long string of random characters.

### Test your token
First, let's set up some environment variables so I can write this document without leaking my info.
```bash
export TOKEN=INSERT_YOUR_TOKEN_HERE__CAREFUL_WITH_SPACES_AROUND_EQUAL_SIGN
export MASTODON="https://octodon.social"
```
Adjust the two values accordingly. Make sure you don't have spaces around the `=`.

Now!
```bash
curl -H "Authorization: Bearer $TOKEN" $MASTODON/api/v1/accounts/verify_credentials
```

If everything is good, this should print out a bunch of JSON-encoded information about your account. 🥳

If something is bad, e.g., if you omit the token or use an invalid token:
```bash
curl $MASTODON/api/v1/accounts/verify_credentials
```
you'll get something like
```json
{"error":"This method requires an authenticated user"}
```

(You might also get some other errors if your account is suspended, etc., see https://docs.joinmastodon.org/methods/accounts/ --> "Verify account credentials")

### Get your account ID
Do you have [jq](https://stedolan.github.io/jq/download/)? If you do, this is easy: run the same curl command above and pipe it to jq to get your account ID:
```bash
curl -q -H "Authorization: Bearer $TOKEN" $MASTODON/api/v1/accounts/verify_credentials | jq -r '.id'
```
This should print a numeric ID.

If you don't have jq, just look at response the server sent you, the `id` should be the first thing it sent you.

Save that ID in another environment variable. If you have jq,
```bash
export MASTODON_ID=`curl -q -H "Authorization: Bearer $TOKEN" $MASTODON/api/v1/accounts/verify_credentials | jq -r '.id'`
```
Otherwise just
```bash
export MASTODON_ID=YOUR_ID_HERE
```

### Get a list of your follows
We're going to use all three of our environment variables to get this. Even if you follow a reasonable number of people, this is going to be a ton of data so I add the `-O` flag below to tell curl to save the server's JSON reply to a file called `following`:
```bash
curl -H "Authorization: Bearer $TOKEN" $MASTODON/api/v1/accounts/$MASTODON_ID/following -O
```

If you have jq, here's a command that'll print out the URLs and IDs of all your follows:
```bash
cat following | jq '.[] | {url: .url, id: .id}'
```

Lucky for us, this ID lets our home instance find other users even if they're from other instances! The next command will show you the account info of the last person you followed (the first person listed in the `following` file), assuming you have jq:
```bash
curl -H "Authorization: Bearer $TOKEN" $MASTODON/api/v1/accounts/`cat following | jq -r '.[0].id'` | jq '.'
```

> Reading https://docs.joinmastodon.org/methods/accounts/ I kind of expected this to work without the token but my home instance insists I have a token (i.e., it knows who I am) before it'll even give me basic public info about a person.

### Get a list of someone's toots
For simplicity/narcissism, we'll look at our own statuses (toots). This downloads your own most recent toots (including DM's!) and saves a file called `statuses`.
```bash
curl -H "Authorization: Bearer $TOKEN" $MASTODON/api/v1/accounts/$MASTODON_ID/statuses -O
```

This will return an array of toots (replies, boosts, DMs if you're authorized to see them, etc.) in time order.

### Convert a toot to its ancestors and descendants
The way toots work is, each toot can have only one (or no) parent, but it can have any number of children. Given we get a list of toots most-recent-first, for each of them we'll want to find all their ancestor toots, up to the the oldest ancestor (the progenitor).

One useful thing might be—each toot has a `in_reply_to_id`, which gives us the *parent toot ID* of this toot. It'll be either some long number or `null`, meaning this toot is a progenitor toot:
```bash
cat statuses | jq '.[].in_reply_to_id'
```
This will hopefully print a mix of numbers and `null`s.

Let's get first `in_reply_to_id` we have, and ask Mastodon for all of that parent toot's ancestors and descendants. First, set up an environment variable for that status ID:
```bash
export STATUS_ID=`cat statuses | jq -r '.[].in_reply_to_id' | grep -v null | head -n1`
```
If you don't have jq or if you don't see any replies in your list of `statuses`, just run instead `export STATUS_ID=SOME_STATUS_ID`.

Now we can ask the server for that status ID's context, saving the reply to a file called `context`:
```bash
curl -H "Authorization: Bearer $TOKEN" $MASTODON/api/v1/statuses/$STATUS_ID/context -O
```
The server returns two lists of statuses:
- `ancestors` and
- `descendants`.

The `ancestors` array is the direct chain all the way up from `STATUS_ID` to the progenitor toot. The earliest toot comes first. Similarly, `descendants` includes all children, grandchildren, and descendents, also in earliest first. In either case, there will be toots from you and from others (depending on whether you replied to someone or others replied to you). It's not clear to me whether this is paginated, i.e., if only 40 descendants are returned.

### Different time windows
This might not be strictly necessary maybe but I think it'll probably be useful. There are three different ways to ask Mastodon for old toots *relative* to some toot ID. Per https://mastodonpy.readthedocs.io/en/stable/ (I'm not sure where this information is in the official Mastodon docs…):
- `min_id`,
- `since_id`, and
- `max_id`.

Let's try to get an *old* toot's ID to demonstrate:
```bash
export STATUS_ID=`cat statuses | jq -r '.[].id' | tail -n1`
```
will put the oldest toot ID in the `STATUS_ID` environment variable. Now we'll ask Mastodon for toots (statuses) in each of these three windows and save them to three different files:
```bash
curl -H "Authorization: Bearer $TOKEN" "$MASTODON/api/v1/accounts/$MASTODON_ID/statuses?min_id=$STATUS_ID" -o statuses-min_id
curl -H "Authorization: Bearer $TOKEN" "$MASTODON/api/v1/accounts/$MASTODON_ID/statuses?since_id=$STATUS_ID" -o statuses-since_id
curl -H "Authorization: Bearer $TOKEN" "$MASTODON/api/v1/accounts/$MASTODON_ID/statuses?max_id=$STATUS_ID" -o statuses-max_id
```

And here's a quick way to look at the timestamps on the toots returned:
```bash
for var in min_id since_id max_id; do
  echo "Displaying $var"
  cat statuses-$var | jq '.[].created_at'
done
```
You can puzzle over this output to see the differences, or read the [prose description](https://mastodonpy.readthedocs.io/en/stable/), but here's a diagram:
```
                STATUS_ID
                    |
            (min_id]|
now ················|············→ past
     [since_id)      [max_id)
```
In words,
- `min_id` is a list of toots posted after `STATUS_ID`, anchored at `STATUS_ID` and growing towards the present.
- `since_id` is a list of toots, starting now and growing towards the past, stopping at `STATUS_ID` or more recent.
- `max_id` is a list of toots immpediately preceding `STATUS_ID` and growing towards the past.

(All three list of toots starts at the most recent one first.)

It always annoys me that Mastodon has no way to jump to someone's oldest toot—a recency bias infecting much of social media. Well, we can use `min_id=0` for that, to return the oldest toots. The following saves a file `statuses-oldest` and lists these toots' timestamp:
```bash
curl -H "Authorization: Bearer $TOKEN" "$MASTODON/api/v1/accounts/$MASTODON_ID/statuses?min_id=0" -o statuses-oldest
cat statuses-oldest | jq '.[].created_at'
```
And just for fun, here's a script to print out the contents of those ancient toots, stripping the HTML to make it easy to read:
```bash
cat statuses-oldest | jq '.[].content' | sed 's/<[^>]*>//g'
```
Ah, memories!

### A plan
So here's a rough initial unoptimized plan for Yoyogi:
1. get the list of most recent statuses (toots) via the `statuses` endpoint for some account.
2. For each status, get the ancestors and descendants via the `context` endpoint.
3. Some of the statuses in step 1 might be in the ancestors/descendents tree in step 2. So build the directed trees knowing there may be fewer trees than statuses.
4. "Prune" each of these trees so that the leaf nodes are only by the account. (Don't actually truncate the tree at these points, maybe just "fold" them, since we'll want to know how many non-account replies live below that "fold".)
5. Render each of these trees in the Yoyogi UI, one column per tree.

Optimizations include:
- make simple trees after step 1 above, maybe we can ask the server for fewer `context`s than statuses.
- Cache these somewhere. It would be really interesting to make a Mastodon cache that either removes a lot of keys we don't need for every status (toot), or provides a GraphQL layer so each client can customize what keys it wants for each status (toot) returned.

### More plans
Yoyogi now has oldest/newest and older/newer. Let's fill in more of its features for an MVP/SLC (minimum viable product/simple lovable and complete).

- [x] Switch between any of logged-in users' follows
- [ ] Track which posts have been read/unread (pretend all toots before first login are "read"; use localStorage or IndexedDb)
- [x] Horizontal scroll for older/newer threads, vertical scroll for within-thread.
- [ ] Make `newest` (and I guess `oldest`) not reset the threads but check if they need to.
- [x] add links

That'll be good enough for a client-side-only version. Based on feedback, invest in a hosted solution that allows users to use the app between devices.