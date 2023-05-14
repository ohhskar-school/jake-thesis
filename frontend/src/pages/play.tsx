import { useEffect, useState } from "react";

import InviteQR from "@/components/InviteQR";
import useStore from "@/hooks/useStore";
import { socket } from "@/socket";
import { useRouter } from "next/router";

enum STATES {
  "PRELOADING",
  "IDLING",
  "PLAYING",
  "END",
}

async function preloadVideo(src: string) {
  const res = await fetch(src);
  const blob = await res.blob();
  const buf = await blob.arrayBuffer();
  return URL.createObjectURL(new Blob([buf]));
}

function Play() {
  const router = useRouter();
  const { order, roomUUID } = useStore();
  const [currentState, setCurrentState] = useState<STATES>(STATES.PRELOADING);
  const [videoBlobURL, setVideoBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!roomUUID) {
      router.push("/join");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // Handle On Start
  useEffect(() => {
    socket.on("connect", () => socket.emit("create", { roomUUID }));

    socket.on("start-video", () => {
      setCurrentState(STATES.PLAYING);
    });
  }, [roomUUID]);

  // Handle Preloading
  useEffect(() => {
    if (!(currentState === STATES.PRELOADING) || !roomUUID) {
      return;
    }

    const preloadVideoBasedOnOrder = async (order: number, roomUUID: string) => {
      const blobURL = await preloadVideo(`http://localhost:5052/videos/new1.webm`);

      setCurrentState(STATES.IDLING);
      setVideoBlobUrl(blobURL);
      socket.emit("complete-preload", { roomUUID, order });
    };

    preloadVideoBasedOnOrder(order, roomUUID);
  }, [currentState, order, roomUUID]);

  switch (currentState) {
    case STATES.IDLING:
    case STATES.PRELOADING: {
      return <InviteQR />;
    }

    case STATES.PLAYING: {
      return <>{videoBlobURL && <video autoPlay muted src={videoBlobURL} width="400" />} </>;
    }

    default:
      return null;
  }
}

export default Play;
