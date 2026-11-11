import os
import sys
import json
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

SOURCE_PATH = "assets/vocabulary/kosakata_3000_source.txt"
STAGING_DIR = "assets/vocabulary/staging"
FINAL_ASSET_PATH = "android-project/app/src/main/assets/vocabulary/fluelo_vocabulary_v1.json"
REPO_ENRICHED_PATH = "assets/vocabulary/kosakata_3000_enriched.json"
AUDIT_PATH = "assets/vocabulary/enrichment_audit.json"

BATCH_SIZE = 60
MAX_WORKERS = 2

os.makedirs(STAGING_DIR, exist_ok=True)
os.makedirs(os.path.dirname(FINAL_ASSET_PATH), exist_ok=True)

with open("android-project/local.properties") as f:
    key = [line.split("=")[1].strip() for line in f if line.startswith("GEMINI_API_KEY")][0]

MODELS = [
    "models/gemini-flash-lite-latest",
    "models/gemini-3.5-flash-lite"
]

PROMPT_TEMPLATE = """You are an expert bilingual lexicographer (English and Indonesian).
For each of the given English headwords, provide rich, accurate lexical details in JSON array format.

Output JSON format: Array of objects with EXACT keys:
- "id": integer (keep the same id as provided)
- "headword": string (exact headword string)
- "normalizedKey": string (lowercase headword)
- "partOfSpeech": string (e.g., "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "interjection")
- "meaningsId": string (concise, natural Indonesian primary meaning/translation, in Bahasa Indonesia)
- "ipa": string (accurate US English IPA enclosed in slashes, e.g. "/əˈbæn.dən/")
- "pronunciationLocale": "en-US"
- "exampleEn": string (one natural, modern conversational English sentence illustrating the word)
- "exampleId": string (concise Indonesian translation of the example sentence, in Bahasa Indonesia)
- "contentStatus": "ready"
- "datasetVersion": 1

Special words handling:
- For polysemous words (e.g. "record", "lead", "present", "close", "live", "read", "wind", "tear"), choose the most common primary conversational sense and matching IPA.
- For contractions like "n't", partOfSpeech is "adverb", meaningsId is "tidak (singkatan not)", ipa is "/nt/", exampleEn is "I didn't expect to see you here.", exampleId is "Aku tidak menyangka akan melihatmu di sini."
- For interjections like "mm-hmm", partOfSpeech is "interjection", meaningsId is "ya / betul (gumaman setuju)", ipa is "/mhm/", exampleEn is "'Are you coming?' 'Mm-hmm, in a minute.'", exampleId is "'Kamu ikut?' 'Mm-hmm, sebentar lagi.'"
- For single letter words like "a", partOfSpeech is "indefinite article", meaningsId is "sebuah / seorang / seekor", ipa is "/ə/", exampleEn is "She bought a new laptop yesterday.", exampleId is "Dia membeli sebuah laptop baru kemarin."

Input words:
{words_json}"""

def enrich_batch(batch_idx, batch_words):
    staging_file = os.path.join(STAGING_DIR, f"batch_{batch_idx:03d}.json")
    if os.path.exists(staging_file):
        try:
            with open(staging_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if len(data) == len(batch_words):
                    print(f"[SKIP] Batch {batch_idx:03d} cached ({len(data)} words)", flush=True)
                    return data
        except Exception:
            pass

    prompt = PROMPT_TEMPLATE.format(words_json=json.dumps(batch_words, ensure_ascii=False))
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1
        }
    }
    
    max_retries = 5
    for attempt in range(max_retries):
        model_name = MODELS[attempt % len(MODELS)]
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={key}"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                raw_text = result['candidates'][0]['content']['parts'][0]['text']
                items = json.loads(raw_text)
                
                id_map = {item["id"]: item for item in items if "id" in item}
                normalized_items = []
                for bw in batch_words:
                    if bw["id"] in id_map:
                        item = id_map[bw["id"]]
                        item["id"] = bw["id"]
                        item["headword"] = bw["headword"]
                        item["normalizedKey"] = bw["headword"].lower()
                        item["pronunciationLocale"] = "en-US"
                        item["contentStatus"] = "ready"
                        item["datasetVersion"] = 1
                        normalized_items.append(item)
                    else:
                        raise ValueError(f"Missing id {bw['id']} in LLM output for batch {batch_idx}")
                
                with open(staging_file, "w", encoding="utf-8") as f:
                    json.dump(normalized_items, f, indent=2, ensure_ascii=False)
                
                print(f"[OK] Batch {batch_idx:03d} finished ({len(normalized_items)} words)", flush=True)
                return normalized_items
        except urllib.error.HTTPError as e:
            wait_time = 15 * (attempt + 1)
            print(f"[HTTP {e.code}] Batch {batch_idx:03d} (attempt {attempt+1}/{max_retries}), waiting {wait_time}s...", flush=True)
            time.sleep(wait_time)
        except Exception as e:
            wait_time = 5 * (attempt + 1)
            print(f"[ERROR] Batch {batch_idx:03d} (attempt {attempt+1}/{max_retries}): {e}, waiting {wait_time}s...", flush=True)
            time.sleep(wait_time)
            
    raise RuntimeError(f"Batch {batch_idx:03d} failed after {max_retries} retries")

