import 'bootstrap/dist/css/bootstrap.min.css';
import db from './firebaseConfig.js';
import React, {useState, useEffect} from 'react';
import { Dropdown, ButtonGroup, Button } from 'react-bootstrap';
import YouTube from 'react-youtube';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './App.css';
function App() {
  
  const [category_details, Setcategory_details] = useState([]);
  const [channel_details, Setchannel_details] = useState();
  const [category_input  , Setcategory_input] = useState("Advertisement category");
  const ad_category = ["cooking", "fitness", "tech"];
  
  useEffect(() => {
    fetch_pp_id0();
  }, [])

  const fetch_pp_id0 = async() => {
    db.collection("paid-promoters").doc("updated").get()
    .then((doc) => {
      let current_date = new Date();
      current_date = current_date.toLocaleDateString();
      if(doc.data().date < current_date){
        db.collection("paid-promoters").doc("updated").update({date: current_date});
        fetch_pp_id1();
      }
    }).catch(() => {})
  }

  const fetch_pp_id1 = async() => {
    db.collection("paid-promoters").doc("id").get()
    .then((doc) => {
      const resp_pp_id = doc.data();
      const obj_resp_pp_id = Object.keys(resp_pp_id)
      for(let i=0; i < obj_resp_pp_id.length; i++){
        fetch_pp_id2(i, resp_pp_id, obj_resp_pp_id);
      }
    }).catch(() => {})
  }

  const fetch_pp_id2 = async(i, resp_pp_id, obj_resp_pp_id) => {
    var d = [];
    for(let j=0; j < resp_pp_id[obj_resp_pp_id[i]].length; j++){
      setTimeout(() => {
      var category = obj_resp_pp_id[i];
      var channel_id = resp_pp_id[obj_resp_pp_id[i]][j];
      fetch_pp_id3(channel_id).then((data) => {d.push(data)})
      .then(() => {
        if((j+1) === resp_pp_id[obj_resp_pp_id[i]].length){
          db.collection("paid-promoters").doc("details").update({[category]: d})
        }
      }).catch(() => {})
      }, 1000*j)
    }
  }

  const fetch_pp_id3 = async(b) => {
    var d = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${b}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`)
    .then((res) => res.json())
    .then((json) => {
      var temp = json.items[0].statistics;
      return [temp.subscriberCount, temp.viewCount, temp.videoCount]
    }).catch(() => {});
    var vc = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${process.env.REACT_APP_YOUTUBE_API_KEY}&channelId=${b}&part=snippet,id&order=date&maxResults=${5}`)
    .then((res) => res.json())
    .then((json) => {
      d.push(json.items[0].id.videoId);
      d.unshift(json.items[0].snippet.channelTitle);
      d.unshift(b);
      return json.items
    }).catch(() => {})
    for(const item in vc){
      let temp = vc[item].id.videoId;
      await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${temp}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`)
      .then((res) => res.json())
      .then((json) => {
        d.push(json.items[0].statistics.viewCount)
      }).catch(() => {})
    }
    return d.join(" | ")
  }
  const fetch_pp_details = async(onspot) => {
    db.collection("paid-promoters").doc("details").get()
    .then((doc) => {
      let temp = [];
      (doc.get(onspot)).map((i) => {temp.push(i.split(" | "))})
      Setcategory_details(temp)
      Setchannel_details(temp[0])
    }).catch(() => {})
  }

  const numWords = (n) => {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + " thousand";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + " million";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + " billion";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + " trillion";
  }

  Chart.register(...registerables);
  const line_chart_data = () => {
    const datas = {
      labels: ['5', '4', '3', '2', '1'],
      datasets: [{
        label: "Latest Views Rate",
        data: [channel_details[6],channel_details[7],channel_details[8],channel_details[9],channel_details[10]],
        backgroundColor: "cyan",
        borderColor: "cyan",
        borderWidth: 3,
      }]
    };
    return datas
  }

  

  return (
    <div className="App">
      <div className="Bg001">
        <div className='Header001'>
          <img className='Logo001' src="https://lh3.googleusercontent.com/ogw/ADea4I58SlVwNZskpULql2McX5H7oxMEmRKs2PJzoV1s=s83-c-mo" alt="PPR Logo"/>
          <h1 className='Title001'>Paid Promoters Recommender</h1>
          <Dropdown style={{marginTop: "15px", marginLeft: "auto", marginRight: "30px"}}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {category_input}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {
                ad_category.map((option, id) => (<Dropdown.Item key={id} onClick={(e) => {Setcategory_input(option); fetch_pp_details(option)}}>{option}</Dropdown.Item>))
              }
            </Dropdown.Menu>
          </Dropdown>
          </div>
          <div>
            {category_input === "Advertisement category" ? <>
            <h1 style={{color: "orange", marginTop: "40vh"}}>Choose your ad category</h1>
            </> : <div className="Ranking">
              <ButtonGroup vertical>
                {
                  category_details.map((option, id) => (<Button onClick={() => Setchannel_details(option)} className="Ranking_buttons" key={id}>#{id+1}&nbsp;&nbsp;&nbsp;&nbsp;{option[1]}</Button>))
                }
              </ButtonGroup>
              <div className="Details">
                {channel_details && <>
                <h3 className="Details_title" onClick={() => window.open(`https://www.youtube.com/channel/${channel_details[0]}`)}>{channel_details[1]}</h3>
                <div className="Details_basic">
                  <h5><span style={{color: "orange"}}>Followers:</span> {numWords(channel_details[2])}</h5>
                  <h5><span style={{color: "orange"}}>Total views:</span> {numWords(channel_details[3])}</h5>
                  <h5><span style={{color: "orange"}}>Videos posted:</span> {numWords(channel_details[4])}</h5>
                </div>
                <div className="Fillups">
                <div className='Line_chart'><Line data={line_chart_data()}/></div>
                <YouTube className="Utube_vdo" videoId={channel_details[5]}/>
                </div>
                </>}
              </div>
            </div>}
          </div>
      </div>
    </div>
  );
}

export default App;
