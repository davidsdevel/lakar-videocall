import {useEffect, useRef, useState, useCallback} from 'react';
import {useSocket, useUser} from '@/components/dashboard/context';
import {FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaSync, FaVideo, FaVideoSlash} from 'react-icons/fa';

const userContraints = {
  audio: true,
  video: {
    facingMode: 'user',
    'width': {'max': 426},
    'height': {'max': 240}
  }
};

const RTCconfiguration = {
      iceServers: [
        {
           urls: [
             'stun:stun.l.google.com:19302',
             'stun:stun1.l.google.com:19302',
             'stun:stun2.l.google.com:19302',
             'stun:stun3.l.google.com:19302',
             'stun:stun4.l.google.com:19302',
           ] 
        },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        }
      ]
    };

const startCall = async (socket, pc, userID, stream, friendID) => {
  pc.onicecandidate = event => {
    if (event.candidate)
      socket.emit('caller', {id: userID, candidate: event.candidate});
  };

  socket.on('offer-answer', async data => {
    if (data.id === userID)
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  });

  socket.on('callee', ({id, candidate}) => {
    if (id === userID && pc.currentRemoteDescription)
      pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  const offerDescription = await pc.createOffer({iceRestart: true});
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type
  };
  
  socket.emit('init-call', {
    from: userID,
    to: friendID,
    offer
  });
};

const joinCall = async (socket, pc, friendID) => {

  pc.onicecandidate = (event) => {
    if (event.candidate)
      socket.emit('callee', {friendID, candidate: event.candidate});
  };

  socket.on('caller', ({id, candidate}) => {
    if (id === friendID)
      pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  const offer = await new Promise(resolve => socket.emit('get-offer', friendID, resolve));
  const candidates = await new Promise(resolve => socket.emit('get-candidates', friendID, resolve));

  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    id: friendID,
    answer: {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    }
  };

  socket.emit('answer', answer);

  candidates.forEach(e => {
    const candidate = new RTCIceCandidate(e);

     pc.addIceCandidate(candidate);
  });
};

export default function Call({onEndCall, friendID, isCaller}) {
  const receiverRef = useRef(null);
  const senderRef = useRef(null);
  const pcRef = useRef(null);

  const remoteStreamRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isFrontalCamera, setIsFrontalCamera] = useState(true);
  const [signaling, setSignaling] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('');
  const [hasVideo, setHasVideo] = useState(true);
  const [ice, setIce] = useState('');

  const socket = useSocket();
  const {user, friends} = useUser();

  const endCall = useCallback(() => {
    if (pcRef.current)
      pcRef.current.close();

    if (receiverRef.current) {
      receiverRef.current.srcObject.getTracks().forEach(track => track.stop());
      receiverRef.current.srcObject = null;    
    }

    if (senderRef.current) {
      senderRef.current.srcObject.getTracks().forEach(track => track.stop());
      senderRef.current.srcObject = null;
    }

    onEndCall();
  }, [onEndCall]);

  const flipCamera = async () => {
    if (pcRef.current) {
      const oldVideo = senderRef.current.srcObject.getVideoTracks()[0];

      oldVideo.stop();

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: !isFrontalCamera ? 'user' : 'environment',
          'width': {'max': 426},
          'height': {'max': 240}
        }
      });

      const videoTrack = newStream.getVideoTracks()[0];

      const sender = pcRef.current.getSenders().find(s => s.track.kind == videoTrack.kind);

      await sender.replaceTrack(videoTrack);

      senderRef.current.srcObject.removeTrack(oldVideo);
      senderRef.current.srcObject.addTrack(videoTrack);

      setIsFrontalCamera(!isFrontalCamera);
    }
  };

  const toggleMicro = async () => {
    if (pcRef.current) {
      const track = senderRef.current.srcObject.getAudioTracks()[0];

      track.enabled = isMuted;

      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    navigator.getUserMedia(userContraints,
      localStream => {
        const remoteStream = new MediaStream();

        remoteStreamRef.current = remoteStream;
        localStreamRef.current = localStream;

        receiverRef.current.srcObject = remoteStream;
        senderRef.current.srcObject = localStream;

        const pc = new RTCPeerConnection(RTCconfiguration);

        pcRef.current = pc;

        pc.addEventListener('track', event => event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track)));

        pc.onconnectionstatechange = e => {
          setStatus(pc.connectionState);
        };
        pc.onsignalingstatechange = e => {
          setSignaling(pc.signalingState);
        };
        pc.oniceconnectionstatechange = e => {
          setIce(pc.iceConnectionState);
        };

        socket.on('end-call', endCall);

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        if (isCaller)
          startCall(socket, pc, user._id, localStream, friendID);
        else
          joinCall(socket, pc, friendID);
      },
      err => {
        alert('You need approve camera access');
      }
    );

    return () => {
      pcRef.current = null;
      senderRef.current = null;
      receiverRef.current = null;
    };
  }, [socket, endCall, friendID, user._id, isCaller]);

  return <div className='fixed w-full h-full top-0 flex flex-col items-center'>
    <div id='main-screen' className='w-full h-full bg-gray-800 grow flex items-center justify-center relative'>
      <div className='fixed w-full h-full flex items-center justify-center'>
        <img src={friends[friendID].profilePicture}/>
      </div>
      <video ref={receiverRef} className='z-10 w-full h-full max-w-full max-h-full' autoPlay/>
      <video ref={senderRef} autoPlay muted className='absolute top-4 right-4 w-24 md:w-40'/>
    </div>
    <div className='absolute z-20 bg-[#fff5] py-2 px-4 justify-between flex items-center rounded-full w-80 bottom-12'>
      <button className='flex items-center justify-center p-4 bg-red-300 rounded-full h-fit' onClick={flipCamera}>
        <FaSync/>
      </button>
      <button className='flex items-center justify-center p-4 bg-red-300 rounded-full h-fit'>
        {
          hasVideo
           ? <FaVideoSlash/>
           : <FaVideo/>
        }
      </button>
      <button className='flex items-center justify-center p-4 bg-red-300 rounded-full h-fit' onClick={toggleMicro}>
        {
          isMuted
            ? <FaMicrophone/>
            : <FaMicrophoneSlash/>
        }
      </button>
      <button className='flex items-center justify-center p-6 bg-red-500 rounded-full' onClick={() => {
        socket.emit('end-call', {from: user._id, to: friendID});
        endCall();
      }}>
        <FaPhoneSlash style={{height: 24, width: 24}}/>
      </button>
    </div>
  </div>;  
}
