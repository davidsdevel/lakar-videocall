import {useEffect, useRef} from 'react';
import {getSocket, useUser} from '@/components/dashboard/context';

const socket = getSocket();

const userContraints = {
  audio: true,
  video: {
    facingMode: 'user',
    'width': {'max': 426},
    'height': {'max': 240}
  }
}

const RTCconfiguration = {
      iceServers: [
        {
          urls: "stun:openrelay.metered.ca:80"
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ]
    }

const startCall = async (pc, userID, stream, friendID) => {
  pc.onicecandidate = event => {
    if (event.candidate)
      socket.emit('caller', {id: userID, candidate: event.candidate});
  };

  socket.on('answer', async data => {
    if (data.id === userID) {
      delete data.id;

      await pc.setRemoteDescription(new RTCSessionDescription(data));
    }
  });

  socket.on('callee', ({id, candidate}) => {
    if (id === userID && pc.currentRemoteDescription)
      pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  const offerDescription = await pc.createOffer({iceRestart: true});
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type
  }
  
  socket.emit('init-call', {
    from: userID,
    to: friendID,
    offer
  });
}

const joinCall = async (pc, friendID) => {

  pc.onicecandidate = (event) => {
    if (event.candidate)
      socket.emit("callee", {friendID, candidate: event.candidate});
  };

  socket.on('caller', ({id, candidate}) => {
    if (id === friendID)
      pc.addIceCandidate(new RTCIceCandidate(candidate))
  });

  const offer = await new Promise(resolve => socket.emit('get_offer', friendID, resolve));
  const candidates = await new Promise(resolve => socket.emit('get_candidates', friendID, resolve));

  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    id: friendID,
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  socket.emit('answer', answer);

  candidates.forEach(e => {
    const candidate = new RTCIceCandidate(e);

     pc.addIceCandidate(candidate);
  });
}

export default function Call({onEndCall, friendID, isCaller}) {
  const receiverRef = useRef(null);
  const senderRef = useRef(null);

  const {user} = useUser();

  useEffect(() => {
    navigator.getUserMedia(userContraints,
      localStream => {
        const remoteStream = new MediaStream();

        receiverRef.current.srcObject = remoteStream;
        senderRef.current.srcObject = localStream;

        const pc = new RTCPeerConnection(RTCconfiguration);

        pc.onconnectionstatechange = e => {
          console.log(`Connection state change: ${pc.connectionState}`);
        };

        pc.addEventListener('track', event => event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track)));

        pc.onsignalingstatechange = e => console.log(`Signaling state change: ${pc.signalingState}`);
        pc.oniceconnectionstatechange = e => console.log(`ICE state change: ${pc.signalingState}`);


        if (isCaller)
          startCall(pc, user._id, localStream, friendID);
        else
          joinCall(pc, friendID);
        
      },
      err => {
        alert('You need approve camera access');
      }
    );
  }, []);
  return <div className='fixed w-full h-full top-0 bg-white flex flex-col'>
    <div id='main-screen' className='w-full bg-blue-100 grow flex items-center justify-center'>
      <video ref={receiverRef} poster='https://cdn.jsdelivr.net/gh/lettercms/lettercms/apps/cdn/images/article-details-large.jpg' autoPlay muted className='w-full'/>
      <video ref={senderRef} autoPlay muted className='absolute top-4 right-4 w-24'/>
    </div>
    <div className='w-full bg-slate-100 pt-2 pb-4 justify-evenly flex'>
      <button className='w-16 h-16 bg-red-100 rounded-full'></button>
      <button className='w-16 h-16 bg-red-500 rounded-full' onClick={() => {
        
        receiverRef.current.srcObject.getTracks().forEach(track => track.stop());
        senderRef.current.srcObject.getTracks().forEach(track => track.stop());

        onEndCall();
      }}></button>
      <button className='w-16 h-16 bg-red-100 rounded-full'></button>
    </div>
  </div>  
}
