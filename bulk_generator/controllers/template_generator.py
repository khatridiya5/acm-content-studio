# pip install anthropic
# Usage:
#   python generate_template.py --event "HackNITS 2026" --theme "cyberpunk, neon purple and cyan" --orientation landscape
#   python generate_template.py --event "Annual Meet" --theme "minimal, white and gold" --orientation portrait --notes "show 'VOLUNTEER' badge text"
import  argparse, base64, re
from google import genai
from dotenv import load_dotenv
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BASE_DIR / r"(?:^|[/\\])\.env(?:\.[\w-]+)*$"

load_dotenv(ENV_PATH)

api_key = os.getenv("GEMINI_API_KEY")
model_name=os.getenv("MODEL")

prompt_path="./data/prompt.txt"
output_path="./templates/template.svg"

with open(prompt_path, "r", encoding="utf-8") as f:
    PROMPT = f.read()

REQUIRED = ["{{name}}", "{{position}}", "{{department}}", "{{roll_no}}", "{{photo}}", "__LOGO__"]
SIZES = {"portrait": (54, 85.6), "landscape": (85.6, 54)}

ap = argparse.ArgumentParser()
ap.add_argument("--event", required=True)
ap.add_argument("--theme", required=True)
ap.add_argument("--orientation", choices=SIZES, required=True)
ap.add_argument("--notes", default="none")
ap.add_argument("--out", default="template.svg")
a = ap.parse_args()

w, h = SIZES[a.orientation]
prompt = (PROMPT.replace("<<EVENT>>", a.event).replace("<<THEME>>", a.theme)
          .replace("<<NOTES>>", a.notes).replace("<<ORIENTATION>>", a.orientation)
          .replace("<<W>>", str(w)).replace("<<H>>", str(h)))

client = genai.Client()  # uses ANTHROPIC_API_KEY
logo = base64.b64encode(open("ACM_logo.png", "rb").read()).decode()

for attempt in range(1, 4):
    resp = client.models.generate_content(model="gemini-2.0-flash",
                                  messages=[{"role": "user", "content": prompt}])
    svg = re.sub(r"^```(?:svg|xml)?\s*|\s*```$", "", resp.content[0].text.strip()).strip()
    missing = [p for p in REQUIRED if p not in svg]
    if not svg.startswith(("<svg", "<?xml")) or missing or f'viewBox="0 0 {w} {h}"' not in svg:
        print(f"Attempt {attempt} rejected (missing: {missing or 'none'}, check size/viewBox).")
        continue
    open(a.out, "w", encoding="utf-8").write(svg.replace("__LOGO__", logo))
    print(f"Saved {a.out} ({a.orientation}, {w}x{h} mm)")
    break
else:
    print("No valid template after 3 attempts. Run again.")