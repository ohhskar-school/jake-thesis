import { useEffect } from "react";

import useStore from "@/hooks/useStore";
import { useRouter } from "next/router";

function Join() {
  const router = useRouter();
  const { setRoomDetails } = useStore();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const joinRoom = async () => {
      const data = await fetch("/api/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomUUID: router.query?.roomUUID ?? null }),
      });

      const { order, roomUUID } = await data.json();

      setRoomDetails(roomUUID, Number(order));

      router.push("/play");
    };

    joinRoom();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  if (router.query?.roomUUID) {
    return <h1>Joining Room: {router.query.roomUUID}</h1>;
  }

  return <h1>Creating Room</h1>;
}

export default Join;
