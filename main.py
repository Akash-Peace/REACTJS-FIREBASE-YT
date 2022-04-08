from google.cloud import firestore
from bs4 import BeautifulSoup
import os, csv, requests, re, pandas as pd, matplotlib.pyplot as plt, pickle, numpy as np, scikitplot as skplt, seaborn as sns
from googletrans import Translator
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import chi2
from sklearn.model_selection import train_test_split
from sklearn import linear_model, metrics
from sklearn.metrics import confusion_matrix

stop = stopwords.words('english')
translator= Translator()
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "paid-promoters-recommender-firebase-adminsdk-vpjhv-c4c614db64.json"
db = firestore.Client()


def create_dataset():
    file = open(f'channel_id.csv')
    csv_reader = csv.reader(file)

    datas = {}
    temp_data = []
    classes_ex_id = []
    classes_ex_cleantext = []
    classes_ex_category = []
    classes_id = []
    classes_cleantext = []
    classes_category = []

    for i in csv_reader:
        if len(i) == 0:
            print(f"{temp_data[0]} phase completed --- Next phase on-process ->")
            datas[temp_data[0]] = temp_data[1:]
            temp_data = []
        else:
            try:
                r = requests.get(f"https://www.youtube.com/channel/{i[0]}/about")
                soup = BeautifulSoup(r.content, 'html.parser')
                table = soup.find("meta", itemprop="description")["content"]
                tt = soup.find("meta", itemprop="name")["content"] + " - " + table.replace("\n", " ")
                classes_ex_id.append(i[0])
                classes_ex_cleantext.append(tt)
                classes_ex_category.append(temp_data[0])
                translation = translator.translate(tt, dest="en")
                text = translation.text.lower()
                text = re.sub(r"(@\[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)|^rt|http.+?", " ", text)
                text = " ".join([word for word in text.split() if word not in (stop)])
                stemmer = PorterStemmer()
                text = "".join([stemmer.stem(word) for word in text])
                common_words = ["subscribe", "share", "like", "follow", "query", "sponsor", "sponsorship", "dear",
                                "friend", "tamil", "hindi", "telugu", "chennai", "about", "love", "tamilnadu", "nadu",
                                "supporting", "enquiry", "enquiries", "inquiry", "inqueries", "hi", "hello", "videos",
                                "video", "mail", "email", "gmail", "advertisement", "ad", "ads", "promotion",
                                "business", "copyright", "disclaimer", "welcome", "youtube", "channel", "please",
                                "support", "donate", "join", "thank", "thanks", "thankyou", "instagram", "facebook",
                                "twitter", "discord", "whatsapp", "channels", "check", "contact", "friends", "paid"]
                querywords = text.split()
                resultwords = [word for word in querywords if word not in common_words]
                classes_id.append(i[0])
                classes_cleantext.append(' '.join(resultwords))
                classes_category.append(temp_data[0])
            except:
                pass
            temp_data.append(i[0])

    data = pd.DataFrame({'Channel_Id': classes_ex_id, 'Description': classes_ex_cleantext, 'Category': classes_ex_category})
    data.to_csv('channel_id_extraction.csv')
    data = pd.DataFrame({'Channel_Id': classes_id, 'Clean_text': classes_cleantext, 'Category': classes_category})
    data.to_csv('channel_id_cleantext.csv')

    le = LabelEncoder()
    le.fit(data.Category)
    data.Category = le.transform(data.Category)

    tfidf_title = TfidfVectorizer(sublinear_tf=True, min_df=5, norm='l2', encoding='latin-1', ngram_range=(1, 2), stop_words='english')
    labels = data.Category
    features_title = tfidf_title.fit_transform(data.Clean_text).toarray()
    # print('Title Features Shape: ' + str(features_title.shape))
    data['Category'].value_counts().sort_values(ascending=False).plot(kind='bar', y='Number of Samples', title='Number of samples for each class')
    plt.show()

    for current_class in list(le.classes_):
        current_class_id = le.transform([current_class])[0]
        features_chi2 = chi2(features_title, labels == current_class_id)
        indices = np.argsort(features_chi2[0])
        feature_names = np.array(tfidf_title.get_feature_names_out())[indices]
        unigrams = [v for v in feature_names if len(v.split(' ')) == 1]
        print("# '{}':".format(current_class))
        print("Most correlated unigrams:")
        print('-' * 30)
        print('. {}'.format('\n. '.join(unigrams[-5:])))
        print("\n")

    X_train, X_test, y_train, y_test = train_test_split(data.iloc[:, 1:2], data['Category'], random_state=0)
    X_train_title_features = tfidf_title.transform(X_train['Clean_text']).toarray()
    pickle.dump(tfidf_title, open("transform.pickle", "wb"))
    features = np.concatenate([X_train_title_features], axis=1)
    svm = linear_model.SGDClassifier(loss='modified_huber', max_iter=1000, tol=1e-3).fit(features, y_train)
    pickle.dump(svm, open('final_model.sav', 'wb'))

    X_test_title_features = tfidf_title.transform(X_test['Clean_text']).toarray()
    test_features = np.concatenate([X_test_title_features], axis=1)
    y_pred = svm.predict(test_features)
    y_probas = svm.predict_proba(test_features)
    print(metrics.classification_report(y_test, y_pred, target_names=list(le.classes_)))

    conf_mat = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots(figsize=(10, 10))
    sns.heatmap(conf_mat, annot=True, fmt='d', xticklabels=list(le.classes_), yticklabels=list(le.classes_))
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.title('Confusion Matrix - SVM')
    plt.show()

    skplt.metrics.plot_precision_recall_curve(y_test, y_probas)
    plt.title('Precision-Recall Curve - SVM')
    plt.show()

