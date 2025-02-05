import { BsSend } from "react-icons/bs";
import { GiBrain } from "react-icons/gi";
import { IoAddCircleOutline } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import geminiImg from "./assets/gemini.png";
import userImg from "./assets/user.jpg";
import toggle from "./assets/toggle.svg";
import toggleR from "./assets/toggleR.svg";

import { useEffect, useRef, useState } from "react";
import run from "./gemini/config";

function App() {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [historyMood, setHistoryMood] = useState(false);
  const [checked, setChecked] = useState(false);
  const [message, setMessages] = useState(() => {
    const savedResult = sessionStorage.getItem("messages");
    return savedResult ? JSON.parse(savedResult) : [];
  });

  // Get Local Storage Data
  const savedResult = localStorage.getItem("history");
  const history = savedResult ? JSON.parse(savedResult) : [];
  const uniqueDates = [...new Set(history.map((item) => item.date))];

  //Filter Session By Date For Left Sidebar
  const result = uniqueDates.map((date) => {
    const sessions = history.filter((item) => item.date === date);
    const sessionId =
      sessions.length > 0 ? sessions[sessions.length - 1].sessionId : null;
    return {
      date,
      sessionId,
      contents: sessions?.map((session) =>
        session.data.filter((elem) => elem.type === "input").pop()
      ),
    };
  });

  //Set Previous Message to Show
  const findSession = (id) => {
    const gotSession = history.filter((element) => element.sessionId == id);
    if (gotSession) {
      setHistoryMood(true); //Not Saved History Session Twice
      setMessages(gotSession[0].data);
    } else {
      return null;
    }
  };

  //Saved New Message
  const saveToMessage = (newItem) => {
    setMessages((prevMessages) => {
      const updatedItems = [...prevMessages, newItem];
      sessionStorage.setItem("messages", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  //Generate Current Date
  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  //Save New Session in Storage With Date & ID
  const saveToHistory = () => {
    if (message.length > 0) {
      const newSessionData = {
        sessionId: Math.floor(1000 + Math.random() * 9000),
        date: getFormattedDate(),
        data: message,
      };

      const existingHistory = JSON.parse(localStorage.getItem("history")) || [];
      existingHistory.push(newSessionData);
      localStorage.setItem("history", JSON.stringify(existingHistory));
    }
  };

  //Delete Button Function
  const clearHistory = () => {
    localStorage.removeItem("history");
  };

  //Save Session When Page unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (historyMood === false) {
        saveToHistory();
      }
      sessionStorage.removeItem("messages");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, historyMood]);

  //Message Sent Button Function
  const submit = async (e) => {
    e.preventDefault();
    const prompt = inputRef.current.value;
    saveToMessage({ type: "input", text: prompt });
    inputRef.current.value = "";
    const result = await onSent(prompt);
    saveToMessage({ type: "gemini", text: result });
  };

  //Sent & Get Messages From Gemini run Function
  const onSent = async (prompt) => {
    setLoading(true);
    try {
      const response = await run(prompt);
      return response;
    } catch {
      return "I'm Now Offline";
    } finally {
      setLoading(false);
    }
  };

  //End A Session For New Chat Button
  const endSessionStorage = () => {
    if (historyMood === false) {
      saveToHistory();
    }
    {
      setHistoryMood(false);
    }
    sessionStorage.removeItem("messages");
    setMessages([]);
  };

  //Scroll To Bottom
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  //Scroll Down Conversation To Last Message
  const bottomRef = useRef();
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [message]);

  return (
    <>
      <div className="bg-[#121828] w-full h-screen max-h-screen overflow-auto scrollbar-none flex justify-end">
        {/* Left Side Panel Section */}
        <section
          className={`w-[20%] max-h-screen space-y-2 ${
            checked ? "xs:block sm:hidden" : "xs:hidden sm:block"
          } transition-all duration-500 ease-in-out`}
        >
          <div className="pt-3 px-2 flex justify-between items-center">
            <img
              onClick={() => setChecked((checked) => !checked)}
              src={toggle}
              alt=""
              className={` ${
                checked ? "xs:block sm:hidden" : "xs:hidden sm:block"
              } cursor-pointer`}
            />
            <img
              src={geminiImg}
              alt=""
              className="w-6 rounded-full cursor-pointer"
            />
          </div>

          <header className="flex flex-col md:flex-row justify-start items-center text-white my-5 px-2 xs:gap-1 sm:gap-2">
            <div className="">
              <GiBrain className="xs:text-2xl sm:text-5xl animate-pulse" />
            </div>
            <div className="">
              <p className="xs:text-[12px] sm:text-lg font-spartan">Mahim AI</p>
              <p className="xs:text-[10px] sm:text-sm font-kaushan">
                by Gemini
              </p>
            </div>
          </header>

          <div onClick={() => endSessionStorage()} className="px-2 sm:py-2">
            <div className="w-full flex justify-center items-center rounded-xl xs:gap-1 sm:gap-2 mx-auto xs:h-8 sm:h-10 text-white cursor-pointer bg-sky-400 hover:bg-sky-500">
              <IoAddCircleOutline className="xs:text-[25px] sm:text-lg" />
              <p className="xs:hidden sm:block sm:text-lg font-spartan">New Chat</p>
            </div>
          </div>

          <div className="flex justify-between items-center px-2  border-b-[1px] border-gray-600">
            <p className="text-white pb-1 xs:text-sm sm:text-md font-kaushan">
              History
            </p>
            <MdDelete
              onClick={() => {
                clearHistory(), window.location.reload();
              }}
              className="text-gray-400 hover:scale-110 hover:text-white cursor-pointer"
            />
          </div>

          <div className="max-h-[390px] px-2 space-y-2 overflow-y-auto scrollbar-none hover:scrollbar-thin ">
            {result?.map((session) => (
              <div key={session.date} className="space-y-1">
                <p className="text-xs">{session.date}</p>
                {session.contents?.map((data, index) => (
                  <p
                    onClick={() => findSession(session.sessionId)}
                    key={index}
                    className="line-clamp-2 xs:text-sm sm:text-md font-spartan text-white hover:text-sky-400 cursor-pointer"
                  >
                    {data.text}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Chats Right Panel Section */}
        <section
          className={`${
            checked ? "xs:w-[80%] sm:w-[100%]" : "xs:w-[100%] sm:w-[80%]"
          } bg-[#d9f1f7] max-h-screen min-h-screen transition-all duration-1000 ease-in-out`}
        >
          <div className="w-full flex flex-col  min-h-screen">
            {/* Header Navbar */}
            <header
              className={`h-12 flex items-center gap-2 ${
                checked ? "xs:pl-2 sm:pl-5" : "pl-4"
              } `}
            >
              <img
                onClick={() => setChecked(!checked)}
                src={toggleR}
                alt=""
                className={` ${
                  !checked ? "xs:block sm:hidden" : "xs:hidden sm:block"
                } cursor-pointer`}
              />
              <p className="text-black font-semibold font-spartan text-xl">
                Gemini AI
              </p>
            </header>

            {/* Main Chat Box */}
            <main className="w-full mx-auto max-h-[calc(100vh-108px)] min-h-[calc(100vh-108px)] overflow-y-scroll xs:scrollbar-none md:scrollbar-thin pt-2 px-5">
              {message.length == 0 && (
                <div className=" text-black ">
                  <div className="flex justify-center items-center sm:pt-20">
                    <BsRobot className="text-6xl text-black" />
                  </div>
                  <p className="text-center text-4xl font-semibold font-kaushan pt-2">
                    Welcome to the chatbot
                  </p>
                  <p className=" text-center text-sm font-semibold font-nunito pt-1">
                    Your personal AI compinion by Gemini
                  </p>
                  <div className="xs:w-full sm:max-w-[80%] flex justify-center items-center gap-2 mx-auto mt-10">
                    <div className="w-1/3 h-32 space-y-2 rounded-xl p-1 ">
                      <p className="text-center font-semibold font-kaushan text-sm">
                        Explore Topics
                      </p>
                      <p className="xs:h-[180px] xl:h-20 text-center text-sm bg-white p-2 py-4 font-spartan">
                        &quot;Can you help me understand quantum physics? I
                        would love to learn more about it!&quot;
                      </p>
                    </div>
                    <div className="w-1/3 h-32 space-y-2 rounded-xl p-1">
                      <p className="text-center font-semibold font-kaushan text-sm">
                        Find Answer
                      </p>
                      <p className="xs:h-[180px] xl:h-20 text-center text-sm bg-white p-2 py-4 font-spartan">
                        &quot;How do I create a resume that stands out? I want
                        to impress potential employers!&quot;
                      </p>
                    </div>
                    <div className="w-1/3 h-32 space-y-2 rounded-xl p-1">
                      <p className="text-center  font-semibold font-kaushan text-sm">
                        Gain Your Skill
                      </p>
                      <p className="xs:h-[180px] xl:h-20 text-center text-sm bg-white p-2 py-4 font-spartan">
                        &quot;What are the key principles of effective
                        communication? I want to improve my skills!&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {message?.map((answer, index) => (
                <div
                  key={index}
                  className={`chat ${
                    answer.type == "input" ? "chat-end" : "chat-start"
                  }  w-full h-full`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full border-2 border-black">
                      <img
                        src={answer.type == "gemini" ? geminiImg : userImg}
                        alt=""
                        className="object-contain "
                      />
                    </div>
                  </div>
                  <div
                    className="chat-bubble text-white xs:text-sm sm:text-md font-nunito bg-[#2676ee] xs:max-w-[90%] sm:max-w-[70%]"
                    dangerouslySetInnerHTML={{
                      __html: answer.text
                        ?.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br />")
                        .replace(/^\s]\s+/gm, "<p class='list-item'>"),
                    }}
                  ></div>
                  <div ref={bottomRef} />
                </div>
              ))}
              {loading && (
                <div className={`chat chat-start  w-full h-full`}>
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full border-2 border-black">
                      <img src={geminiImg} alt="" className="object-contain " />
                    </div>
                  </div>
                  <div className="chat-bubble text-white text-lg bg-[#2676ee] xs:max-w-[90%] sm:max-w-[70%] flex items-center justify-center h-full">
                    <div className="typing-indicator">
                      <div className="dot bg-white"></div>
                      <div className="dot bg-white"></div>
                      <div className="dot bg-white"></div>
                    </div>
                  </div>
                  <div ref={bottomRef} />
                </div>
              )}
              <div />
            </main>

            {/* Footer */}
            <div className="xs:w-[90%] sm:w-2/3 max-h-10 relative bg-white h-auto flex justify-center items-end rounded-lg cursor-default outline-none mb-5  m-auto gap-1 ">
              <textarea
                type="text"
                placeholder="Ask me anything......"
                rows="1"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    100
                  )}px`;
                  if (e.target.scrollHeight > 100) {
                    e.target.style.overflowY = "auto";
                  } else {
                    e.target.style.overflowY = "hidden";
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      submit(e);
                    }
                  }
                }}
                name="text"
                ref={inputRef}
                className="bg-white text-black w-full min-h-10 rounded-lg cursor-text outline-none scrollbar-none resize-none p-2"
              />
              <div className="h-10 flex items-center justify-cente border-l-[1px] border-blue-600">
                <BsSend
                  onClick={(e) => submit(e)}
                  className="text-blue-600 w-10 h-9 p-1 cursor-pointer hover:text-green-400 hover:scale-110"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
