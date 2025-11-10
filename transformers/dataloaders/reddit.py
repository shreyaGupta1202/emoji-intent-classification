import praw
import csv
import json

# Initialize Reddit API (create app at https://www.reddit.com/prefs/apps)
reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="conversation_scraper"
)

subreddits = ["opensource", "programming", "technology"]

conversations = []
for sub in subreddits:
    for submission in reddit.subreddit(sub).hot(limit=500):
        submission.comments.replace_more(limit=0)
        thread = {"conversation": []}

        # Post author + body
        thread["conversation"].append({
            "id": str(submission.id),
            "author": str(submission.author),
            "message": submission.title + " " + (submission.selftext or ""),
            "replies": []
        })

        for top_comment in submission.comments[:10]:  # limit replies to keep things structured
            replies = []
            for reply in top_comment.replies[:5]:
                replies.append({
                    "id": str(reply.id),
                    "author": str(reply.author),
                    "message": reply.body,
                    "replies": []
                })

            thread["conversation"].append({
                "id": str(top_comment.id),
                "author": str(top_comment.author),
                "message": top_comment.body,
                "replies": replies
            })

        conversations.append(json.dumps(thread))

        if len(conversations) >= 1000:
            break
    if len(conversations) >= 1000:
        break

# Save to CSV
with open("reddit_conversations.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["raw_conversation"])
    for conv in conversations:
        writer.writerow([conv])
