import tweepy
import csv
import json

# Twitter API v2 (Get keys from https://developer.twitter.com/)
client = tweepy.Client(bearer_token="YOUR_BEARER_TOKEN")

queries = ["#opensource", "#AI", "#coding"]

conversations = []
for query in queries:
    tweets = client.search_recent_tweets(
        query=query, max_results=100,
        tweet_fields=["conversation_id", "author_id", "text"]
    )

    for tweet in tweets.data:
        # Fetch conversation thread
        conv = client.search_recent_tweets(
            query=f"conversation_id:{tweet.conversation_id}",
            max_results=20,
            tweet_fields=["author_id", "text"]
        )

        thread = {"conversation": []}
        for t in conv.data:
            thread["conversation"].append({
                "id": str(t.id),
                "author": str(t.author_id),
                "message": t.text,
                "replies": []  # can nest further if needed
            })

        conversations.append(json.dumps(thread))

        if len(conversations) >= 1000:
            break
    if len(conversations) >= 1000:
        break

# Save to CSV
with open("twitter_conversations.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["raw_conversation"])
    for conv in conversations:
        writer.writerow([conv])