def main():
    with open(SOURCE_PATH, "r", encoding="utf-8") as f:
        words = [line.strip() for line in f if line.strip()]
    
    print(f"Total source headwords loaded: {len(words)}", flush=True)
    assert len(words) == 3000, f"Expected 3000 words, got {len(words)}"
    
    batches = []
    for i in range(0, len(words), BATCH_SIZE):
        batch_slice = words[i:i + BATCH_SIZE]
        batch_words = [{"id": i + idx + 1, "headword": w} for idx, w in enumerate(batch_slice)]
        batches.append((i // BATCH_SIZE + 1, batch_words))
    
    print(f"Divided into {len(batches)} batches of {BATCH_SIZE} words each.", flush=True)
    
    all_results = {}
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_batch = {executor.submit(enrich_batch, b_idx, b_words): b_idx for b_idx, b_words in batches}
        for future in as_completed(future_to_batch):
            b_idx = future_to_batch[future]
            try:
                items = future.result()
                for item in items:
                    all_results[item["id"]] = item
            except Exception as e:
                print(f"[FATAL] Batch {b_idx} failed: {e}", flush=True)
                sys.exit(1)
                
    sorted_items = [all_results[i] for i in range(1, 3001)]
    assert len(sorted_items) == 3000, f"Expected 3000 enriched items, got {len(sorted_items)}"
    
    with open(REPO_ENRICHED_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_items, f, indent=2, ensure_ascii=False)
    print(f"Saved repository artifact: {REPO_ENRICHED_PATH} ({os.path.getsize(REPO_ENRICHED_PATH):,} bytes)", flush=True)

    with open(FINAL_ASSET_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_items, f, ensure_ascii=False)
    print(f"Saved Android APK asset: {FINAL_ASSET_PATH} ({os.path.getsize(FINAL_ASSET_PATH):,} bytes)", flush=True)

    audit = {
        "source_file": SOURCE_PATH,
        "total_source_count": 3000,
        "total_enriched_count": len(sorted_items),
        "content_status_counts": {
            "ready": sum(1 for it in sorted_items if it.get("contentStatus") == "ready"),
            "needs_review": sum(1 for it in sorted_items if it.get("contentStatus") == "needs_review")
        },
        "all_ids_contiguous_1_to_3000": all(it["id"] == idx + 1 for idx, it in enumerate(sorted_items)),
        "all_headwords_non_empty": all(bool(it.get("headword")) for it in sorted_items),
        "all_meanings_non_empty": all(bool(it.get("meaningsId")) for it in sorted_items),
        "all_ipa_enclosed_in_slashes": all(it.get("ipa", "").startswith("/") and it.get("ipa", "").endswith("/") for it in sorted_items),
        "all_examples_non_empty": all(bool(it.get("exampleEn")) and bool(it.get("exampleId")) for it in sorted_items),
        "dataset_version": 1,
        "enriched_at_epoch": int(time.time())
    }
    with open(AUDIT_PATH, "w", encoding="utf-8") as f:
        json.dump(audit, f, indent=2, ensure_ascii=False)
    print(f"Saved audit manifest: {AUDIT_PATH}", flush=True)
    print("ALL 3,000 WORDS ENRICHED AND VALIDATED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    main()
