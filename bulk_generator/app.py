# pip install cairosvg pypdf
# CSV columns: name, position, department, roll_no, photo   (photo = path like photos/U23CS101.jpg)
import csv, io, os, base64
import pandas as pd
from xml.sax.saxutils import escape
import cairosvg
from PIL import Image
from data.db import DB

mongo=DB()

mongo.connect_db()

template_path="assets/acm_front.svg"
out_path="result"

DPI=600
TEMPLATE = open(template_path, encoding="utf-8").read()
os.makedirs(out_path, exist_ok=True)

def photo_uri(path):
    ext = os.path.splitext(path)[1][1:].lower().replace("jpg", "jpeg")
    with open(path, "rb") as f:
        return f"data:image/{ext};base64," + base64.b64encode(f.read()).decode()

def fit_font(text, base=4.6, max_chars=18):
    """Shrink the name font for long names."""
    return base if len(text) <= max_chars else max(2.8, base * max_chars / len(text))


persons=mongo.get_collection("members")

# rows=persons.shape[0]

for person in persons.find():
    svg = TEMPLATE
    # shrink long names (name font-size is 4.6 in the template)
    svg = svg.replace('font-size="4.6"', f'font-size="{fit_font(person["name"]):.2f}"')
    for key in ("name", "position", "department", "roll_no"):
        svg = svg.replace("{{" + key + "}}", escape(person.get(key, "")))

    svg = svg.replace("{{photo}}", photo_uri(person["image_url"].strip()))

    with open(f"{out_path}/{person['roll_no']}.svg", "w", encoding="utf-8") as out:
        out.write(svg)

    png = cairosvg.svg2png(bytestring=svg.encode("utf-8"), dpi=DPI, background_color="white")
    Image.open(io.BytesIO(png)).convert("RGB").save(
                f"{out_path}/{person['roll_no']}.jpg", "JPEG", quality=95, subsampling=0, dpi=(DPI, DPI)
                )



# with open(csv_path, newline="", encoding="utf-8-sig") as f:
#     for row in csv.DictReader(f):
#         svg = TEMPLATE
#         # shrink long names (name font-size is 4.6 in the template)
#         svg = svg.replace('font-size="4.6"', f'font-size="{fit_font(row["name"]):.2f}"')
#         for key in ("name", "position", "department", "roll_no"):
#             svg = svg.replace("{{" + key + "}}", escape(row.get(key, "")))
#         svg = svg.replace("{{photo}}", photo_uri(row["photo"]))

#         pdf = cairosvg.svg2pdf(bytestring=svg.encode("utf-8"))
#         with open(f"{out_path}/{row['roll_no']}.pdf", "wb") as out:
#             out.write(pdf)
#         for page in PdfReader(io.BytesIO(pdf)).pages:
#             combined.add_page(page)

print(f"Done. See the {out_path}.")