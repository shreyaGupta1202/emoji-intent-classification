#!/usr/bin/env python3
"""
Convert conversations.csv -> agent1_data.csv by appending per-author keywords
using the Gemini API.

- Source  : conversations.csv
- Dest    : agent1_data.csv
- Output  : CSV with columns [input, output]
            where `input` is the original conversation JSON string and
            `output` is a JSON array like:
            [
              {"id":"1","author":"Zara","keywords":["rant","question","request","overwhelmed"]},
              ...
            ]
"""

import os
import csv
import json
import time
import re
from typing import Optional, Tuple

# ---- Gemini setup ----
try:
    import google.generativeai as genai
except ImportError as e:
    raise SystemExit(
        "google-generativeai not installed. Run: pip install google-generativeai"
    ) from e

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise SystemExit("Please set GOOGLE_API_KEY environment variable.")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

# ---- Prompt template ----
SYSTEM_INSTRUCTIONS = """You are given a single conversation object (JSON) of the form:
{
  "conversation": [
    {
      "id": "22",
      "author": "user100",
      "message": "Why does iced coffee hit different tho 🧋",
      "replies": [
        {"id": "23", "author": "user101", "message": "Because it’s basically personality fuel.", "replies": []}
      ]
    }
  ]
}

Your task: Produce ONLY a JSON array that lists each message node by its "id" and "author", with a "keywords" array describing the intent/tone/function of that specific message.
Do NOT include the full messages in the output—just id, author, and keywords.

Rules:
- Output must be valid JSON (no trailing commas, no extra text).
- Flatten all nested replies (include every node present in the conversation tree).
- 2–6 concise, lowercase keywords per node (single or hyphenated tokens preferred).
- No hashtags, no emojis, no punctuation, no duplicates.
- Keep the original "id" and "author" as strings.
- Do not invent ids or authors.

Example target format ONLY:
[
  {"id":"1","author":"Zara","keywords":["rant","question","request","overwhelmed"]},
  {"id":"2","author":"Kai","keywords":["agreement","advice","product-rec","callback"]}
]
"""

def extract_first_json_array(text: str) -> Optional[str]:
    """
    Attempts to extract the first JSON array from a model response,
    handling cases where the response is wrapped in code fences.
    """
    # Remove code fences if present
    fence_match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", text, flags=re.DOTALL)
    if fence_match:
        candidate = fence_match.group(1).strip()
        try:
            json.loads(candidate)
            return candidate
        except Exception:
            pass

    # Try raw text as-is
    raw = text.strip()
    try:
        # Sometimes there's extra prose; try to find first [ ... ]
        array_match = re.search(r"\[\s*{.*}\s*\]", raw, flags=re.DOTALL)
        if array_match:
            candidate = array_match.group(0)
            json.loads(candidate)
            return candidate
    except Exception:
        pass
    return None


def annotate_keywords(conversation_json_str: str, max_retries: int = 3, backoff: float = 2.0) -> Tuple[bool, str]:
    """
    Send a single conversation JSON string to Gemini and return (ok, output_json_array_string).
    If not ok, output_json_array_string contains an error message.
    """
    for attempt in range(1, max_retries + 1):
        try:
            resp = model.generate_content(
                [
                    {"role": "user", "parts": SYSTEM_INSTRUCTIONS},
                    {"role": "user", "parts": conversation_json_str},
                ],
                safety_settings=None,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 1024,
                },
            )
            text = resp.text or ""
            json_array = extract_first_json_array(text)
            if not json_array:
                raise ValueError("Could not parse JSON array from model response.")
            # Validate JSON
            parsed = json.loads(json_array)
            if not isinstance(parsed, list):
                raise ValueError("Parsed output is not a list.")
            # Light schema check
            for item in parsed:
                if not all(k in item for k in ("id", "author", "keywords")):
                    raise ValueError("Missing keys in one or more items.")
                if not isinstance(item["keywords"], list):
                    raise ValueError("keywords must be a list.")
            return True, json_array
        except Exception as e:
            if attempt == max_retries:
                return False, f"ERROR after {max_retries} attempts: {e}"
            time.sleep(backoff * attempt)
    return False, "Unknown error"


def read_conversation_field(row: dict, header: list) -> str:
    """
    Get the conversation JSON string from a CSV row.
    Prefer a column named 'conversation'. If absent, use the first column.
    """
    if "conversation" in row and row["conversation"]:
        return row["conversation"]
    if header:
        first_col = header[0]
        return row.get(first_col, "")
    return ""


def main():
    src = "conversations.csv"
    dst = "agent1_data.csv"

    with open(src, "r", encoding="utf-8") as f_in, \
         open(dst, "w", newline="", encoding="utf-8") as f_out:

        reader = csv.DictReader(f_in)
        fieldnames_out = ["input", "output"]
        writer = csv.DictWriter(f_out, fieldnames=fieldnames_out)
        writer.writeheader()

        total = 0
        success = 0

        for row in reader:
            total += 1
            conversation_json_str = read_conversation_field(row, reader.fieldnames or [])
            conversation_json_str = conversation_json_str.strip()

            if not conversation_json_str:
                writer.writerow({"input": "", "output": "ERROR: empty conversation cell"})
                continue

            ok, out = annotate_keywords(conversation_json_str)
            if ok:
                success += 1
                writer.writerow({"input": conversation_json_str, "output": out})
            else:
                writer.writerow({"input": conversation_json_str, "output": out})

        print(f"Done. Wrote {dst}. Success: {success}/{total}")


if __name__ == "__main__":
    main()
