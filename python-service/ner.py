import spacy

nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str) -> dict:
    doc = nlp(text)

    entities = {
        "organisations": [],
        "people": [],
        "locations": [],
        "money": [],
        "dates": [],
        "products": []
    }

    label_map = {
        "ORG": "organisations",
        "PERSON": "people",
        "GPE": "locations",
        "LOC": "locations",
        "MONEY": "money",
        "DATE": "dates",
        "PRODUCT": "products"
    }

    seen = set()

    for ent in doc.ents:
        category = label_map.get(ent.label_)
        if category and ent.text not in seen:
            entities[category].append(ent.text)
            seen.add(ent.text)

    return entities