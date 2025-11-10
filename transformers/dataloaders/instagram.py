import instaloader
import csv
import json

# Initialize Instaloader
L = instaloader.Instaloader()

# Login (Optional if you want to fetch from private accounts you follow)
# L.login("your_username", "your_password")

# Define hashtags or profiles to fetch from
hashtags = ["opensource", "coding", "developer"]  # you can change these

conversations = []
for tag in hashtags:
    for post in L.get_hashtag_posts(tag):
        thread = {"conversation": []}

        # Author + Caption
        thread["conversation"].append({
            "id": str(post.mediaid),
            "author": post.owner_username,
            "message": post.caption,
            "replies": []
        })

        # Comments & replies
        for comment in post.get_comments():
            replies = []
            for reply in comment.answers:
                replies.append({
                    "id": str(reply.id),
                    "author": reply.owner.username,
                    "message": reply.text,
                    "replies": []
                })

            thread["conversation"].append({
                "id": str(comment.id),
                "author": comment.owner.username,
                "message": comment.text,
                "replies": replies
            })

        conversations.append(json.dumps(thread))

        if len(conversations) >= 1000:
            break
    if len(conversations) >= 1000:
        break

# Save to CSV
with open("instagram_conversations.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["raw_conversation"])
    for conv in conversations:
        writer.writerow([conv])
