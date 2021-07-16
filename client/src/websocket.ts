const ws = () => {
  const newWs = new WebSocket("ws://localhost:3000");
  // console.log('start', newWs);
  newWs.onopen = () => console.log("connected to websocket");

  return newWs;
};

export default ws;