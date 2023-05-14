import useStore from "@/hooks/useStore";
import QRCode from "react-qr-code";

function ordinalSuffixOf(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

function InviteQR() {
  const { order, roomUUID } = useStore();

  const link = `http://localhost:5052/join?roomUUID=${roomUUID}`;
  return (
    <section>
      <h2>Invite other people!</h2>

      <h3>Room ID: {roomUUID}</h3>

      <p>Scan QR Code:</p>
      <QRCode value={link} />
      <p>
        or <a href={link}>click here</a>
      </p>

      <br />

      <p>You are {ordinalSuffixOf(order + 1)} in sequence</p>
    </section>
  );
}

export default InviteQR;
