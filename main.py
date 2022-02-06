import time

from google.cloud import firestore
from bs4 import BeautifulSoup
import os, csv, requests, re

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "paid-promoters-recommender-firebase-adminsdk-vpjhv-c4c614db64.json"

db = firestore.Client()

file = open('cat.csv')
csv_reader = csv.reader(file)

data = {}
data_contact = {}
data_unapproved = {}
temp_data = []
temp_data_contact = []
temp_data_unapproved = []
for i in csv_reader:
    if len(i) == 0:
        print(f"{temp_data[0]} phase completed --- Next phase on-process ->")
        data[temp_data[0]] = temp_data[1:]
        temp_data = []
        data_contact[temp_data_contact[0]] = temp_data_contact[1:]
        temp_data_contact = []
        data_unapproved[temp_data_unapproved[0]] = temp_data_unapproved[1:]
        temp_data_unapproved = []
    else:
        try:
            r = requests.get(f"https://www.youtube.com/channel/{i[0]}/about")
            soup = BeautifulSoup(r.content, 'html.parser')
            table = soup.find("meta", itemprop="description")["content"]
            mail_id = re.findall(r"[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+", table)
            if ((r.text).find("For business enquiries") == -1) and (len(mail_id) == 0):
                temp_data_unapproved.append(i[0])
            if len(mail_id) != 0:
                temp_data_contact.append(i[0]+' | '+mail_id[0])
        except:
            temp_data_unapproved.append(i[0])
            temp_data_contact.append(i[0])
        temp_data.append(i[0])
db.collection('paid-promoters').document("unapproved").set(data_unapproved)
db.collection('paid-promoters').document("id").set(data)
db.collection('paid-promoters').document("contact").set(data_contact)