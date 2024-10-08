import React, { useEffect, useRef, useState } from "react";
import "./Homepage.css";
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import QuestionAnswerBox from './gptQuestions';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
const fallbacks = [
  "https://p.scdn.co/mp3-preview/98e266fea9df84fa3e5ca84934c513211e89489b?cid=a77073181b7d48eb90003e3bb94ff88a",
  "https://p.scdn.co/mp3-preview/c5e4b03bcf18d2b137370569baeb74a9dfce7e63?cid=a77073181b7d48eb90003e3bb94ff88a",
  "https://p.scdn.co/mp3-preview/3f23e60bf84a17c8b9bb8f3f75c6896e41b32bbb?cid=a77073181b7d48eb90003e3bb94ff88a",
  "https://p.scdn.co/mp3-preview/5031e0d1f4e1dedd05ade1b24a3beec07d7c75ce?cid=a77073181b7d48eb90003e3bb94ff88a",
  "https://p.scdn.co/mp3-preview/1692d6f433c2e5a5d99ce5cdfcd09aa8057e3dc5?cid=a77073181b7d48eb90003e3bb94ff88a"
]

const HomePage = () => {
  const [popupInfo, setPopupInfo] = useState({ visible: false, content: "" });
  const [token, setToken] = useState(null);
  const { user, loginWithRedirect, isAuthenticated, logout } = useAuth0();
  const [song, setSong] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [isPlayListBtnVisible, setIsPlayListBtnVisible] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const navigate = useNavigate();
  const [addToFav, setAddToFav] = useState(false);

  const [playListname, setPlayListName] = useState([
    { playlistName: "helo" },
    { playlistName: "helo fdf" },
    { playlistName: "helordre" }
  ]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("userId");
    if (isAuthenticated && user && !isLoggedIn) {
      registerUserInDB(user);
    }

    if (user) {
      localStorage.setItem("userId", user.nickname);
    }
  }, [isAuthenticated, user]);

  const registerUserInDB = async (user) => {
    try {
      const response = await fetch('http://localhost:3001/reg_login_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.nickname || user.email,
          firstname: user.given_name || '',
          lastname: user.family_name || '',
          email: user.email
        })
      });

      const data = await response.json();
      if (data?.userId) {
        localStorage.setItem("userId", data.username);
      }

      if (!response.ok) {
        console.error('Failed to register user:', data.error);
      } else {
        console.log('User registered successfully:', data.message);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const getRandomFallbackUrl = () => {
    const randomIndex = Math.floor(Math.random() * fallbacks.length);
    return fallbacks[randomIndex];
  };

  const getPlaylists = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.post('http://localhost:3001/get_playlists', { userId });

      if (response.status === 200) {
        setPlayListName(response.data);
      } else {
        console.log('No playlists found for this user');
        return [];
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials&client_id=a77073181b7d48eb90003e3bb94ff88a&client_secret=68790982a0554d1a83427e061e371507",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const jsonData = await response.json();
        setToken(jsonData.access_token);
      } catch (error) {
      } finally {
      }
    };

    fetchToken();
    getPlaylists();
  }, [])

  const facts = [
    "Disco emerged in the early 1970s, primarily in New York City’s underground clubs. It was embraced by marginalized communities, including Black, Latino, and LGBTQ+ groups, making it a symbol of inclusivity and freedom.",
    "The 1977 film *Saturday Night Fever* helped catapult disco into mainstream culture. Its soundtrack, led by the Bee Gees, became one of the best-selling albums of all time.",
    "Studio 54, one of the most famous discos, became a playground for celebrities like Andy Warhol, Mick Jagger, and Diana Ross. Known for its wild parties, it symbolized the excess and glamour of the disco era.",
    "Disco revolutionized dance with moves like the Hustle and the Electric Slide. These synchronized, fluid dances became staples of disco culture and were central to the dance floor experience.",
    "DJs became central figures in disco clubs, experimenting with new sounds and creating seamless mixes that kept people dancing for hours. Legends like Larry Levan and David Mancuso were pioneers of this evolving DJ culture.",
    "Disco popularized the 12-inch single, allowing for extended tracks with more complex instrumental sections. This format gave DJs flexibility for longer mixes and more immersive dance experiences.",
    "Disco fashion was flamboyant and flashy, with sequins, platform shoes, and bell-bottoms dominating the scene. Designers like Halston created glamorous outfits that became synonymous with the disco lifestyle.",
    "Disco faced backlash from rock fans, culminating in the infamous 'Disco Demolition Night' in 1979, where records were destroyed in a public protest. This event symbolized the growing divide between musical subcultures at the time.",
    "Disco's electronic sounds laid the groundwork for house and techno music, which emerged in the 1980s. These genres evolved from disco's beats and became integral to the development of modern electronic dance music.",
    "Even after its decline in the early 1980s, disco continues to influence modern music. Artists like Daft Punk and Beyoncé have incorporated disco elements into their songs, proving its lasting appeal."
  ];

  const getRandomColorAndFact = () => {
    const colors = [
      // Shades of purple
      "#800080", "#8A2BE2", "#9400D3", "#9932CC", "#BA55D3", "#D8BFD8", "#e666bc", "#be3fd0",
      // Shades of blue
      "#0000FF", "#1E90FF", "#00BFFF", "#87CEEB", "#ADD8E6", "#B0E0E6", "#8742b0",
      // Shades of white
      "#FFFFFF", "#F8F8FF", "#FFFAFA", "#F0F8FF", "#F5F5F5"
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const fact = facts[Math.floor(Math.random() * facts.length)];
    return { color, fact };
  };

  const tiles = Array.from({ length: 100 }, (_, index) => {
    const { color, fact } = getRandomColorAndFact();
    return (
      <div
        key={index}
        className="tile"
        onClick={() => { handleTileClick(fact); fetchAndPlayRandomSong() }}
        style={{ backgroundColor: color }}
      >
      </div>
    );
  });

  const fetchAndPlayRandomSong = async () => {
    const keyword = "pop";
    const resultOffset = Math.floor(Math.random() * 50); // Random offset for different search results
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${keyword}&type=track&limit=1&offset=${resultOffset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data?.tracks?.items?.length > 0) {
      const randomSong = data.tracks.items[0];
      setSong({
        element: randomSong,
        name: randomSong.name,
        artist: randomSong.artists[0].name,
        url: randomSong.preview_url,
        image: randomSong.album?.images[0]?.url
      });
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = randomSong.preview_url || getRandomFallbackUrl();
        audioRef.current.load();

        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Failed to start audio playback:', error);
          });
      }
    } else {
      setSong(null);
    }
  }

  const handleTileClick = (fact) => {
    setPopupInfo({
      visible: true,
      content: fact,
    });
  };

  const addToFavorites = async () => {
    console.log(song);
    let { url, name, artist, image } = song;
    const userId = localStorage.getItem('userId')

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!url) {
      url = getRandomFallbackUrl()
    }
    if (!name) {
      name = 'BTS'
    }
    if (!artist) {
      artist = 'BTS'
    } if (!image) {
      image = 'https://www.earpeace.co.uk/cdn/shop/articles/Blog_header_images_58444563-e9d5-4c0e-93f1-3cbc779b11bc.png?v=1652114742'
    }

    // if (!url || !name || !artist || !image) {
    //   throw new Error('Song details (name, artist, url, image) are required');
    // }

    try {
      const response = await axios.post('http://localhost:3001/add-to-favorite', {
        url,
        name,
        artist,
        image,
        userId
      });
      return response.data; // Successful response
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error; // Propagate the error
    }
  };

  const handleAddToFav = () => {
    setAddToFav(true);
    addToFavorites();
  }

  const closePopup = () => {
    setPopupInfo({ visible: false, content: "" });
  };

  const getYouTubeVideoID = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  };

  const videoURL = "https://www.youtube.com/watch?v=Da4f95F_1b4"; // Replace with your video URL
  const videoID = getYouTubeVideoID(videoURL);

  return (
    <div className="homepage">
      <div className="video-background">
        <iframe
          src={`https://www.youtube.com/embed/${videoID}?autoplay=1&mute=1&loop=1&playlist=${videoID}`}

          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Background Video"
        ></iframe>
      </div>
      <div className="header-container">
        <Link to="/" className="text-link"> <button className="login-button">Home</button>
        </Link>
        <Link to="/musical-career-game" className="text-link"> <button className="login-button">Music Career</button>
        </Link>
        {isAuthenticated && <span className="z-10 login-button">{user.name}</span>}
        {isAuthenticated && <button className="login-button" onClick={() => navigate('/playlist')}>My Playlists</button>}
        {isAuthenticated ? <button className="login-button" onClick={() => logout()}>Logout</button> :
          <button onClick={() => loginWithRedirect()} className="login-button">Log In</button>}

      </div>

      <div className="room">
        <div className="disco-ball"></div>
        <div className="light-beam beam1"></div>
        <div className="light-beam beam2"></div>
        <div className="light-beam beam3"></div>
        <div className="light-beam beam4"></div>

        <div className="wall wall-back"></div>
        <div className="wall wall-left">
        </div>
        <div className="wall wall-right"></div>
        <div className="floor">{tiles}</div>
      </div>


      <div className="info-box">
        <h1>Groove Sync</h1>
        <div className="fact-container">
          <h2>Click the tiles!</h2>
        </div>
        <h2>Brief History of Disco</h2>
        <p>Disco is a genre of dance music that emerged in the early 1970s and became a dominant force in popular music by the mid-1970s. It originated in the United States, particularly in urban areas like New York City, and was heavily influenced by funk, soul, and Latin music. Disco is characterized by a steady four-on-the-floor beat, syncopated basslines, and orchestral elements such as strings and horns.</p>
        <p><strong>Key Milestones in Disco History:</strong></p>
        <ul>
          <li><strong>Early 1970s:</strong> Disco began in underground clubs where DJs played a mix of funk, soul, and Latin music. These clubs were often frequented by marginalized communities, including African Americans, Latinos, and the LGBTQ+ community.</li>
          <li><strong>Mid-1970s:</strong> Disco gained mainstream popularity with hits like "Love to Love You Baby" by Donna Summer and "The Hustle" by Van McCoy. The release of the film "Saturday Night Fever" in 1977, featuring John Travolta and the music of the Bee Gees, catapulted disco into the global spotlight.</li>
          <li><strong>Late 1970s:</strong> Disco reached its peak with numerous chart-topping hits and the rise of iconic artists such as Donna Summer, the Bee Gees, Gloria Gaynor, and Chic. Famous disco clubs like Studio 54 in New York City became cultural landmarks.</li>
          <li><strong>Early 1980s:</strong> Disco's popularity began to wane due to a backlash against the genre, epitomized by events like the "Disco Demolition Night" in 1979. Despite the decline in mainstream popularity, disco continued to influence other genres, including electronic dance music (EDM) and house music.</li>
          <li><strong>Legacy:</strong> Disco's influence can still be seen in modern music, fashion, and culture. Its emphasis on danceability and rhythm laid the groundwork for many contemporary dance genres.</li>
        </ul>
      </div>
      <div className="gpt-box">
        <h1>GROOVY ?</h1>
        <QuestionAnswerBox />

      </div>

      {popupInfo.visible && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={closePopup}>&times;</span>
            <p>{popupInfo.content}</p>
            <audio src={'https://p.scdn.co/mp3-preview/98e266fea9df84fa3e5ca84934c513211e89489b?cid=a77073181b7d48eb90003e3bb94ff88a'}
              id="audio" ref={audioRef} ></audio>
            <div className="card">
              <div className="cursor-pointer ratio ratio-1x1 bg-secondary bg-opacity-25">
                <img
                  width={150}
                  src={song?.element?.album?.images[0]?.url || song?.element.imageUrl || 'https://thumbs.dreamstime.com/b/vector-musical-notes-music-gray-background-illustration-eps-141771086.jpg'}
                  className="card-img-top" 
                  style={{ borderRadius: '10px' }}
                  alt="..."
                />
              </div>
              <div className="card-body">
                <h5 className="card-title justify-content-between mb-0">
                  <p className="text-elipsis">{song?.element.name || song?.element.songName}</p>
                  {isAuthenticated && <div className="add-options d-flex align-items-start">
                    <button
                      type="button"
                      className="btn btn-outline-dark mx-1 favorite-button"
                      onClick={() => handleAddToFav()}

                    >
                      {addToFav ? "Added" : "Add to Favorite"}
                    </button>
                  </div>}
                </h5>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;