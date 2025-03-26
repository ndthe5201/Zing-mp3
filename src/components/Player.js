import React, { useEffect, useState, useRef } from "react";
import * as apis from "../apis";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
// import axios from "axios";
import icons from "../ultil/icon";
import { Slider } from "antd";

import * as actions from "../store/action";

const {
  AiOutlineHeart,
  BiDotsHorizontalRounded,
  BiSkipNext,
  BiSkipPrevious,
  BsPlayCircle,
  CiRepeat,
  PiShuffleLight,
  FiPauseCircle,
  RiMovieLine,
  LiaMicrophoneAltSolid,
  BiWindows,
  BsFillVolumeUpFill,
  BiSolidPlaylist,
  BsRepeat1,
} = icons;
let intervalID;
const Player = ({setIsShow}) => {
  const { curIdSong, isPlay, songs } = useSelector((state) => state.music);
  const [songInfo, setSongInfor] = useState(null);
  const [crsecond, setCrSecond] = useState(0);
  const [source, setSource] = useState(null);
  const [audio, setAudio] = useState(new Audio());
  const [volumes, setVolumes] = useState(0.5);
  const [isShuff, setIsShuff] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const dispatch = useDispatch();
  const runTimeref = useRef();
  const trackref = useRef();
  const onChangeValue = (value) => {
    setVolumes(value / 100);
    audio.volume = value / 100;
  };


  
  // process bar

  useEffect(() => {
    intervalID && clearInterval(intervalID);
    audio.load();
    if (isPlay && runTimeref.current) {
      audio.play();
      audio.volume = volumes;
      intervalID = setInterval(() => {  
        let percent =
          Math.round((audio.currentTime * 10000) / songInfo?.duration) / 100;
        runTimeref.current.style.cssText = `right: ${100 - percent}%`;
        setCrSecond(Math.round(audio.currentTime));
      }, 10);
    }
  }, [audio, isPlay]);

  useEffect(() => {
    const handleEnded = () => {
      if (isShuff) {
        handleShuff();
      } else if (repeatMode) {
        repeatMode === 1 ? handleRepeatOne() : handleNextSong();
      }else if(isShuff && repeatMode){
        handleShuff();
        audio.play();
        dispatch(actions.play(true));
      } else {
        handleNextSong();
      }
    };
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audio, isShuff, repeatMode]);

  
  
  // Play
  const handlePlayMusic = async () => {
    // setIsPlay(prev => !prev)
    if (isPlay) {
      audio.pause();
      dispatch(actions.play(false));
    } else {
      audio.play();
      dispatch(actions.play(true));
    }
  };
  // tua nhac
  const handleClickProgesBar = (e) => {
    const tracRect = trackref.current.getBoundingClientRect();
    const percent =
      Math.round(((e.clientX - tracRect.left) * 10000) / tracRect.width) / 100;
    runTimeref.current.style.cssText = `right: ${100 - percent}%`;
    audio.currentTime = (percent * songInfo.duration) / 100;
    setCrSecond(Math.round((percent * songInfo.duration) / 100));
  };
  // next bai
  const handleNextSong = () => {
    if (!songs || songs.length === 0) return; // Kiểm tra danh sách bài hát trước
  
    let currentIndex = songs.findIndex((item) => item?.encodeId === curIdSong);
    if (currentIndex === -1) return; // Nếu không tìm thấy, thoát khỏi hàm
  
    let nextIndex = (currentIndex + 1) % songs.length;
    dispatch(actions.setCurSongId(songs[nextIndex].encodeId));
    dispatch(actions.play(true));
  };

  // prev bai
  //********************************************************
  const handlePrevSong = () => {
    if (!songs || songs.length === 0) return;
  
    let currentIndex = songs.findIndex((item) => item?.encodeId === curIdSong);
    if (currentIndex === -1) return;
  
    let prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    dispatch(actions.setCurSongId(songs[prevIndex]?.encodeId));
    dispatch(actions.play(true));
  };

  //Ngau nhien
  const handleShuff = () => {
    const randomIndex = Math.round(Math.random() * songs?.length) - 1;
    dispatch(actions.setCurSongId(songs[randomIndex].encodeId));
    dispatch(actions.play(true));
    // setIsShuff((prev) => !prev);
    console.log(isShuff);
    // songs.splice(randomIndex, 1);
    // // console.log(songs)
  };

  const handleRepeatOne = () => {
    // console.log('repeat one')
    audio.play();
  };

  return (
    <div className="play_control">
      <div className="detail_song">
        <div className="ava_thumb">
          {/* ***************************************** */}
          <img src={songInfo?.thumbnail} alt="thumbnail" />
        </div>
        <div className="song_infor">
          <p>{songInfo?.title}</p>

          <span>{songInfo?.artistsNames}</span>
        </div>

        <div className="like_action">
          <span>
            <AiOutlineHeart size={21} />
          </span>

          <span>
            <BiDotsHorizontalRounded size={21} />
          </span>
        </div>
      </div>

      <div className="main_control">
        <div className="control">
          <span
            title="Bật phát ngẫu nhiên"
            onClick={() => setIsShuff((prev) => !prev)}
            className={`${!isShuff ? "isFalse" : "isTrue"}`}
          >
            <PiShuffleLight size={21} />
          </span>
          <span>
            <BiSkipPrevious
              size={27}
              onClick={handlePrevSong}
              className={`${!songs ? "bur_next" : "btn_next"}`}
            />
          </span>
          <span onClick={handlePlayMusic}>
            {isPlay ? <FiPauseCircle size={40} /> : <BsPlayCircle size={40} />}
          </span>
          <span
            onClick={handleNextSong}
            className={`${!songs ? "bur_next" : "btn_next"}`}
          >
            <BiSkipNext size={27} />
          </span>
          <span
            title="Bật phát lại tất cả"
            className={`${!repeatMode ? "isFalse" : "isTrue"}`}
            onClick={() => setRepeatMode((prev) => (prev === 2 ? 0 : prev + 1))}
          >
            {/* <CiRepeat size={21} /> */}
            {repeatMode === 1 ? (
              <BsRepeat1 size={21} />
            ) : (
              <CiRepeat size={21} />
            )}
          </span>
          {/* <span><FiPauseCircle size={27}/></span> */}
        </div>
        <div className="progress_bar">
          <span className="time_progress">
            {moment.utc(crsecond * 1000).format("mm:ss")}
          </span>
          <div ref={trackref} className="track" onClick={handleClickProgesBar}>
            <div ref={runTimeref} className="run_time">
              <div className="run_time-dot"></div>
            </div>
          </div>
          <span className="time_progress">
            {moment.utc(songInfo?.duration * 1000).format("mm:ss")}
          </span>
        </div>
      </div>

      <div className="volume">
        <div className="el_hover">
          <RiMovieLine size={27} />
        </div>

        <div className="el_hover">
          <LiaMicrophoneAltSolid size={27} />
        </div>

        <div className="el_hover">
          <BiWindows size={27} style={{ fontWeight: 200 }} />
        </div>

        <div className="volume_zone">
          <BsFillVolumeUpFill size={27} />
          <div>
            <Slider
              defaultValue={50}
              onChange={onChangeValue}
              className="volume_action"
              tooltip={{
                formatter: null,
              }}
            />
          </div>
        </div>

        <div className="btn_playlist">
          <div className="playlist_action" 
          onClick={()=> setIsShow(prev => !prev)}
          >
            <BiSolidPlaylist size={23} />
          </div>
        </div>
      </div>
    </div>
  );
};



export default Player;
