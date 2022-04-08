import 'bootstrap/dist/css/bootstrap.min.css';
import db from './firebaseConfig.js';
import React, { useState, useEffect } from 'react';
import { Dropdown, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import YouTube from 'react-youtube';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './App.css';
function App() {

  const [category_details, Setcategory_details] = useState([]);
  const [channel_details, Setchannel_details] = useState();
  const [category_details_contact, Setcategory_details_contact] = useState([]);
  const [channel_details_contact, Setchannel_details_contact] = useState();
  const [category_details_unapproved, Setcategory_details_unapproved] = useState([]);
  const [category_input, Setcategory_input] = useState("Advertisement category");
  const [category_input_result, Setcategory_input_result] = useState(10);
  const [region, Setregion] = useState("tamil");
  const [cid, Setcid] = useState("");
  const [show, setShow] = useState(false);
  const [region_options, Setregion_options] = useState([]);
  const [ad_category, Setad_category] = useState([]);
  const youtube_api_keys_tamil = [process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_0,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_1,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_2,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_3,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_4,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_5,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_6,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_7,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_8,
  process.env.REACT_APP_YOUTUBE_API_KEY_TAMIL_9];
  const youtube_api_keys_hindi = [process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_0,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_1,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_2,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_3,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_4,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_5,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_6,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_7,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_8,
  process.env.REACT_APP_YOUTUBE_API_KEY_HINDI_9];
  // const youtube_api_keys_malayalam = [process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_0,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_1,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_2,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_3,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_4,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_5,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_6,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_7,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_8,
  //                               process.env.REACT_APP_YOUTUBE_API_KEY_MALAYALAM_9];
  const youtube_api_keys_telugu = [process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_0,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_1,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_2,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_3,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_4,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_5,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_6,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_7,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_8,
  process.env.REACT_APP_YOUTUBE_API_KEY_TELUGU_9];

  useEffect(() => {
    fetch_pp_id0();
    fetch_pp_details(category_input);
    fetch_pp_contact(category_input);
    fetch_pp_unapproved(category_input)
  }, [region, category_input])

  const fetch_pp_id0 = async () => {
    db.collection("zone").doc("regions").get()
      .then((doc) => Setregion_options(doc.data().lang));
    db.collection(region).doc("updated").get()
      .then((doc) => {
        let current_date = new Date();
        let last_updated_date = new Date(doc.data().date);
        let Difference_In_Time = current_date.getTime() - last_updated_date.getTime();
        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        if (parseInt(Difference_In_Days) > 0) {
          db.collection(region).doc("updated").update({ date: current_date.toLocaleDateString() });
          fetch_pp_id1();
        } else {
          db.collection(region).doc("id").get()
            .then((doc) => {
              let resp_pp_id_category = doc.data();
              let temp_category = [];
              let obj_resp_pp_id_category = Object.keys(resp_pp_id_category)
              for (let i = 0; i < obj_resp_pp_id_category.length; i++) {
                temp_category.push(obj_resp_pp_id_category[i])
              }
              Setad_category(temp_category.sort())
            }).catch(() => { })
        }
      }).catch(() => { })
  }

  const fetch_pp_id1 = async () => {
    db.collection(region).doc("id").get()
      .then((doc) => {
        const resp_pp_id = doc.data();
        const obj_resp_pp_id = Object.keys(resp_pp_id)
        for (let i = 0; i < obj_resp_pp_id.length; i++) {
          fetch_pp_id2(i, resp_pp_id, obj_resp_pp_id);
        }
      }).catch(() => { })
  }

  const fetch_pp_id2 = async (i, resp_pp_id, obj_resp_pp_id) => {
    let d = [];
    for (let j = 0; j < resp_pp_id[obj_resp_pp_id[i]].length; j++) {
      setTimeout(() => {
        var category = obj_resp_pp_id[i];
        var channel_id = resp_pp_id[obj_resp_pp_id[i]][j];
        fetch_pp_id3(channel_id).then((data) => {
          if ((data.split(" *+ ")).length === 18) {
            d.push(data)
          }
        }).then(() => {
          if ((j + 1) === resp_pp_id[obj_resp_pp_id[i]].length) {
            db.collection(region).doc("details").update({ [category]: d })
          }
        }).catch(() => { })
      }, 1000 * j)
    }
    fetch_pp_id0();
  }

  let api_count = 0
  const fetch_pp_id3 = async (b) => {
    if (api_count === eval(`youtube_api_keys_${region}`).length - 1) {
      api_count = 0
    } else {
      api_count = api_count + 1
    }
    let youtube_api_key = eval(`youtube_api_keys_${region}`)[api_count]
    var d = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${b}&key=${youtube_api_key}`)
      .then((res) => res.json())
      .then((json) => {
        var temp = json.items[0].statistics;
        return [temp.subscriberCount, temp.viewCount, temp.videoCount]
      }).catch(() => { });
    var vc = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${youtube_api_key}&channelId=${b}&part=snippet,id&order=date&maxResults=15`)
      .then((res) => res.json())
      .then((json) => {
        d.push(json.items[0].id.videoId);
        d.push((json.items[0].snippet.publishedAt).slice(0, 10));
        d.unshift(json.items[0].snippet.channelTitle);
        d.unshift(b);
        return (json.items).slice(5, 15)
      }).catch(() => { })
    let avg = 0;
    for (let item in vc) {
      let temp = vc[item].id.videoId;
      await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${temp}&key=${youtube_api_key}`)
        .then((res) => res.json())
        .then((json) => {
          let ease = json.items[0].statistics.viewCount
          d.push(ease);
          avg = avg + parseInt(ease);
        }).catch(() => { })
    }
    d.push(parseInt(avg / 10))
    return d.join(" *+ ")
  }

  const fetch_pp_details = async (onspot) => {
    db.collection(region).doc("details").get()
      .then((doc) => {
        let temp = [];
        (doc.get(onspot)).map((i) => { temp.push(i.split(" *+ ")) })
        temp = (temp.sort(function (a, b) { return a[17] - b[17] })).reverse()
        Setcategory_details(temp)
        Setchannel_details(temp[0])
        is_contact_available(temp[0][0])
      }).catch(() => { })
  }

  const numWords = (n) => {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + " thousand";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + " million";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + " billion";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + " trillion";
  }

  const textEllipsis = (str) => {
    if (str.length > 20) {
      return str.slice(0, 20) + '...';
    } else {
      return str
    }
  }

  Chart.register(...registerables);
  const line_chart_data = () => {
    const datas = {
      labels: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'],
      datasets: [{
        label: "Past Week View Rate",
        data: [channel_details[7],
        channel_details[8],
        channel_details[9],
        channel_details[10],
        channel_details[11],
        channel_details[12],
        channel_details[13],
        channel_details[14],
        channel_details[15],
        channel_details[16]],
        backgroundColor: "rgb(233, 66, 24)",
        borderColor: "rgb(233, 66, 24)",
        borderWidth: 3,
      }]
    };
    return datas
  }

  const fetch_pp_contact = async (onspot) => {
    db.collection(region).doc("contact").get()
      .then((doc) => {
        let temp = [];
        (doc.get(onspot)).map((i) => { temp.push(i.split(" | ")) })
        Setcategory_details_contact(temp)
      }).catch(() => { })
  }

  const fetch_pp_unapproved = async (onspot) => {
    db.collection(region).doc("unapproved").get()
      .then((doc) => {
        let temp = [];
        let get = doc.get(onspot)
        if (get.length) {
          get.map((i) => { temp.push(i) })
        }
        Setcategory_details_unapproved(temp)
      }).catch(() => { })
  }

  const is_contact_available = (onspot) => {
    let j = 0
    for (let i of category_details_contact) {
      if (i[0] === onspot) {
        j = 1;
        Setchannel_details_contact(i[1])
      }
    }
    if (j === 0) {
      Setchannel_details_contact("contact_unavailable")
    }
  }

  const cid_submission = async (val) => {
    var entry = await db.collection("zone").doc("new_entry").get()
      .then((doc) => {return doc.data().id})
    await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&fields=items/id&id=${val}&key=AIzaSyBB8-ie5_GgpC3bejsBz35PV-mvAwNjdmg`)
    .then((resp) => resp.json()
    .then((aaa) => (aaa.items[0],
       db.collection("zone").doc("new_entry").update({ id: entry + " / " + val}),
       alert("Registration request successfull"),
       setShow(false)))
    .catch((xxx) => alert("Invalid Channel Id!")))
  }


  return (
    <div className="App">
      <div className="Bg001">
        <div className='Header001'>
          <img className='Logo001' src="https://lh3.googleusercontent.com/ogw/ADea4I58SlVwNZskpULql2McX5H7oxMEmRKs2PJzoV1s=s83-c-mo" alt="PPR Logo" />
          <h1 className='Title001'>Paid Promoters Recommender</h1>
          <Dropdown style={{ marginTop: "15px", marginLeft: "auto", marginRight: "-230px" }}>
            <Dropdown.Toggle variant="danger" className='Dd_btn' id="dropdown-basic">
              Max Result: {category_input_result}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ backgroundColor: "rgb(255, 222, 222)" }}>
              {
                [5, 10, 15, 20].map((option, id) => (<Dropdown.Item className='Dd_options' key={id} onClick={(e) => { Setcategory_input_result(option) }}>{option}</Dropdown.Item>))
              }
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown style={{ marginTop: "15px", marginLeft: "auto", marginRight: "-230px" }}>
            <Dropdown.Toggle variant="danger" className='Dd_btn' id="dropdown-basic">
              Region: {region.charAt(0).toUpperCase() + region.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ backgroundColor: "rgb(255, 222, 222)" }}>
              {
                region_options.map((option, id) => (<Dropdown.Item className='Dd_options' key={id} onClick={(e) => { Setregion(option) }}>{option.charAt(0).toUpperCase() + option.slice(1)}</Dropdown.Item>))
              }
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown style={{ marginTop: "15px", marginLeft: "auto", marginRight: "30px" }}>
            <Dropdown.Toggle variant="danger" className='Dd_btn' id="dropdown-basic">
              {category_input}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ backgroundColor: "rgb(255, 222, 222)" }}>
              {
                ad_category.map((option, id) => (<Dropdown.Item className='Dd_options' key={id} onClick={(e) => { Setcategory_input(option) }}>{option}</Dropdown.Item>))
              }
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div>
          {category_input === "Advertisement category" ? <>
            <h1 style={{ color: "rgb(233, 66, 24)", marginTop: "40vh" }}>Choose your region & ad category</h1>
          </> : <div className="Ranking">
            <ButtonGroup vertical>
              {
                (category_details.slice(0, category_input_result)).map((option, id) => (<Button variant="danger" onClick={() => { Setchannel_details(option); is_contact_available(option[0]) }} className="Ranking_buttons" key={id}>#{id + 1}&nbsp;&nbsp;&nbsp;&nbsp;{textEllipsis(option[1])}</Button>))
              }
            </ButtonGroup>
            <div className="Details">
              {channel_details && <>
                <h3 className="Details_title" onClick={() => window.open(`https://www.youtube.com/channel/${channel_details[0]}`)}>{channel_details[1]} {!category_details_unapproved.includes(channel_details[0]) && <>&#10004;</>}</h3>
                <div className="Details_basic">
                  <h5 className='Info_tag'><span style={{ color: "black" }}>Followers<br /></span> {
                    channel_details[2] === "" ? "Private" : numWords(channel_details[2])
                  }</h5>
                  <h5 className='Info_tag'><span style={{ color: "black" }}>Total views<br /></span> {numWords(channel_details[3])}</h5>
                  <h5 className='Info_tag'><span style={{ color: "black" }}>Videos posted<br /></span> {numWords(channel_details[4])}</h5>
                  <h5 className='Info_tag'><span style={{ color: "black" }}>Last video posted<br /></span> {channel_details[6].slice(8, 10) + '/' + channel_details[6].slice(5, 7) + '/' + channel_details[6].slice(2, 4)}</h5>
                  {
                    channel_details_contact === "contact_unavailable" ?
                      <h5 className='Info_tag' style={{ cursor: "pointer" }} onClick={() => window.open(`https://www.youtube.com/channel/${channel_details[0]}/about`)}><span style={{ color: "black" }}>Contact<br /></span> @About page</h5> :
                      <h5 className='Info_tag'><span style={{ color: "black" }}>Contact<br /></span> {String(channel_details_contact).split("@")[0]}<br />@{String(channel_details_contact).split("@")[1]}</h5>
                  }
                  <h5 className='Info_tag'><span style={{ color: "black" }}>Approx. view rate<br /></span> {numWords(channel_details[17])}</h5>
                </div>
                <div className="Fillups">
                  <div className='Line_chart'><Line data={line_chart_data()} /></div>
                  <YouTube className="Utube_vdo" videoId={channel_details[5]} />
                </div>
              </>}
            </div>
          </div>}
          <br />
          <br />
          {category_input !== "Advertisement category" ?
            <div className='Footer'>
              <h5 className="Register" onClick={() => setShow(true)}>
                Register my channel
              </h5>
              <Modal
                show={show}
                onHide={() => setShow(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title id="contained-modal-title-vcenter">
                    Register my channel
                  </Modal.Title>
                </Modal.Header>
                <br/>
                <Modal.Body>
                  <Form.Group>
                      <Form.Control type="text" required placeholder='Channel Id' value={cid} onChange={e => (Setcid(e.target.value), e.preventDefault())} />
                  </Form.Group>
                </Modal.Body>
                <br/>
                <Button variant='danger' type='submit' onClick={() => cid_submission(cid)}>Submit</Button>
              </Modal>
              <h5 className='Queries'>Any queries: paidpromotersrecommender@gmail.com</h5>
            </div> : <></>}
          <br />
        </div>
      </div>
    </div>
  );
}

export default App;