import os
import csv
import pandas as pd

# geburten_raw.csv
# "StichtagDatJahr","SexCd","SexKurz","QuarSort","QuarLang","StatZoneSort","StatZoneLang","AnzGebuWir"

# csv einlesen
data = pd.read_csv('geburten_raw.csv')
data_edited = data.rename(columns = {"StichtagDatJahr": "year",
                                    "SexKurz": "sex",
                                    "AnzGebuWir": "people"})

# geburten_clean_sex_separated.csv
# Bereinigtes csv (Weiblich und männlich getrennt)
# "StichtagDatJahr",SexKurz","AnzGebuWir"
data_grouped_by_birthday = data_edited.groupby(["year", "sex"])
data_grouped_by_birthday['people'].sum().to_csv('geburten_clean_sex_separated.csv')