def update_region():
    regions = ["tamil", "telugu", "hindi"]
    region = int(input("REGIONS\n1. Tamil\n2. Telugu\n3. Hindi\nEnter a number to select a region: "))

    file = open(f'{regions[region - 1]}.csv')
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
                    temp_data_contact.append(i[0] + ' | ' + mail_id[0])
            except:
                temp_data_unapproved.append(i[0])
                temp_data_contact.append(i[0])
            temp_data.append(i[0])

    db.collection(regions[region - 1]).document("unapproved").set(data_unapproved)
    db.collection(regions[region - 1]).document("id").set(data)
    db.collection(regions[region - 1]).document("contact").set(data_contact)
    db.collection("zone").document("regions").set({"lang": regions})

def add_new_id():

    file = open(f'new_entry.csv')
    csv_reader = csv.reader(file)

    combined_csv = pd.concat([pd.read_csv(f) for f in ["tamil.csv", "telugu.csv", "hindi.csv"]])
    combined_csv.to_csv("combined_region.csv", index=False, encoding='utf-8-sig')
    combined_csv_reader = [o[0] if len(o)!=0 else " " for o in csv.reader(open("combined_region.csv"))]
    lang_dict = {"ta": "tamil", "te": "telugu", "hi": "hindi"}
    already = 0

    for i in csv_reader:
        if i[0] in combined_csv_reader:
            already = 1
            #print(f"This Id({i[0]}) is already registered.")
        r = requests.get(f"https://www.youtube.com/channel/{i[0]}/about")
        soup = BeautifulSoup(r.content, 'html.parser')
        table = soup.find("meta", itemprop="description")["content"]
        tt = soup.find("meta", itemprop="name")["content"] + " - " + table.replace("\n", " ")
        translation = translator.translate(tt, dest="en")
        text = translation.text.lower()
        text = re.sub(r"(@\[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)|^rt|http.+?", " ", text)
        text = " ".join([word for word in text.split() if word not in (stop)])
        stemmer = PorterStemmer()
        text = "".join([stemmer.stem(word) for word in text])
        common_words = ["subscribe", "share", "like", "follow", "query", "sponsor", "sponsorship", "dear",
                        "friend", "tamil", "hindi", "telugu", "chennai", "about", "love", "tamilnadu", "nadu",
                        "supporting", "enquiry", "enquiries", "inquiry", "inqueries", "hi", "hello", "videos",
                        "video", "mail", "email", "gmail", "advertisement", "ad", "ads", "promotion",
                        "business", "copyright", "disclaimer", "welcome", "youtube", "channel", "please",
                        "support", "donate", "join", "thank", "thanks", "thankyou", "instagram", "facebook",
                        "twitter", "discord", "whatsapp", "channels", "check", "contact", "friends", "paid"]
        querywords = text.split()
        resultwords = [word for word in querywords if word not in common_words]

        data = pd.DataFrame({'text': [" ".join(resultwords)]})
        loaded_model = pickle.load(open('final_model.sav', 'rb'))
        loaded_trans = pickle.load(open('transform.pickle', 'rb'))
        mapping = {'Business': 0, 'Cine Entertainment': 1, 'Cine Review': 2,
                   'Cooking': 3, 'Cryptocurrency': 4, 'Dance': 5,
                   'Education': 6, 'Entertainment': 7, 'Fashion & Beauty': 8,
                   'Fitness': 9, 'Food Review': 10, 'Gaming': 11,
                   'Memes': 12, 'Music': 13, 'Reactions': 14,
                   'Share Market': 15, 'Spirituality': 16, 'Sports': 17,
                   'Tech Education': 18, 'Tech Review': 19, 'Travel': 20}

        X_test_title_features = loaded_trans.transform(data['text']).toarray()
        test_features = np.concatenate([X_test_title_features], axis=1)
        predicted_category = loaded_model.predict(test_features)
        category = [k for k, v in mapping.items() if v == predicted_category[0]]

        region = 'unknown'
        for j in ['tamil', 'telugu', "hindi"]:
            for k in text.split():
                if j in k:
                    region = j
        if region == 'unknown':
            for j in tt.split():
                lang = str(translator.detect(j)).split()[0][-3:-1]
                if lang in ["ta", "te", "hi"]:
                    region = lang_dict[lang]
        if region == 'unknown':
            r = requests.get(f"https://www.googleapis.com/youtube/v3/search?key=AIzaSyBB8-ie5_GgpC3bejsBz35PV-mvAwNjdmg&channelId={i[0]}&part=id&order=date&maxResults=1")
            vid = r.json()['items'][0]['id']['videoId']
            r = requests.get(f'https://www.googleapis.com/youtube/v3/videos?part=snippet&id={vid}&key=AIzaSyBB8-ie5_GgpC3bejsBz35PV-mvAwNjdmg')
            lang = r.json()['items'][0]["snippet"]['defaultAudioLanguage']
            if lang in ['ta', 'te', 'hi']:
                region = lang_dict[lang]
        if region != 'unknown':
            if already == 0:
                file = open(f'{region}.csv')
                csv_reader = [i[0] if len(i) != 0 else " " for i in csv.reader(file)]
                for k, j in enumerate(csv_reader):
                    if j == category[0]:
                        csv_reader.insert(k + 1, i[0])
                with open(f'{region}.csv', 'w') as ff:
                    writer = csv.writer(ff)
                    writer.writerows([[k] for k in csv_reader])
                    file.close()
            print(f"Registered: {i[0]} - {region} - {category[0]}")
        else:
            print("Can't find the region of this Id!")

def new_entry_cloud():
    entry = db.collection("zone").document("new_entry").get({'id'}).to_dict()
    entry = list(set(entry['id'].split(' / ')))[1:]

    with open(f'new_entry.csv', 'w') as ff:
        writer = csv.writer(ff)
        writer.writerows([[k] for k in entry])
        ff.close()

        db.collection("zone").document("new_entry").set({"id": "start"})

fn = int(input("PPR developer side:\n1. Add new data\n2. Update & upload to cloud\n3. Create dataset model\n4. Extract new entry requests from cloud\nEnter a number to do an operation: "))
if fn == 1:
    add_new_id()
elif fn == 2:
    update_region()
elif fn == 3:
    add_new_id()
elif fn == 4:
    new_entry_cloud()
else:
    print("Please, Select a right operation!")
