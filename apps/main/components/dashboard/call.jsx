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
        'stun:stun4.l.google.com:19302'
      ] 
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

const startCall = async (socket, pc, stream, callID, to) => {
  pc.onicecandidate = event => {
    if (event.candidate)
      socket.emit('caller', {callID, candidate: event.candidate});
  };

  socket.on('offer-answer', async data => {
    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  });

  socket.on('callee', ({candidate}) => {
    if (pc.currentRemoteDescription)
      pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  const offerDescription = await pc.createOffer({iceRestart: true});
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type
  };
  
  socket.emit('init-call', {
    callID,
    to,
    offer
  });
};

const joinCall = async (socket, pc, callID) => {

  pc.onicecandidate = (event) => {
    if (event.candidate)
      socket.emit('callee', {callID, candidate: event.candidate});
  };

  socket.on('caller', ({id, candidate}) => {
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  const offer = await new Promise(resolve => socket.emit('get-offer', callID, resolve));
  const candidates = await new Promise(resolve => socket.emit('get-candidates', callID, resolve));

  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    callID,
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

export default function Call({onEndCall, friendID, isCaller, callID}) {
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

        //Get CallID
          if (isCaller) {
            socket.emit('get-call-id', {from: user._id, to: friendID}, _callID => {
              startCall(socket, pc, localStream, _callID, friendID);
            });
          } else {
            joinCall(socket, pc, callID);
          }
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
  }, [socket, endCall, friendID, user._id, isCaller, callID]);

  return <div className='fixed w-full h-full top-0 flex flex-col items-center'>
    <div id='main-screen' className='w-full h-full bg-gray-800 grow flex items-center justify-center relative'>
      <div className='fixed top-4 left-4 bg-[#0003] p-4 rounded-lg text-white fot-bold z-30'>
        <div>Status: {status}</div>
        <div>Signaling: {signaling}</div>
        <div>ICE: {ice}</div>
      </div>  
      <div className='fixed w-full h-full flex items-center justify-center'>
        <img src={friends[friendID].profilePicture} alt=''/>
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
