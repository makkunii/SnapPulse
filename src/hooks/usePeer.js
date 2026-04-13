import { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';

export const usePeer = (isHost, id, isLocked) => {
  const [peerId, setPeerId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [incomingData, setIncomingData] = useState(null);

  const peerRef = useRef(null);
  const connMapRef = useRef({}); // 🔥 store persistent connections

  const isLockedRef = useRef(isLocked);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    const peer = new Peer(id);
    peerRef.current = peer;

    peer.on('open', (newId) => setPeerId(newId));

    if (isHost) {
      // HOST SIDE
      peer.on('connection', (conn) => {
        connMapRef.current[conn.peer] = conn;

        conn.on('open', () => {
          setConnections(prev => [...prev, conn]);
        });

        conn.on('data', (data) => {
          if (isLockedRef.current) {
            if (conn.open) {
              conn.send({ type: 'EVENT_LOCKED' });
            }
            return;
          }

          setIncomingData({ ...data, __peer: conn.peer });

          // ACK
          if (conn.open) {
            conn.send({ type: 'MEDIA_RECEIVED' });
          }
        });

        conn.on('close', () => {
          delete connMapRef.current[conn.peer];
          setConnections(prev => prev.filter(c => c.peer !== conn.peer));
        });
      });

    } else {
      // GUEST SIDE
      peer.on('connection', (conn) => {
        connMapRef.current[conn.peer] = conn;

        conn.on('data', (data) => {
          setIncomingData(data);
        });

        conn.on('close', () => {
          delete connMapRef.current[conn.peer];
        });
      });
    }

    return () => peer.destroy();
  }, [isHost, id]);

  // 🔥 FIXED sendData (persistent connection)
  const sendData = (targetId, data) => {
    return new Promise((resolve, reject) => {
      let conn = connMapRef.current[targetId];

      // 🔥 reuse connection if exists
      if (conn && conn.open) {
        conn.send(data);
        resolve(conn);
        return;
      }

      // 🔥 create ONLY if not exists
      conn = peerRef.current.connect(targetId);
      connMapRef.current[targetId] = conn;

      const timeout = setTimeout(() => {
        conn.close();
        delete connMapRef.current[targetId];
        reject(new Error("Connection timeout"));
      }, 5000);

      conn.on('open', () => {
        clearTimeout(timeout);
        conn.send(data);
        resolve(conn);
      });

      conn.on('data', (incoming) => {
        setIncomingData(incoming);
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        delete connMapRef.current[targetId];
        reject(err);
      });

      conn.on('close', () => {
        delete connMapRef.current[targetId];
      });
    });
  };

  return { peerId, incomingData, connections, sendData };
};