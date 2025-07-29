import os

# Cartella da scansionare
cartella = "src"
riga_da_aggiungere = "@reference '../../tailwind/index.css';\n"

# Estensioni dei file da modificare (es: .css, .scss, .ts, ecc.)
estensioni = [".css", ".scss"]

for root, _, files in os.walk(cartella):
    for nome_file in files:
        if any(nome_file.endswith(ext) for ext in estensioni):
            percorso_file = os.path.join(root, nome_file)
            with open(percorso_file, "r+", encoding="utf-8") as f:
                contenuto = f.read()
                if "@apply" in contenuto and not contenuto.startswith(riga_da_aggiungere):
                    f.seek(0)
                    f.write(riga_da_aggiungere + contenuto)
                    print(f"Modificato: {percorso_file}")
